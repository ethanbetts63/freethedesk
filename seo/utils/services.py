from ..models import SeoProfile, SeoSubscriber


def ensure_seo_profile(subscriber: SeoSubscriber) -> SeoProfile:
    # Seeds the onboarding form from signup so it isn't blank; still editable.
    profile, _ = SeoProfile.objects.get_or_create(
        subscriber=subscriber,
        defaults={"website_url": subscriber.website},
    )
    return profile
