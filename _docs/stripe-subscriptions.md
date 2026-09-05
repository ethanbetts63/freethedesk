# Stripe subscription setup

Create three monthly recurring Stripe Prices in the Free the Desk Stripe account:

- Online licensing: AUD 149 + GST per month
- Online contracts: AUD 99 + GST per month
- Licensing and contracts: AUD 199 + GST per month

Enable Stripe Tax for the account. Checkout collects the dealership billing address and asks Stripe to calculate applicable tax.

Copy the three `price_...` identifiers into the Django `.env` variables documented in `.env.example`. Add the matching Stripe secret key. In `frontend/.env.local`, add the publishable key from the same Stripe account as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

Register this webhook endpoint:

`https://freethedesk.com.au/api/payments/webhook/`

Subscribe it to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Copy the endpoint signing secret into `STRIPE_WEBHOOK_SECRET`. Use test-mode keys and test-mode Prices locally, then replace every Stripe value together for production. The browser sends only the chosen plan code; Django selects the trusted Price ID.

For local webhook testing, forward Stripe events to `http://127.0.0.1:8000/api/payments/webhook/` with the Stripe CLI and use the temporary signing secret printed by the CLI.
