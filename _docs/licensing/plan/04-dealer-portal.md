# Dealer portal

Phase 2. What a dealer actually does, once approved. `02-sale-flow.md` settles
the flow and `03-data-model.md` the models; this settles the screens, the
endpoints and the wiring.

## What already exists

`/portal` with `DealerShell`, `PortalShell`, and three routes: overview, setup
and account. `dealerApi.ts` covers the account, the subscription checkout and
onboarding. The overview already shows a status card keyed on
`Dealer.status`, with copy for `active` that promises exactly this phase:

> Setup is the next step: your dealership details, the paperwork we prefill on
> your behalf and the sale conditions you want to use.

So this phase extends rather than builds, the same way phase 1 did.

## Navigation

`DealerShell`'s `nav` gains one entry, first, because it is the only screen a
working dealer opens daily:

```ts
const nav = [
  { href: "/portal/sales", label: "Sales" },
  { href: "/portal/overview", label: "Overview" },
  { href: "/portal/setup", label: "Dealership setup" },
  { href: "/portal/account", label: "Account" },
];
```

Overview stays, and becomes the place a `pending` or `suspended` dealer lands —
it is already written for exactly that.

## Routes

| Route                       | Purpose                                                     |
| --------------------------- | ----------------------------------------------------------- |
| `/portal/sales`             | The queue. Filterable by status, defaulting to needs-action |
| `/portal/sales/new`         | Create a sale: vehicle, then customer, then send            |
| `/portal/sales/[reference]` | The sale. Everything about it, and every action on it       |
| `/portal/setup`             | Extended: bank details, signature, special conditions       |

No separate identity-review or document screen. A sale is one page, because
every action on it needs the rest of it in view — approving a licence image
means reading the name on the form beside it.

## The queue

A sale needs the dealer when it is waiting on them and not on the customer.
That is the only sort order that matters, so the default filter is
**needs action**:

| Status                     | Needs action | What they do                       |
| -------------------------- | ------------ | ---------------------------------- |
| `draft`                    | yes          | Finish it and send the link        |
| `awaiting_customer`        | no           | Waiting on the customer            |
| `awaiting_identity_review` | yes          | Approve or reject the images       |
| `ready_to_sign`            | no           | Waiting on the customer            |
| `signed`                   | **urgent**   | Approve and sign, inside the clock |
| `accepted`                 | no           | Waiting on payment                 |
| `awaiting_payment`         | no           | Waiting on the customer            |
| `payment_confirmed`        | yes          | Lodge, hand over, mark complete    |

`signed` is the only urgent one, and it is urgent for a reason the dealer cannot
see without being told: the offer lapses at close of business the next business
day. A row in that state shows the countdown, then a lapsed badge, and it sorts
above everything else regardless of the chosen filter.

Nothing changes state when the clock runs out. The badge is the whole mechanism —
most dealers will carry on and countersign anyway, which is their call to make.

Columns: reference, customer, vehicle, status, what it is waiting on, and age.
`StatusPill` and `useAdminList` already exist and cover the rendering; the SEO
and dealer admin lists are the pattern.

## Creating a sale

Three sections on one page, saved as one draft. Not a wizard: a dealer keying a
sale they have just agreed in the showroom has all of it in front of them, and a
three-screen wizard for twenty fields is slower for everyone who is not learning.

**Vehicle.** Class, condition, make, model, year, body type, colour, VIN, engine
number, capacity or electric, odometer, registration and expiry, registration
months included, stock number, RRP.

Conditional by stock type, and this is the visible reason `vehicle_class` and
`condition` come first: a new vehicle has no odometer worth stating and no
registration expiry, a used one has no registration term included, and an
electric one has no engine capacity.

**Money.** Vehicle price, delivery fee, deposit already taken.

**Customer.** Name, email, phone. Delivery or collection, and the delivery
address when it is delivery.

Then **send**, which generates the password, emails the link, and moves the sale
to `awaiting_customer`. A draft can be edited freely until it is sent.

Track A under the [forms standard](../../../../freetheplatform/_docs/forms-standard.md):
react-hook-form with a Zod resolver. It qualifies on cross-field validation
alone — the conditional-by-stock-type rules above are `.refine()` clauses, and
writing them as scattered inline rules is what the standard exists to stop.

