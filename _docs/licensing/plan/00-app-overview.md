# App overview

Architecture for the online licensing product. Three portals, built in order:
staff → dealer → customer. Each gets its own plan doc; this one settles the
structure they share.

## Backend apps

Existing: `config` (settings, urls), `core` (JWT cookie auth, notifications,
throttles) — `core` stays as shared infrastructure and gains the tenancy base
classes.

New:

| App | Owns |
| --- | --- |
| `staff` | freethedesk-side console: dealer onboarding, plan assignment, support views, form-version management |
| `dealers` | `Dealer` (the tenant), `DealerMembership`, dealer profile — everything that prefills the dealer's side of a form — and their approved special conditions |
| `sales` | `Sale`, the central aggregate, and its state machine. Vehicle details, offer/acceptance events, the payment gate |
| `customers` | `Customer`, access tokens, personal details captured for prefill |
| `identity` | Stripe Identity sessions and reports, verification outcomes, address comparison |
| `documents` | Versioned form templates, PDF generation, generated and signed document records, condition reports |
| `billing` | Subscriptions and plans. Deferred past v1 — invoice manually until there are enough dealers to justify it |

**Do not name an app `admin`.** It collides with `django.contrib.admin` in
`INSTALLED_APPS` and on import paths. `staff` throughout. (`platform` is also
out — stdlib module.)

Follow allbikes' package layout for anything that outgrows a single file:
`models/`, `views/`, `serializers/` as directories with one concern per module.

## Multi-tenancy — the decision that matters most

**Shared database, `dealer` foreign key on every tenant-owned model, enforced in
code.** Volume doesn't justify schema-per-tenant, and the operational cost of
migrations across schemas is real.

But the data is dealer-confidential and includes identity documents, so a query
that forgets its tenant filter leaks one dealer's customers to another. Three
mitigations, all in `core`, all from day one:

1. A `TenantOwned` abstract base with the `dealer` FK and a manager whose
   default queryset requires explicit scoping.
2. Request-level dealer resolution from the authenticated user, never from a
   client-supplied parameter.
3. Cross-tenant isolation tests as a standing pattern — every list and detail
   endpoint gets one asserting dealer B cannot see dealer A's row.

Point 3 is the one that actually holds the line. The first two are habits; the
tests are the enforcement.

## Actors and auth

One `User` model with a role, rather than parallel user tables.

- **Staff** — freethedesk. Password + Django admin.
- **Dealer users** — password auth, linked to a `Dealer` through
  `DealerMembership` so a dealership can have several logins.
- **Customers** — no password. A signed one-time link scoped to a single
  `Sale`, per open question 13. allbikes already does this with an
  `access_token` on the order; same pattern, shorter lifetime.

Existing JWT cookie auth in `core` covers staff and dealers unchanged.

## `Sale` is the spine

Everything hangs off one aggregate. It carries the vehicle, the customer, the
identity result, the document set, the payment gate and the status.

Its state machine is explicit — a `status` field plus a transitions module, not
`if` statements spread across views. Two things force this:

- **The offer window** (finding A). The customer's signature is an offer that
  lapses at close of business the next business day. Countersignature and notice
  of acceptance are separate recorded events, and lapse is a real state reached
  by the clock rather than by anyone acting.
- **The payment gate** (Q10). Funds move dealer-to-customer by BSB and we never
  observe them, so `customer_marked_paid` and `dealer_confirmed_received` are
  distinct transitions with distinct actors.

Every transition writes an audit event with actor, timestamp and IP. That audit
trail is the product — it is what a dealer points at in a dispute, and it is the
same argument as the identity layer.

## Documents

Prescribed forms are reissued (all of them, Jul–Aug 2025), so templates are
**versioned records, not files in the repo**. A generated document pins the
template version it used and stays immutable once signed.

Generation order is constrained by law, not preference: the warranty statement
(Form 5A or 6) must be given **before** the sale (finding C), so it is produced
and acknowledged ahead of the contract, not bundled into the pack after.

Files: signed documents and condition reports in private storage. Licence images
stay at Stripe and are surfaced through FileLink URLs (finding §5) — we never
hold them.

## Frontend

Next.js, one app, four route groups:

- `(marketing)` — the existing public site
- `/dashboard` — freethedesk console (already exists; keep the route)
- `/dealer` — dealer portal
- `/sale/[token]` — customer flow, entered by signed link, no login

## Build order

Staff → dealer → customer, as proposed. Staff first is right: it is where
dealers get created, so the dealer portal has something to log into, and it is
the cheapest place to establish the tenancy patterns before they are load-bearing.

**One caveat.** The customer flow carries every legal constraint and most of the
product risk, and building it last leaves those assumptions unvalidated longest.
The mitigation is that `Sale` and its state machine get designed **once, up
front**, as part of this plan — not rediscovered when the customer portal is
built. All three portals read and write the same aggregate.

## Open

- **The product needs a name.** "Online licensing" is a description.
- **Condition reports** — capture tooling is settled in principle (Q8) but its
  place in the flow isn't. Likely `documents`, attached to `Sale`.
- **`billing` timing** — manual invoicing until when, exactly.
