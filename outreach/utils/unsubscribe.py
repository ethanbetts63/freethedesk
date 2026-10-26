"""The unsubscribe link in every pitch.

The link has to keep working for weeks after the send, so the token never
expires. It carries the prospect's id rather than the address, so no address
appears in a URL. The page it opens asks for a button press (a POST), because
corporate mail scanners open every link in an email before a person does.
Copied from Bloomprint's florist outreach; lifting it into messaging is logged
in freetheplatform's to_do.
"""

from django.core import signing

from core.utils.urls import site_url

from ..models import PodcastProspect

SALT = "outreach.unsubscribe"


def unsubscribe_token(prospect: PodcastProspect) -> str:
    return signing.dumps({"p": prospect.pk}, salt=SALT)


def prospect_for_token(token: str):
    """The prospect a token unsubscribes, or None if the token is bad."""
    try:
        payload = signing.loads(token, salt=SALT)
    except signing.BadSignature:
        return None
    if not isinstance(payload, dict) or not isinstance(payload.get("p"), int):
        return None
    return PodcastProspect.objects.filter(pk=payload["p"]).first()


def unsubscribe_url(prospect: PodcastProspect) -> str:
    return f"{site_url()}/unsubscribe/{unsubscribe_token(prospect)}"