## The sale page

Top to bottom, in the order a dealer reads it:

**Header.** Reference, customer, vehicle in one line, status pill, and the
lapse countdown when there is one.

**Checklist.** The same requirements object the customer's own screen renders
from, so the dealer sees precisely what the customer is being asked for and what
is blocking them. One source of truth, two audiences — see `05-customer-flow.md`.

**Details.** Vehicle, money, purchaser, licence holder, delivery. Editable, with
an explicit warning when a signed document exists: changing a detail makes the
signed paperwork stale and sends the customer back to re-sign. That is the
correct outcome and it should not be a surprise.

**Identity.** The three images with their review status, each approved or
rejected individually, and a rejection reason that reaches the customer as a
sentence. Viewing an image streams it through an authenticated view; the files
are outside `MEDIA_ROOT` and no webserver will serve them.

This whole block is deleted when Stripe Identity lands, replaced by a verdict
and a FileLink URL. It is built knowing that.

**Documents.** Every document the sale produces, each row offering the unsigned
version always and the signed version once it exists. Unsigned is generated on
demand and streamed; signed is the stored file.

Both, always, because they answer different questions. The unsigned copy is what
a dealer prints when a customer wants to read it on paper or when something has
to be redone by hand; the signed one is the record. A stale signed document is
labelled as stale rather than hidden — the dealer needs to know it exists and why
it no longer counts.

**Actions**, the ones available in the current state:

| Action             | From                       | Does                                                   |
| ------------------ | -------------------------- | ------------------------------------------------------ |
| Send the link      | `draft`                    | Password, email, `awaiting_customer`                   |
| Resend the link    | any pre-signature          | New email, same token                                  |
| Approve identity   | `awaiting_identity_review` | Per image; all three approved moves to `ready_to_sign` |
| Reject identity    | `awaiting_identity_review` | With a reason. Back to `awaiting_customer`             |
| **Approve & sign** | `signed`                   | Countersign, notify, `accepted`                        |
| Confirm payment    | `awaiting_payment`         | `payment_confirmed`, licensing unlocked                |
| Mark complete      | `payment_confirmed`        | `completed`                                            |
| Cancel             | anything pre-complete      | With a reason, recorded                                |

### Approve & sign

One button, because that is all it should be. Behind it:

1. Rebuild the contract with the dealer's block completed — their
   `signature_image` if they have uploaded one, otherwise "Electronically signed
   by \<signature_name\>".
2. Store it as the `sale_contract` document with `signed_by_role='dealer'`, its
   own SHA-256, and the dealer's address and user agent.
3. Record a `dealer.contract_acceptance` acceptance through
   `freetheplatform.agreements`.
4. Email the customer the notice of acceptance with the executed PDF attached,
   and stamp `acceptance_notified_at`.
5. Move to `accepted`.

Steps 4 and 5 are what cl 1.2 actually requires and what allbikes never did.
Sending the notice from the system rather than trusting a dealer to send one is
the difference between a recorded event and an assumption.

Automatic countersignature on customer signature is possible and deliberately
not built. A manual approval is the dealer's last look at a sale that binds them,
and the whole product is an async flow where nobody is standing there.

## Setup, extended

`/portal/setup` gains three sections beyond the existing onboarding fields.

**Bank details.** Account name, BSB, account number. Shown to the customer on
the payment instructions page and nowhere else. BSB renders as `036-004` rather
than `036004`, because that is how a customer will check it against their
banking app.

**Signature.** An optional image upload plus the name to print. Through the same
upload pipeline as every other document. The name alone is sufficient — the
image only changes what the executed contract looks like, not whether it is
signed.

**Special conditions.** Per-clause approval, and the part of this phase with the
most care in it.

The dealer reads each default clause in full and keeps or removes it. They may
add their own, in their own words. On save, the choices are written to
`condition_choices` and an acceptance is recorded against
`dealer.special_conditions` with the choices in `context` — so the dated record
of what they removed, and when, and who did it, is immutable and separate from
the current state.

Three rules the interface has to carry, from `open-questions.md` Q2:

