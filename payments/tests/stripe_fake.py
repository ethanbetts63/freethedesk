"""A Stripe stand-in for FreeTheDesk's checkout tests.

Checkout now goes entirely through ``freetheplatform.payments``, which builds
its client in one place — ``client.get_client`` — so that is the seam to fake.
Patching the ``stripe`` module's globals would not reach it, and would hide
whether the package constructs its client at all.

Deliberately small: these tests are about FreeTheDesk's quoting, agreement
evidence and error mapping. The package's own suite covers Stripe behaviour.
"""

from unittest.mock import Mock


class FakeStripe:
    """Records what checkout asked Stripe to create."""

    def __init__(self):
        self.session_params = []
        self.customer_params = []
        self.sessions = {}

        self.checkout = Mock()
        self.checkout.sessions.create.side_effect = self._create_session
        self.checkout.sessions.retrieve.side_effect = self._retrieve_session
        self.checkout.sessions.expire.side_effect = self._expire_session
        self.customers = Mock()
        self.customers.create.side_effect = self._create_customer

    def _create_session(self, params=None, options=None):
        self.session_params.append(params)
        session_id = f"cs_test_{len(self.session_params)}"
        session = Mock(
            id=session_id,
            status="open",
            client_secret=f"{session_id}_secret",
            amount_total=self._total(params),
        )
        self.sessions[session_id] = session
        return session

    @staticmethod
    def _total(params):
        """What Stripe would charge for these line items.

        Stripe does this sum, not the quote, and the package refuses a session
        whose total disagrees with what it quoted. A fake that left the total
        to a ``Mock`` would pass that check by accident and prove nothing.
        """
        return sum(
            line["price_data"]["unit_amount"] * line["quantity"]
            for line in (params or {}).get("line_items", [])
        )

    def _retrieve_session(self, session_id, **kwargs):
        if session_id not in self.sessions:
            raise KeyError(session_id)
        return self.sessions[session_id]

    def _expire_session(self, session_id, **kwargs):
        if session_id in self.sessions:
            self.sessions[session_id].status = "expired"

    def _create_customer(self, params=None, options=None):
        self.customer_params.append(params)
        return Mock(id=f"cus_test_{len(self.customer_params)}")

    @property
    def last_session(self):
        return self.session_params[-1]

    @property
    def session_count(self):
        return len(self.session_params)
