from ..models import SeoProfile, SeoSubscriber


def ensure_seo_profile(subscriber: SeoSubscriber) -> SeoProfile:
    profile, _ = SeoProfile.objects.get_or_create(subscriber=subscriber)
    return profile
