from django.core.exceptions import ObjectDoesNotExist
from freetheplatform.payments import Payment, PaymentStatus
from rest_framework import serializers

from affiliates.models import Affiliate

from ..utils.setup import is_setup_complete, setup_steps
from .admin import AdminSeoSubscriberSerializer
from .setup_step import SeoSetupStepSerializer


class AdminSeoSubscriberDetailSerializer(AdminSeoSubscriberSerializer):
    """One subscriber, with the setup checklist the list leaves out, and the sale."""

    setup = serializers.SerializerMethodField()
    sale = serializers.SerializerMethodField()

    def get_setup(self, obj):
        """The checklist, once there is one: it starts at payment."""
        if not obj.has_paid:
            return None
        return {
            "steps": SeoSetupStepSerializer(setup_steps(obj), many=True).data,
            "complete": is_setup_complete(obj),
        }

    def get_sale(self, obj):
        """What was paid and with which code, from the payment that succeeded; null until then."""
        payment = Payment.objects.for_related(obj).filter(status=PaymentStatus.SUCCEEDED).first()
        if payment is None:
            return None
        try:
            redemption = payment.discount_redemption
        except ObjectDoesNotExist:
            redemption = None
        affiliate = redemption.discount.owner if redemption is not None else None
        return {
            "amount_paid": str(payment.total_amount),
            "paid_at": payment.created_at,
            "discount_code": redemption.discount.code if redemption is not None else "",
            "discount_amount": str(redemption.amount) if redemption is not None else "0.00",
            "affiliate": (
                {"id": affiliate.pk, "business_name": affiliate.business_name}
                if isinstance(affiliate, Affiliate)
                else None
            ),
        }

    class Meta(AdminSeoSubscriberSerializer.Meta):
        fields = [*AdminSeoSubscriberSerializer.Meta.fields, "setup", "sale"]
