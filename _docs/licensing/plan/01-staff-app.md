# Staff app — plan

Phase 1 of three. Gets dealers signed up and visible to us. Deliberately thin:
everything a dealer actually *does* is phase 2.

## What already exists

More than expected. `core` already has staff JWT cookie auth, a
`/dashboard` frontend with `DashboardShell`, `adminApi.ts`, enquiry and message
views, and a `Notification` model that persists every send with status, sent_at
and error_message. Mailgun and Twilio transport both work.

So this phase **extends** rather than builds. Correction to `00-app-overview.md`:
the staff route group is the existing `/dashboard`, not a new `/staff`. Renaming
buys nothing.

## Scope

1. Dealers landing page and sales pitch (public marketing).
2. Dealer signup, creating a `Dealer` in `pending`.
3. Staff email on signup.
4. Staff pages to list dealers, view one, and approve or deny.
5. A reusable email template layer.

Not in scope: dealer onboarding (licence details, bank details, special
conditions approval), any tenant-scoped data, billing.

## `Dealer` model

Follows bloomprint's `BusinessAccount`: a `OneToOneField` to `User` plus a
status. Status is `pending` → `active`, with `suspended` and `denied` as the
other terminals.

Signup collects the minimum: contact name, business name, email, phone,
password. **Nothing else.** Dealer licence number, CAP number, Dealer Online
status, bank details and the special-conditions approval all belong to the
onboarding wizard in phase 2, behind approval. A forty-field form on a signup
page kills conversion, and most of those fields need a decision from us first.

`Dealer` is the tenant root for phases 2 and 3. Nothing is tenant-scoped yet, so
`TenantOwned` in `core` is deferred — but the FK name is settled now as `dealer`
so later migrations don't churn.

## Signup flow

Public `POST` endpoint, `AllowAny`, mirroring bloomprint's
`BusinessAccountRegistrationView`: serializer creates the `User` and the
`Dealer`, then auth cookies are set so the dealer is logged in immediately.

Landing in `pending` is what gates access — a logged-in unapproved dealer sees a
"we'll be in touch" holding page rather than a portal. That's better than
refusing the login, because phase 2's onboarding wizard drops straight into the
same place once they're approved.

## Staff notification

**bloomprint doesn't actually have this** — its `partners/signals.py` only
deactivates discount codes on delete, and nothing emails on signup. The pattern
to copy is freethedesk's own `notify_admin_of_enquiry` in `core/notifications.py`,
which already does exactly the right thing: build the body, persist a
`Notification` per channel, send, and record the outcome.

So: `notify_staff_of_dealer_signup(dealer)`, same shape, email plus optional SMS,
linking to the dealer's page in the dashboard.

## Email templates — borrow the layer, keep freethedesk's transport

All three codebases have a piece of this. Take the best of each.

**freethedesk's transport stays.** Every send is a persisted `Notification` row
with delivery status and error text, visible in the dashboard. Neither of the
others logs delivery this well.

**Take the template layer from allbikes.** `notifications/emails/base.html` is a
proper table-based transactional layout — header bar, logo, white card, footer,
with `{% block %}`s for title, preheader, content and unsubscribe — and every
event extends it. bloomprint has the same pattern. freethedesk currently renders
one generic `admin_notification.html` from a subject and a body string, which is
fine for an internal alert and not fine for anything a dealer or customer sees.

**Take `resolve_recipient` from bloomprint** (`data_management/utils/send_notification.py`).
It maps a notification's `recipient_type` to an (email, phone) pair so callers
never hardcode an address. freethedesk has no equivalent and will need exactly
this once there are three recipient types — staff, dealer, customer.

**Plan:** port `base.html` into `core/templates/emails/base.html`, rebranded; add
`resolve_recipient`; extend `send_notification` to accept a template name and
context alongside the existing subject/body path, so the generic path keeps
working while new events get real templates. First two templates are the staff
signup alert and the dealer welcome.

Worth doing properly now — phase 3 sends the customer their access link, their
warranty statement and their signed contract, and those are the emails that
carry the product.

## Frontend

**Marketing:** `/dealers` — the sales pitch. Fits the existing pattern alongside
`/websites` and `/automation`. `/dealers/signup` for the form.

**Staff:** `/dashboard/dealers` (list, filterable by status) and
`/dashboard/dealers/[dealerId]` (detail, with approve and deny). Reuses
`DashboardShell` and `StatusPill` as-is; `adminApi.ts` gains the dealer calls.

## Open

- **What does approval actually check?** Dealer licence validity, DOS status, or
  just that they're real? Decides whether the detail page needs anything beyond
  the signup fields.
- **Does denial email the dealer?** And does it say why.
- **The sales pitch needs the product's name.** Still unresolved from the
  overview.