- **SC2 and SC6 cannot be removed**, and the reason shown says so plainly: SC2
  is the authority to lodge and SC6 is the consent to sign electronically, and
  without either the product does not function. That is a statement about the
  product, not advice about their business.
- **Their additions are never reviewed, validated or commented on.** No
  suggestions, no warnings, no "you might also want". The moment the interface
  has an opinion about which clause suits them it has crossed the line drawn in
  `research/findings-2026-08-30.md` section 6.
- **No clause library.** No catalogue of optional extras with guidance on when
  each applies. That shape is the problem, not the wording of any one entry.

A dealer on the licensing-only plan sees none of this. They get the Authority to
Lodge, which is not negotiable and has nothing to choose.

## API

All under `/api/sales/`, all `IsAuthenticated` plus a dealer permission, all
scoped through `TenantManager.for_dealer(request.user.dealer)`.

| Endpoint                                    | Method     | Throttle scope    |
| ------------------------------------------- | ---------- | ----------------- |
| `sales/`                                    | GET, POST  | `portal`          |
| `sales/<reference>/`                        | GET, PATCH | `portal`          |
| `sales/<reference>/send/`                   | POST       | `sale-link`       |
| `sales/<reference>/identity/<side>/review/` | POST       | `portal`          |
| `sales/<reference>/identity/<side>/`        | GET        | `portal`          |
| `sales/<reference>/accept/`                 | POST       | `portal`          |
| `sales/<reference>/payment/confirm/`        | POST       | `portal`          |
| `sales/<reference>/complete/`               | POST       | `portal`          |
| `sales/<reference>/cancel/`                 | POST       | `portal`          |
| `sales/<reference>/documents/<kind>/`       | GET        | `document-render` |

Two new scopes, both cost rather than traffic:

- **`sale-link`** — each accepted request sends an email and mints a password.
  The same class of thing as `enquiry` and `dealer-signup`.
- **`document-render`** — building a Schedule 5 contract is real CPU, and it is
  reachable by an anonymous customer on their own side of the product. Naming
  the scope for the cost rather than the caller is what section 5 of the
  [security standard](../../../../freetheplatform/_docs/security-standard.md) asks
  for.

Every route declares a scope. There is a system check that fails the build
otherwise, so this is not a convention to remember.

## Frontend wiring

`dealerApi.ts` gains the sale calls and their types, following the existing
`getDealerAccount` / `jsonOrError(await authedFetch(...))` shape. No new client,
no second fetch wrapper.

Screens reuse what exists: `AdminPageHeader`, `AdminCard`, `AdminList`,
`useAdminList`, `StatusPill`, `AdminButton`, `AdminNotice`, `PortalField`. The
sale page is a long detail page, which is the shape `AccountDetail` and
`useAccountDetail` already serve.

## Notifications

Through `core/utils/notifications.py` and `freetheplatform.messaging`, each one
a real template extending the shared base — `01-staff-app.md` established that
layer and named this phase as the reason to do it properly.

| Event                | To       | Carries                                    |
| -------------------- | -------- | ------------------------------------------ |
| Sale link            | Customer | The signed link, the reference, a password |
| Identity rejected    | Customer | The reason, and the link back              |
| Customer signed      | Dealer   | The lapse deadline, stated as a date       |
| Offer lapsing        | Dealer   | One reminder, inside the window            |
| Notice of acceptance | Customer | The executed contract attached             |
| Payment marked paid  | Dealer   | Nudge to confirm receipt                   |
| Payment confirmed    | Customer | Licensing is under way                     |
| Sale complete        | Customer | Every signed document                      |

The "customer signed" email states the deadline as an actual date and time
rather than "the next business day". A dealer reading it on a Friday evening and
a dealer reading it on a Tuesday morning are looking at different deadlines, and
making them compute it is how it gets missed.

## Out of v1

- **`DealerMembership`.** One login per dealership until one asks for two.
- **Bulk anything.** No import, no CSV, no multi-select actions.
- **Condition reports.** Settled in principle under Q8, unplaced in the flow.
- **The delivery fee paid online.** Needs Stripe Connect.
- **A dealer-branded customer experience.** The customer's screens are
  FreeTheDesk's, showing the dealer's name. Theming is a later question and the
  "built into your website" plan is where it belongs.
