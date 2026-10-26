from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Affiliate, PodcastProspect


def link_prospects_to_affiliates(queryset=None):
    """Point every unlinked prospect at the affiliate who registered with its address.

    Returns how many were linked. ``queryset`` narrows the affiliates considered;
    the default is all of them, for the one-off ``link_prospects`` command.
    """
    linked = 0
    for affiliate in (queryset if queryset is not None else Affiliate.objects.all()).only("pk", "email"):
        if not affiliate.email:
            continue
        linked += PodcastProspect.objects.filter(
            email__iexact=affiliate.email, affiliate__isnull=True
        ).update(affiliate=affiliate)
    return linked


@receiver(post_save, sender=Affiliate, dispatch_uid="outreach_link_prospect_on_signup")
def link_prospect_on_signup(sender, instance, created, **kwargs):
    """A host who was pitched and then signed up stops being pitched and shows "Signed up"."""
    if created:
        link_prospects_to_affiliates(Affiliate.objects.filter(pk=instance.pk))
