from .models import Dealer, DealerProfile


def ensure_dealer_profile(dealer: Dealer) -> DealerProfile:
    profile, _ = DealerProfile.objects.get_or_create(dealer=dealer)
    return profile
