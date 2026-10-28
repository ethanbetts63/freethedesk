"""A message sent without a template of its own takes the branded freethedesk frame."""

import pytest
from freetheplatform.messaging import send

pytestmark = pytest.mark.django_db


def test_a_plain_message_renders_in_the_branded_frame(outbox):
    message = send(
        to="customer@example.com",
        channel="email",
        message_type="manual",
        subject="Your audit",
        body="Hi Sam,\n\nWe're on it.",
    )

    assert message.body_html.count("logo-mark.png") == 2  # header and footer
    assert "Perth, Western Australia" in message.body_html
    # The old frame's colours are gone.
    assert "#718f20" not in message.body_html and "#fa6b36" not in message.body_html
    # Line breaks survive, and the subject is not repeated as a heading.
    assert 'white-space: pre-wrap;">Hi Sam,\n\nWe&#x27;re on it.</div>' in message.body_html
    assert "<h1" not in message.body_html


def test_the_plain_text_body_is_not_html_escaped(outbox):
    message = send(
        to="customer@example.com", channel="email", message_type="manual", subject="s", body="We're here"
    )

    assert "We're here" in message.body_text
    assert "&#x27;" not in message.body_text
