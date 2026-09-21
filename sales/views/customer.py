"""The customer's own side of a sale.

Unauthenticated in the sense that there is no account, and not unauthenticated
at all in the sense that matters: every view below resolves the sale from an
access cookie in ``initial()`` and raises otherwise, so a handler cannot be
added that forgets the check. Allbikes arrived at that base class after writing
the same four lines nine times, and the convention had already failed once by
then.

``/sale/...`` on the frontend must stay **out** of ``PROTECTED_PREFIXES`` in
``proxy.ts``. The edge check there redirects anything without an auth cookie to
``/login``, and a customer holding a perfectly valid link has no auth cookie and
never will.
"""

from django.db import transaction
from django.utils import timezone
from freetheplatform.auth.throttling import ScopedAnonThrottle, ThrottleCacheMixin
from rest_framework.exceptions import APIException
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.views import APIView

from core.utils.security import client_ip
from documents.warranty import acknowledgement_key, warranty_notice
from sales.models import Sale
from sales.requirements import details_are_editable
from sales.serializers.customer_sale import (
    CustomerSaleDetailsSerializer,
    CustomerSaleSerializer,
)
from sales.transitions import record
from sales.utils.access import (
    access_has_ended,
    access_is_locked,
    burn_a_hash,
    check_access_password,
    clear_access_failures,
    cookie_name,
    record_access_failure,
    set_access_cookie,
)

from .documents import build_or_explain, warranty_notice_or_explain


class SaleAccessDenied(APIException):
    """No usable access cookie for this sale.

    An exception rather than a returned response, so the check can live in
    ``initial()`` and apply to every handler on the view by construction.
    """

    status_code = 403
    default_detail = "Open the link we emailed you, or sign in with your reference."
    default_code = "sale_access_denied"


class SaleLoginThrottle(ThrottleCacheMixin, SimpleRateThrottle):
    """Slows password guessing against one sale.

    Keyed on the reference rather than on the caller's address, because the
    reference is effectively the username here and the address is not the thing
    being attacked. Per-IP alone gets this wrong in both directions: a shared
    office NAT locks its own customers out of unrelated sales, while anyone with
    a modest pool of addresses gets effectively unlimited attempts at a single
    reference.

    Paired with ``SaleLoginIPThrottle`` below. One bounds how hard any one sale
    can be hammered, the other how much of that one source can do.
    """

    scope = "sale-login"

    def get_cache_key(self, request, view):
        reference = (view.kwargs.get("reference") or "").strip().upper()
        if not reference:
            return None
        return self.cache_format % {"scope": self.scope, "ident": reference}


class SaleLoginIPThrottle(ScopedAnonThrottle):
    """The per-caller half. Stops one source working through many references."""

    scope = "sale-login-ip"


class CustomerSaleView(APIView):
    """Base for every view that resolves a sale from its access cookie."""

    authentication_classes = []
    permission_classes = [AllowAny]

    def get_sale(self, request, reference):
        """Resolve the sale this request is a capability for.

        ``all_objects`` rather than ``for_dealer`` — the one place in the
        codebase where the tenant guard is stepped around inside a request. A
        customer has no dealer to scope by, and scoping is not what is missing:
        the access token in the cookie *is* the scope, and it names exactly one
        row. See `core.models.tenancy`, which otherwise reserves this manager
        for staff, management commands and migrations.
        """
        token = (request.COOKIES.get(cookie_name(reference)) or "").strip()
        if not token:
            return None
        sale = (
            Sale.all_objects.select_related("dealer", "dealer__user")
            .filter(reference=reference, access_token=token)
            .first()
        )
        if sale is None or access_has_ended(sale):
            return None
        return sale

    def dispatch(self, request, *args, **kwargs):
        self.sale = None
        return super().dispatch(request, *args, **kwargs)

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        self.sale = self.get_sale(request, kwargs["reference"])
        if not self.sale:
            raise SaleAccessDenied()


def overview(sale):
    return Response(CustomerSaleSerializer(sale).data)


class SaleRedeemView(APIView):
    """Trade the token in the emailed link for the long-lived access cookie.

    Redeeming a token the caller already possesses grants nothing new, so this
    is not a second way in. What it does is take the token out of the URL: a
    link sitting in an inbox, forwarded or screenshotted, stops being a live
    credential once it has been redeemed on the customer's own device.
    """

    throttle_scope = "sale-access"

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, reference):
        token = (request.data.get("access_token") or "").strip()
        if not token:
            return Response({"detail": "This link is missing its token."}, status=403)
        sale = (
            Sale.all_objects.select_related("dealer", "dealer__user")
            .filter(reference=reference, access_token=token)
            .first()
        )
        # One answer for a token that is wrong and a reference that does not
        # exist. Distinguishing them would turn this into a way to find out
        # which references are real.
        if sale is None:
            return Response({"detail": "This link is no longer valid."}, status=403)
        if access_has_ended(sale):
            return Response({"detail": "This sale has been cancelled."}, status=403)
        return set_access_cookie(overview(sale), sale)


#: One sentence for every way this can fail — wrong reference, wrong password,
#: cancelled sale, locked. Distinguishing them would tell somebody which
#: references are real and exactly when to come back.
LOGIN_REFUSED = {"detail": "Wrong reference or password."}


