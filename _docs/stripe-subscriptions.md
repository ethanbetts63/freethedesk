# Stripe subscription setup

## Tax position: no GST

**The entity taking FreeTheDesk payments is not registered for GST**, and is
below the $75,000 turnover threshold that would require it.

An unregistered business must not charge GST, must not issue a document
presenting part of a price as GST, and cannot claim input tax credits. So:

| Rule                                                                                                                     | Why                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **No mention of GST anywhere a customer can see** — pricing pages, checkout, agreements, invoices, emails, admin labels. | There is no GST in the price. Saying otherwise is wrong in a document a customer relies on.                                                                  |
| A displayed price is simply the total payable.                                                                           | Correct regardless of registration, and what Australian Consumer Law requires.                                                                               |
| The payment flow declares `tax_mode="none"` explicitly, and `automatic_tax` stays off.                                   | The shared payments app requires a site to state its tax position rather than infer one from missing configuration. Silence is how a wrong default survives. |
| Changing this is a deliberate, dated change, not a settings tweak.                                                       | `tax_behavior: "inclusive"` is harmless now and costs 10% of revenue the day registration happens.                                                           |

**A customer being registered changes nothing.** GST is charged by a registered
supplier, not because the buyer is registered. A dealer told a price is
GST-inclusive would claim an input tax credit they cannot support.

The threshold is roughly 32 dealers at $199/month, so this position has a shelf
life. When it changes, the decision to make first is whether prices are quoted
inclusive or ex-GST:

| Quoted as        | Dealer pays today | Dealer pays once registered | You keep                               |
| ---------------- | ----------------- | --------------------------- | -------------------------------------- |
| `$199` inclusive | $199              | $199                        | $180.91 — a 10% revenue drop overnight |
| `$199 + GST`     | $199              | $218.90, claims $19.90 back | $199 — nothing changes                 |

Because the customers are GST-registered businesses who reclaim the GST, quoting
ex-GST costs them nothing in real terms and makes registration a non-event rather
than a 10% cut or a price rise. Recommended — but it is a pricing and marketing
decision, so it is made deliberately and not on the day.

`tax_behavior: "inclusive"` is harmless while unregistered and becomes expensive
the day registration happens, so whatever this settles, that switch must be a
deliberate act rather than a leftover.

## Where this lives now

Checkout preparation — quoting, agreement acceptance, and building the Stripe
session — is still in this repository's `payments` app. **Everything after the
customer pays belongs to `freetheplatform.payments`:** signature verification,
event de-duplication, payment and subscription records, refunds, and the
failure alerting.

| Concern                                                      | Owner                                                            |
| ------------------------------------------------------------ | ---------------------------------------------------------------- |
| Prices, plans, SEO cadences, agreement wording               | `payments/utils/services.py`, `seo_services.py`, `agreements.py` |
| What a paid dealer or subscriber becomes                     | `payments/flows.py`                                              |
| Telling staff a webhook is stuck                             | `payments/utils/alerts.py`                                       |
| Verifying, recording and dispatching an event                | the package                                                      |
| `Payment`, `Subscription`, `BillingCustomer`, `WebhookEvent` | the package                                                      |

`payments/utils/records.py` is a bridge and is temporary: it writes the shared
`Payment` beside this site's own Stripe call so the package's handlers have
something to find. Phase 3 replaces the session-building code with the
package's `start_checkout` and deletes it. The API is documented in
`../../freetheplatform/_docs/apps/payments.md`.

There is no longer a local `StripeEvent` model, and `Dealer` and
`SeoSubscriber` no longer carry `stripe_last_event_created_at`. Ordering is
settled by which event owns which field, not by comparing Stripe's clock.

## Prices

Subscription prices are managed in Django's **Licensing settings** admin page.
They are monthly Australian-dollar prices, and each is the total a dealer pays.

Django is the pricing authority. For each new Checkout Session it sends Stripe
inline recurring `price_data` containing the current model price in cents. Existing subscriptions retain the price that
was accepted when they were created; changing Licensing settings affects only
future subscriptions.

SEO is sold as four plans, each with its own price in site settings: `monthly`
(`seo_monthly_price`), `quarterly` (`seo_quarterly_price`), `yearly`
(`seo_yearly_price`), each one report per billing period, and `oneoff`
(`seo_oneoff_price`, charged once). The customer picks at signup, by how fast
they can act on a report. A customer who wants a different cadence asks; there
is no tooling for the move yet: change the Stripe subscription's price and
interval in the Stripe dashboard and set the subscriber's `plan` to match in
Django admin, after confirming with the customer, as the SEO subscription terms
require.

No payment, no account. The SEO signup form records a `SeoSubscriber` with no
login: the details typed, the plan, and a random `checkout_reference`. The
payment page (`/seo/payment?ref=…`), the public status endpoint
(`/api/seo/checkout/<reference>/`) and the checkout endpoint all find the
signup by that reference, and Stripe returns to
`/seo/payment/complete?ref=…`. Signing up twice leaves two rows; the unpaid
ones are the list of abandoned checkouts to follow up, and staff are emailed
about every signup.

Paid accounts are unique by email. Signup and checkout both refuse an email
that already has a real account (`seo/utils/existing_account.py`) and send the
person to sign in, so a paid customer cannot pay twice. That tells anyone who
types an email whether it has an account, which is accepted.

Payment is what opens the account; there is no approval step after it. The
first payment event for a pending subscriber (`seo/utils/services.py`,
`activate_paid_subscriber`) creates the login (or reuses a passwordless one the
old signup flow left for that email), makes the subscriber `active`, gives the
login a temporary password with `must_change_password` set, and emails the
sign-in details once the webhook transaction commits. Later events for the same
purchase change nothing, so a second password is never minted. If the email has
gained a real account between checkout and payment, no login is made: the
signup stays pending, a note goes on it, and staff are emailed once to refund
or merge by hand.
Reporting then waits on setup (`seo/utils/setup.py`): it starts once the Search
Console step is confirmed, by the service-account check or by staff.

Before creating the session, FTD publishes the configured legal document through
`freetheplatform.agreements` and records an immutable acceptance against the
dealer or SEO subscriber. The acceptance ID and document hash are copied into
Stripe metadata. A version label cannot be reused after its document content
changes; update the document's `VERSION` in `FTP_AGREEMENTS` whenever its
Markdown changes.

Enable Stripe Tax and configure the appropriate default product tax code in the
Stripe account. Checkout collects the dealership billing address, calculates
the included tax, saves that address to the Stripe Customer for renewals, and
does not add GST above the displayed total.

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
