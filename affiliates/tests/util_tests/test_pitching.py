from decimal import Decimal

import pytest

from core.models import SiteSettings
from affiliates.models import PodcastProspect
from affiliates.tests.factories import ProspectFactory
from affiliates.utils import pitching
from affiliates.utils.unsubscribe import prospect_for_token, unsubscribe_token

pytestmark = pytest.mark.django_db


def test_figures_come_from_the_site_settings():
    assert pitching.pitch_figures() == {
        "discount": "20%",
        "commission_low": "$275",
        "commission_high": "$700",
        "free_audit_price": "$850",
    }

    site_settings = SiteSettings.load()
    site_settings.seo_essentials_price = Decimal("551.00")
    site_settings.affiliate_discount_percent = 15
    site_settings.save()

    figures = pitching.pitch_figures()
    assert figures["commission_low"] == "$275.50"
    assert figures["discount"] == "15%"


def test_money_formats_whole_dollars_without_cents():
    assert pitching.money(Decimal("1400")) == "$1,400"
    assert pitching.money(Decimal("12.5")) == "$12.50"


def test_next_version_keeps_the_three_lists_level():
    assert pitching.next_version() == "a"
    ProspectFactory(version="a")
    assert pitching.next_version() == "b"
    ProspectFactory(version="b")
    assert pitching.next_version() == "c"
    ProspectFactory(version="c")
    ProspectFactory(version="a")
    assert pitching.next_version() == "b"


def test_subjects_rotate_by_id_and_name_the_podcast():
    prospect = ProspectFactory(podcast_name="The Tradie Show", version="b")
    context = pitching.pitch_context(prospect)
    lines = [line.format(**context) for line in pitching.SUBJECTS["b"]]

    assert pitching.pitch_subject(prospect, context) == lines[prospect.pk % len(lines)]
    assert "An invitation for The Tradie Show" in lines


def test_context_carries_the_offer_the_name_and_a_working_unsubscribe_link(settings):
    settings.SITE_URL = "https://www.freethedesk.com.au/"
    prospect = ProspectFactory(first_name="Sam", opener="Came across your episode on quoting.")

    context = pitching.pitch_context(prospect)

    assert context["first_name"] == "Sam"
    assert context["opener"] == "Came across your episode on quoting."
    assert context["sender_name"] == settings.OUTREACH_SENDER_NAME
    assert context["unsubscribe_url"].startswith("https://www.freethedesk.com.au/unsubscribe/")
    token = context["unsubscribe_url"].rsplit("/", 1)[1]
    assert prospect_for_token(token) == prospect
    assert prospect.email not in context["unsubscribe_url"]


def test_a_tampered_token_resolves_to_nobody():
    prospect = ProspectFactory()
    token = unsubscribe_token(prospect)
    assert prospect_for_token(token + "x") is None
    assert prospect_for_token("") is None
    assert prospect_for_token(token) == prospect


def test_send_pitch_renders_the_version_template_with_the_opener(outbox):
    prospect = ProspectFactory(
        version=PodcastProspect.Version.A, first_name="Sam", podcast_name="The Tradie Show",
        opener="Came across your episode on quoting jobs.",
    )

    message = pitching.send_pitch(prospect)

    assert message.message_type == "podcast_pitch.a"
    assert message.status == "sent"
    assert len(outbox) == 1
    text = outbox[0].body_text
    assert text.startswith("Hi Sam,")
    assert "Came across your episode on quoting jobs." in text
    assert "$275 to $700 an audit" in text
    assert "20% off" in text
    assert "/unsubscribe/" in text
    assert "/affiliates" in outbox[0].body_html
    assert outbox[0].content_object == prospect


def test_version_c_has_no_links_and_the_blank_opener_is_dropped(outbox):
    prospect = ProspectFactory(version=PodcastProspect.Version.C, first_name="", opener="")

    pitching.send_pitch(prospect)

    text = outbox[0].body_text
    assert text.startswith("Hi there,\n\nI'm ")
    assert "http" not in text
    assert "no thanks" in text
