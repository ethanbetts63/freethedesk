# Stripe subscription setup

Subscription prices are managed in Django's **Licensing settings** admin page.
They are monthly Australian-dollar prices and are GST inclusive everywhere.

Django is the pricing authority. For each new Checkout Session it sends Stripe
inline recurring `price_data` containing the current model price in cents and
sets `tax_behavior` to `inclusive`. Existing subscriptions retain the price that
was accepted when they were created; changing Licensing settings affects only
future subscriptions.

Enable Stripe Tax and configure the appropriate default product tax code in the
Stripe account. Checkout collects the dealership billing address, calculates
the included tax, and does not add GST above the displayed total.

Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Django's environment. In
`frontend/.env.local`, set the publishable key from the same Stripe account as
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

Register this webhook endpoint:

`https://freethedesk.com.au/api/payments/webhook/`

Subscribe it to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

The endpoint verifies Stripe's signature and records each Stripe event ID before
processing it. Replays are ignored and stale or superseded subscription events
cannot replace current state.

For local testing, forward Stripe events to
`http://127.0.0.1:8000/api/payments/webhook/` with the Stripe CLI and use the
temporary signing secret printed by the CLI.
