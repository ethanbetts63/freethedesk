"""freethedesk's half of `freetheplatform.invoicing`: who the seller is, how an invoice is sent, and
where a customer's details come from.

The seller is the staff-edited ``InvoiceSettings`` singleton. The business is not registered for
GST, so ``FTP_INVOICING["TAX_REGISTERED"]`` is off and nothing on an invoice reads as tax.
"""

from django.conf import settings
from django.db.models import Q
from freetheplatform.invoicing import SendResult
from freetheplatform.messaging import Message, send

from dealers.models import Dealer
from seo.models import SeoSubscriber

from .models import Enquiry, InvoiceSettings

LOGO = settings.BASE_DIR / "frontend" / "public" / "logo-mark.png"
#: `--blue-600`, the brand's action blue.
ACCENT = "#2473c6"
#: Results per record type in the customer picker, newest first.
PER_SOURCE = 5


def seller():
    details = InvoiceSettings.load()
    return {
        "name": details.business_name,
        "legal_name": details.legal_name,
        "abn": details.abn,
        "address": details.address,
        "email": details.email,
        "phone": details.phone,
        "website": details.website,
        "logo": str(LOGO),
        "logo_is_mark": True,
        "accent": ACCENT,
        "bank": {
            "account_name": details.bank_account_name,
            "bsb": details.bank_bsb,
            "account_number": details.bank_account_number,
        },
        "payment_note": details.payment_note,
    }


def send_invoice(invoice, *, to, subject, body, attachments):
    message = send(
        to=to,
        channel="email",
        message_type="invoice",
        subject=subject,
        body=body,
        related=invoice,
        attachments=attachments,
    )
    return SendResult(
        sent=message.status == Message.Status.SENT,
        detail=message.error_message,
        suppressed=message.status == Message.Status.SUPPRESSED,
    )


def _enquiry(enquiry):
    return {
        "customer": {
            "customer_name": enquiry.name,
            "customer_company": enquiry.business,
            "customer_email": enquiry.email,
            "customer_phone": enquiry.phone,
        },
        "lines": [{"description": enquiry.get_help_with_display(), "quantity": 1, "unit_price": "0.00"}],
    }


def _dealer(dealer):
    profile = getattr(dealer, "profile", None)
    locality = " ".join(filter(None, [getattr(profile, "suburb", ""), dealer.state, getattr(profile, "postcode", "")]))
    return {
        "customer": {
            "customer_name": dealer.contact_name,
            "customer_company": (profile.legal_name if profile and profile.legal_name else dealer.business_name),
            "customer_email": dealer.user.email if dealer.user_id else "",
            "customer_phone": dealer.phone,
            "customer_abn": profile.abn if profile else "",
            "customer_address": [locality] if locality else [],
        },
        "lines": [],
    }


def _seo_subscriber(subscriber):
    return {
        "customer": {
            "customer_name": subscriber.contact_name,
            "customer_company": subscriber.business_name,
            "customer_email": subscriber.email,
            "customer_phone": subscriber.phone,
        },
        "lines": [{"description": f"SEO report ({subscriber.get_plan_display()})", "quantity": 1, "unit_price": "0.00"}],
    }


PREFILLERS = {Enquiry: _enquiry, Dealer: _dealer, SeoSubscriber: _seo_subscriber}


def prefill(obj):
    """A new invoice's customer and lines for one of our records; an unknown record gets nothing."""
    builder = PREFILLERS.get(type(obj))
    return builder(obj) if builder else {}


def customer_search(query):
    """Enquiries, dealers and SEO customers whose name, business or email matches."""
    sources = (
        ("Enquiry", Enquiry.objects.filter(Q(name__icontains=query) | Q(business__icontains=query) | Q(email__icontains=query)), lambda e: (e.business or e.name, e.email)),
        ("Dealer", Dealer.objects.select_related("user", "profile").filter(Q(business_name__icontains=query) | Q(contact_name__icontains=query) | Q(user__email__icontains=query)), lambda d: (d.business_name, d.contact_name)),
        ("SEO customer", SeoSubscriber.objects.filter(Q(business_name__icontains=query) | Q(contact_name__icontains=query) | Q(email__icontains=query)), lambda s: (s.business_name, s.email)),
    )
    results = []
    for source, queryset, describe in sources:
        for record in queryset.order_by("-created_at")[:PER_SOURCE]:
            label, detail = describe(record)
            results.append({
                "label": label,
                "detail": detail,
                "source": source,
                "customer": prefill(record)["customer"],
                "related": record,
            })
    return results
