from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import SeoProfile
from ..serializers import SeoOnboardingSerializer
from ..utils.permissions import IsSeoSubscriber
from ..utils.services import ensure_seo_profile


class SeoOnboardingView(RetrieveUpdateAPIView):
    """Reporting inputs, available only after payment activates."""

    permission_classes = [IsSeoSubscriber]
    serializer_class = SeoOnboardingSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        subscriber = self.request.user.seo_subscriber
        if not subscriber.has_paid:
            raise PermissionDenied("Complete payment before connecting your data.")
        return ensure_seo_profile(subscriber)


class SeoOnboardingSubmitView(APIView):
    permission_classes = [IsSeoSubscriber]

    required_fields = {
        "website_url": "Website URL",
        "search_console_property": "Search Console property",
        "primary_location": "Primary location",
        "target_keywords": "Target keywords",
    }

    def post(self, request):
        subscriber = request.user.seo_subscriber
        if not subscriber.has_paid:
            raise PermissionDenied("Complete payment before submitting your reporting brief.")
        profile = ensure_seo_profile(subscriber)
        missing = [label for field, label in self.required_fields.items() if not getattr(profile, field)]
        if missing:
            raise ValidationError({"detail": f"Complete these fields before submitting: {', '.join(missing)}."})
        profile.onboarding_status = SeoProfile.OnboardingStatus.SUBMITTED
        profile.submitted_at = timezone.now()
        profile.save(update_fields=["onboarding_status", "submitted_at", "updated_at"])
        return Response(SeoOnboardingSerializer(profile, context={"request": request}).data)