class SaleLoginView(APIView):
    """Recovery on another device: the reference plus the emailed password.

    The two throttles cap how fast this can be worked at. What actually makes
    the password hard to guess is the lockout in `sales.utils.access`, which is
    a durable row rather than a cache entry — see the note there, and section 5
    of the security standard, which is explicit that a rate limit is not the
    credential control.
    """

    throttle_classes = [SaleLoginThrottle, SaleLoginIPThrottle]

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, reference):
        password = (request.data.get("password") or "").strip()
        sale = (
            Sale.all_objects.select_related("dealer", "dealer__user")
            .filter(reference=reference)
            .first()
        )
        if sale is None or access_has_ended(sale):
            # No row to check against, so nothing has been spent. Spend it
            # anyway: a reference that does not exist must not answer faster
            # than one that does.
            burn_a_hash()
            return Response(LOGIN_REFUSED, status=403)
        if access_is_locked(sale):
            return Response(LOGIN_REFUSED, status=403)
        if not check_access_password(sale, password):
            record_access_failure(sale)
            return Response(LOGIN_REFUSED, status=403)
        clear_access_failures(sale)
        return set_access_cookie(overview(sale), sale)


class SaleOverviewView(CustomerSaleView):
    throttle_scope = "sale-customer"

    def get(self, request, reference):
        return overview(self.sale)


class SaleDetailsView(CustomerSaleView):
    """Where the customer supplies what their documents need."""

    throttle_scope = "sale-customer"

    def patch(self, request, reference):
        sale = self.sale
        if not details_are_editable(sale):
            return Response(
                {
                    "detail": "Your part of this sale is finished, so these details are "
                    "now with the dealer. Contact them if something needs changing."
                },
                status=409,
            )

        with transaction.atomic():
            # Locked for the length of the write. This is a read-modify-write of
            # one row that two people reach: a customer double-submitting on a
            # phone, and a dealer correcting a name while the customer types one.
            # Without the lock the later write is computed from a copy read
            # before the earlier one, and one of the two edits disappears.
            sale = Sale.all_objects.select_for_update().get(pk=sale.pk)
            # `dealer` and its user were loaded when the cookie was resolved.
            # Handing them to the locked copy keeps the response off two queries
            # for rows this request has not touched.
            sale.dealer = self.sale.dealer

            serializer = CustomerSaleDetailsSerializer(sale, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)

            changed = {
                field
                for field, value in serializer.validated_data.items()
                if value != getattr(sale, field)
            }
            # `details_updated_at` goes through the same save rather than a
            # second one. It is what document staleness is measured against, so
            # it moves only when something actually changed — stamping
            # unconditionally would make every document permanently stale.
            sale = serializer.save(
                **({"details_updated_at": timezone.now()} if changed else {})
            )
            if changed:
                record(
                    sale,
                    "details.updated",
                    actor_label=f"{sale.customer_name} (customer)",
                    ip_address=client_ip(request),
                    user_agent=request.META.get("HTTP_USER_AGENT", ""),
                    fields=sorted(changed),
                )
        return overview(sale)


class SaleWarrantyView(CustomerSaleView):
    """Acknowledging the warranty notice, which is its own gate before signing.

    Reg 7 requires the statement be given *before* the sale. The key the client
    sends is checked against a freshly computed one rather than trusted, so a
    customer acknowledging a notice on a stale tab — one written before the
    dealer changed the price — is told to read the current one instead of
    silently acknowledging something that no longer applies.
    """

    throttle_scope = "sale-customer"

    def post(self, request, reference):
        sale = self.sale
        if sale.vehicle_price is None:
            return Response(
                {"detail": "Your dealer has not set a price yet, so the warranty "
                           "information is not ready."},
                status=409,
            )
        current = warranty_notice(sale)
        if request.data.get("acknowledgement_key") != current["acknowledgement_key"]:
            return Response(
                {"detail": "This sale changed since that notice was shown. Please read "
                           "the current version."},
                status=409,
            )

        sale.warranty_acknowledgement_key = acknowledgement_key(sale)
        sale.warranty_acknowledged_at = timezone.now()
        sale.save(
            update_fields=[
                "warranty_acknowledgement_key",
                "warranty_acknowledged_at",
                "updated_at",
            ]
        )
        record(
            sale,
            "warranty.acknowledged",
            actor_label=f"{sale.customer_name} (customer)",
            ip_address=client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            form=current["kind"],
            statement=current["statement"],
        )
        return overview(sale)


class SaleWarrantyNoticeView(CustomerSaleView):
    """The prescribed form itself, for the customer to read."""

    throttle_scope = "document-render"

    def get(self, request, reference):
        return warranty_notice_or_explain(self.sale)


class SaleDocumentView(CustomerSaleView):
    """A document for the customer to read before they sign it."""

    throttle_scope = "document-render"

    def get(self, request, reference, kind):
        from documents.build import document_kinds_for

        if kind not in document_kinds_for(self.sale):
            return Response({"detail": "Not found."}, status=404)
        return build_or_explain(self.sale, kind)
