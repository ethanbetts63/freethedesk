"""What the staff users pages know that the shared package cannot.

Supplied through `FTP_AUTH["ACCOUNT_DIRECTORY"]`; see
../freetheplatform/_docs/apps/auth.md. Roles follow `core.principal`, except
that an account with no portal is listed as "none" here rather than refused.

Sales are read through `all_objects`, with the account itself as the scope: a
customer's sales deliberately cross dealers, which is the one place the tenant
manager's refusal does not apply (see `core.models.tenancy`).
"""

from freetheplatform.auth.staff import AccountDirectory
from freetheplatform.messaging.models import Message

from core.models import Enquiry
from dealers.models import Dealer
from sales.models import Sale
from seo.models import SeoSubscriber

ROWS = 25
ADMIN = "/dashboard/admin"


def _section(key, title, queryset, row):
    return {
        "key": key,
        "title": title,
        "total": queryset.count(),
        "rows": [row(item) for item in queryset[:ROWS]],
    }


class FreeTheDeskAccountDirectory(AccountDirectory):
    roles = (
        ("staff", "Staff"),
        ("dealer", "Dealer"),
        ("seo", "SEO subscriber"),
        ("customer", "Customer"),
        ("none", "No portal"),
    )

    def role(self, user):
        if user.is_staff:
            return "staff"
        if Dealer.objects.filter(user=user).exists():
            return "dealer"
        if SeoSubscriber.objects.filter(user=user).exists():
            return "seo"
        if Sale.all_objects.filter(account=user).exists():
            return "customer"
        return "none"

    def filter_role(self, queryset, role):
        non_staff = queryset.filter(is_staff=False)
        dealers = Dealer.objects.values("user_id")
        seo = SeoSubscriber.objects.values("user_id")
        customers = Sale.all_objects.filter(account__isnull=False).values("account_id")
        if role == "staff":
            return queryset.filter(is_staff=True)
        if role == "dealer":
            return non_staff.filter(pk__in=dealers)
        if role == "seo":
            return non_staff.filter(pk__in=seo).exclude(pk__in=dealers)
        if role == "customer":
            return non_staff.filter(pk__in=customers).exclude(pk__in=dealers).exclude(pk__in=seo)
        return non_staff.exclude(pk__in=dealers).exclude(pk__in=seo).exclude(pk__in=customers)

    def activity(self, user):
        email = (user.email or "").strip()
        nothing = {"pk__in": []}
        return [
            _section(
                "dealer", "Dealer account", Dealer.objects.filter(user=user),
                lambda d: {
                    "reference": d.business_name,
                    "summary": d.get_plan_display(),
                    "status": d.status,
                    "date": d.created_at,
                    "href": f"{ADMIN}/dealers/{d.pk}",
                },
            ),
            _section(
                "seo", "SEO subscription", SeoSubscriber.objects.filter(user=user),
                lambda s: {
                    "reference": s.business_name,
                    "summary": s.get_plan_display(),
                    "status": s.status,
                    "date": s.created_at,
                    "href": f"{ADMIN}/seo/{s.pk}",
                },
            ),
            _section(
                "sales", "Sales",
                Sale.all_objects.filter(account=user).select_related("dealer").order_by("-created_at"),
                lambda s: {
                    "reference": s.reference,
                    "summary": f"{s.dealer.business_name}: {s.year or ''} {s.make} {s.model_name}".strip(),
                    "status": s.status,
                    "date": s.created_at,
                    # No staff page for a sale; it belongs to the dealer's portal.
                    "href": None,
                },
            ),
            _section(
                "enquiries", "Enquiries",
                Enquiry.objects.filter(**({"email__iexact": email} if email else nothing)),
                lambda e: {
                    "reference": f"#{e.pk}",
                    "summary": e.get_help_with_display(),
                    "status": e.status,
                    "date": e.created_at,
                    "href": f"{ADMIN}/enquiries/{e.pk}",
                },
            ),
            _section(
                "messages", "Messages sent",
                Message.objects.filter(**({"to__iexact": email} if email else nothing)).order_by("-created_at"),
                lambda m: {
                    "reference": m.message_type,
                    "summary": m.subject,
                    "status": m.status,
                    "date": m.created_at,
                    "href": f"{ADMIN}/messages/{m.pk}",
                },
            ),
        ]
