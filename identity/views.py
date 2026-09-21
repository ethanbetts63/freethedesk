"""Reaching the identity images, from either side.

Two authorisations, one streaming helper. The customer reaches their own uploads
through the sale access cookie; the dealer reaches them through their session and
tenant scope. Sharing the streaming and not the authorisation is deliberate — the
mechanical part is mechanical, and the part that decides who may look at a
stranger's driver's licence stays visible at each call site.

The files sit outside ``MEDIA_ROOT`` precisely so no webserver will hand them
out, which makes these views the entire access-control story for them.
"""

from django.http import FileResponse
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from core.utils.security import client_ip
from dealers.utils.uploads import ALLOWED_UPLOADS, validate_and_rename_upload
from identity import services
from identity.api import verification_for_sale, verification_payload
from identity.models import Verification
from identity.notifications import send_identity_rejected
from sales.serializers.customer_sale import CustomerSaleSerializer
from sales.serializers import DealerSaleSerializer
from sales.views.customer import CustomerSaleView
from sales.views.dealer import DealerSaleQuerysetMixin
from rest_framework.views import APIView

#: A licence is photographed, not scanned to PDF. Narrowing the pipeline's
#: allowed set here rather than loosening it: a PDF of a driver's licence is a
#: thing somebody made rather than a thing they took, and the dealer is being
#: asked to look at a photograph.
IMAGE_TYPES = {name: value for name, value in ALLOWED_UPLOADS.items() if name != "application/pdf"}

EXTENSIONS = {extension for extension, _prefixes in IMAGE_TYPES.values()}


def image_response(stored_file) -> FileResponse:
    """Stream one identity image inline.

    ``nosniff`` because a browser second-guessing the type of a file a stranger
    uploaded is exactly the case it exists for, and ``inline`` because the dealer
    is looking at it beside the form rather than filing it.
    """
    extension = stored_file.name.rsplit(".", 1)[-1].lower()
    content_type = next(
        (name for name, (ext, _prefixes) in IMAGE_TYPES.items() if ext == extension),
        "application/octet-stream",
    )
    response = FileResponse(stored_file.open("rb"), content_type=content_type)
    response["Content-Disposition"] = "inline"
    response["X-Content-Type-Options"] = "nosniff"
    return response


# --- the customer -----------------------------------------------------------


class SaleIdentityUploadView(CustomerSaleView):
    """Where the customer sends one photograph.

    Same pipeline as every other upload in the product: sniffed by bytes, fully
    parsed with bounded pixel counts, renamed to the verified type, stored
    outside ``MEDIA_ROOT``. Nothing here is a new control.
    """

    throttle_scope = "sale-upload"
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, reference, side):
        upload = request.FILES.get("image")
        if not upload:
            return Response({"image": ["Choose a photo to send."]}, status=400)

        verified, error = validate_and_rename_upload(upload)
        if error or verified.name.rsplit(".", 1)[-1] not in EXTENSIONS:
            return Response(
                {"image": ["Send a photo — JPG, PNG or WebP."]},
                status=400,
            )

        verification = services.verification_for(self.sale)
        try:
            # Taking the return value, not reusing the argument: the service
            # re-reads the row under a lock, so the object it hands back is the
            # one that was written and the one passed in is already behind.
            verification = services.store_image(
                verification,
                side,
                verified,
                actor_label=f"{self.sale.customer_name} (customer)",
                ip_address=client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
            )
        except services.IdentityError as error:
            return Response({"detail": str(error)}, status=409)
        return Response(verification_payload(verification))


class SaleIdentitySubmitView(CustomerSaleView):
    throttle_scope = "sale-customer"

    def post(self, request, reference):
        verification = services.verification_for(self.sale)
        try:
            services.submit(
                verification,
                actor_label=f"{self.sale.customer_name} (customer)",
                ip_address=client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
            )
        except services.IdentityError as error:
            return Response({"detail": str(error)}, status=409)
        self.sale.refresh_from_db()
        return Response(CustomerSaleSerializer(self.sale).data)


class SaleIdentityImageView(CustomerSaleView):
    """The customer's view of their own upload."""

    throttle_scope = "sale-customer"

    def get(self, request, reference, side):
        verification = verification_for_sale(self.sale)
        if verification is None or side not in Verification.SIDES:
            return Response({"detail": "Not found."}, status=404)
        image = verification.image(side)
        if not image:
            return Response({"detail": "Not found."}, status=404)
        return image_response(image)


# --- the dealer -------------------------------------------------------------


class DealerSaleIdentityImageView(DealerSaleQuerysetMixin, APIView):
    """The only route to a customer's licence photograph from the dealer side."""

    throttle_scope = "portal"  # A dealer or subscriber acting on their own record.

    def get(self, request, reference, side):
        sale = self.dealer_sales().filter(reference=reference).first()
        verification = verification_for_sale(sale) if sale else None
        if verification is None or side not in Verification.SIDES:
            return Response({"detail": "Not found."}, status=404)
        image = verification.image(side)
        if not image:
            return Response({"detail": "Not found."}, status=404)
        return image_response(image)


class DealerSaleIdentityReviewView(DealerSaleQuerysetMixin, APIView):
    """Approve or reject one image, with a reason the customer will read."""

    throttle_scope = "portal"  # A dealer or subscriber acting on their own record.

    def post(self, request, reference, side):
        sale = self.dealer_sales().filter(reference=reference).first()
        if sale is None:
            return Response({"detail": "Not found."}, status=404)
        verification = verification_for_sale(sale)
        if verification is None:
            return Response({"detail": "Nothing has been uploaded yet."}, status=409)

        approved = request.data.get("approved")
        if approved not in (True, False):
            return Response({"approved": ["Choose approve or reject."]}, status=400)
        reason = str(request.data.get("reason") or "")[:2000]

        try:
            verification = services.review(
                verification,
                side,
                approved=approved,
                reason=reason,
                user=request.user,
                ip_address=client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
            )
        except services.IdentityError as error:
            return Response({"detail": str(error)}, status=409)

        if not approved:
            # Sent after the transaction the service ran, not inside it. A
            # rejection the customer was not told about is a sale that stops
            # dead, so this failing is worth seeing as its own failure rather
            # than as a rolled-back review.
            send_identity_rejected(sale, verification)

        sale.refresh_from_db()
        return Response(DealerSaleSerializer(sale).data)
