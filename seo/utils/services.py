from ..models import SeoProfile, SeoSubscriber


def ensure_seo_profile(subscriber: SeoSubscriber) -> SeoProfile:
    # Seed the reporting site from what they gave at signup so the onboarding
    # form isn't blank; they can still change it.
    profile, _ = SeoProfile.objects.get_or_create(
        subscriber=subscriber,
        defaults={"website_url": subscriber.website},
    )
    return profile
