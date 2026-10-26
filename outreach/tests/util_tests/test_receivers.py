from io import StringIO

import pytest
from django.core.management import call_command

from affiliates.tests.factories import AffiliateFactory
from outreach.tests.factories import ProspectFactory

pytestmark = pytest.mark.django_db


def test_a_sign_up_links_the_prospect_with_that_address():
    prospect = ProspectFactory(email="sam@thetradieshow.com.au")
    other = ProspectFactory(email="other@example.com")

    affiliate = AffiliateFactory(user__username="Sam@TheTradieShow.com.au")

    prospect.refresh_from_db()
    other.refresh_from_db()
    assert prospect.affiliate == affiliate
    assert other.affiliate is None


def test_link_prospects_catches_accounts_that_came_first():
    affiliate = AffiliateFactory(user__username="sam@thetradieshow.com.au")
    prospect = ProspectFactory(email="sam@thetradieshow.com.au")
    assert prospect.affiliate is None

    out = StringIO()
    call_command("link_prospects", stdout=out)

    prospect.refresh_from_db()
    assert prospect.affiliate == affiliate
    assert "1 linked." in out.getvalue()
