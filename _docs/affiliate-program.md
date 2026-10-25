# Podcast affiliate program

How a podcast host becomes an affiliate, what their listeners get, what the host
earns, and where each piece lives. Built 25 October 2026. The outreach that
finds hosts is [`affiliate-outreach.md`](affiliate-outreach.md); the pitch
emails are [`affiliate-pitch/README.md`](affiliate-pitch/README.md). Paying
commissions out is not built yet (see the end).

## The offer

Set on the admin's site settings page (`/dashboard/admin/settings/site`) and
read everywhere from `SiteSettings`:

| Setting                      | Default | What it does                                                                                              |
| ---------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `affiliate_discount_percent` | 20      | What a listener gets off an SEO audit with an affiliate's code. Baked into each code the day it is made. |
| `affiliate_share_percent`    | 50      | The affiliate's share of the audit's **list price**, before the discount. Read when the audit is paid.    |

The share is of the list price because that is what the affiliate page and the
pitch emails promise ("$275 to $700 an audit"). On a $550 Essentials audit with
20% off, the listener pays $440, the affiliate is owed $275 and freethedesk keeps
$165. Decided 2026-10-25; change the copy and the rule together if it changes.

The free audit is the Plus tier (`FREE_AUDIT_CODE` in the page's `_lib/copy.ts`).

## What happens at sign-up

`POST /api/affiliates/signup/` from the form on `/affiliates`
(`affiliates/views/registration.py`, `affiliates/utils/services.py`). In one
transaction:

1. A login is made with no password (`username == email`), or a stale
   passwordless one from an unpaid SEO signup is reused. An email anyone can
   sign in with is refused with `account_exists`, and the form offers sign-in.
2. An `Affiliate` row (podcast, host, email, website), active at once. There is
   no approval step: the code costs nothing until a sale.
3. A `DiscountCode` in the shared payments app: percentage, the discount
   setting, valid on the `seo.oneoff` flow only, owned by the affiliate. The
   code is the podcast's name with everything but letters and digits removed,
   then the discount: "The Tradie Show" → `THETRADIESHOW20`, `-2` if taken.
   Stripe's coupon is made the first time the code is used.
4. A complimentary Plus audit: an `SeoSubscriber` on the same login with
   `payment_status=complimentary`, active, with its profile. The SEO portal's
   setup, access checks, reporting and staff pages serve it unchanged; it never
   reads as revenue.
5. The Affiliate Program Terms (`affiliate.program` in `FTP_AGREEMENTS`,
   `frontend/content/legal/affiliate-program-terms.md`) are recorded as
   accepted, with the code and both percentages as context.
6. `issue_email_code` makes a verification code the account's first password.

After commit: staff get the email and SMS, and the host gets the welcome email
with the code and the link to `/affiliates/verify?email=…`. That page is the
shared `VerifyEmailCodeForm` (`components/auth/`): signing in with the code
proves the address and the chosen password replaces it, then `/affiliate-portal`
opens. See "Accounts opened by an emailed code" in
`freetheplatform/_docs/apps/auth.md`.

The principal's `role` is `affiliate` whenever the login has an `Affiliate`,
decided before `seo` because the affiliate also has the subscriber row.

## The portal

`/affiliate-portal`, `AffiliatePortalShell`, `GET/PATCH /api/affiliates/me/`.

| Page       | What it shows                                                                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview   | Status, the code and the share link (`/seo?code=CODE`, both with copy buttons), earnings (sales, owed, paid), the free audit's next step, recent sales.         |
| Promote    | Words for the show around the code and the live prices (`_lib/promotion.ts`): an on-air read, show notes, a newsletter paragraph, a social post, a one-liner. Every piece discloses the commission. |
| Your free audit | The SEO portal's `SetupChecklist` with affiliate wording, plus a link to `/documents/seo-report-onboarding.pdf`, the one-page instructions for whoever runs their site. |
| Account    | Podcast name, host name, website; the code and email are read-only. Password change links to the shared page.                                                 |

## The listener's purchase

The SEO order panel on `/seo` has an "Affiliate code (optional)" field, filled
in from `?code=` when a listener arrives on the share link. The code travels on
the signup (`SeoSubscriber.discount_code`); `SeoRegistrationView` previews it
with the shared payments app inside the signup transaction, so a code that
cannot be used fails the form rather than the payment page. Checkout
(`create_or_reuse_seo_checkout_session`) passes the code to `start_checkout`,
which re-runs every rule under a lock, reserves the redemption and applies
Stripe's coupon; the page shows the discounted total. A code refused at that
point (`code: "discount"`) sends the customer back to the form.

`DISCOUNTS_ENABLED` is on in `FTP_PAYMENTS`. The SEO signup form is the only
place a code is accepted.

## The commission

`affiliates/utils/commissions.py`, called from the SEO callbacks in
`payments/fulfilment.py`, inside the webhook's transaction:

- `payment_succeeded` on a one-off audit whose payment redeemed an affiliate's
  code makes one `Commission`: the audit's name, the list price
  (`subtotal_amount`), the share, status `owed`. Idempotent per payment. The
  affiliate and staff are emailed on commit.
- The affiliate buying with their own code makes a `void` commission for $0
  with a note, so staff see it.
- `refunded` voids an `owed` commission and leaves a `paid` one for staff to
  settle by hand.

Suspending or denying an affiliate on the staff page switches their
`DiscountCode` off, so the code stops working at checkout at once; reinstating
switches it back on. The code row is never deleted: paid audits point at it.

## Staff pages

`/dashboard/admin/affiliates`: list (search by podcast, host, email or code;
filter by status) and detail (status, code, earnings, every sale with its
status and note, staff notes, messages, a link to the free audit on the SEO
list). The free audit also appears on `/dashboard/admin/seo` with payment
"Complimentary".

## Not built: payouts

`Commission.status` has `paid` and `paid_at` for when it is. The plan is Stripe
Connect Express per affiliate and a transfer per owed commission, as
Bloomprint's `partners` app does (`stripe_connect_onboard_view.py`,
`utils/payouts.py`); it needs Connect enabled on the freethedesk Stripe
account. Until then, settle owed commissions by hand and note it on the
affiliate. The terms (section 3.4) say payouts are through Stripe at least
monthly once the affiliate has set up a payout account, which is also what the
portal tells them.
