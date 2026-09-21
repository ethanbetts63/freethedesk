# App overview

Architecture for the online licensing product. Three portals, built in order:
staff → dealer → customer. Each gets its own plan doc; this one settles the
structure they share.

> **Partly superseded.** `02-sale-flow.md` is the current specification and its
> decisions override this document where they disagree. Its _Corrections_
> section lists every point; the app table and build order below have been
> brought into line, the rest of this document stands.

## Backend apps

Existing and unchanged in role: `config` (settings, urls), `core` (JWT cookie
auth, notifications, throttles, and the staff-side API), `dealers` (`Dealer` as
the tenant root, `DealerProfile`, onboarding, and the admin dealer views),
`payments` (Stripe subscriptions), `seo`. `core` gains the tenancy base classes.

Three new apps, not the seven first proposed:

| App         | Owns                                                                                                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sales`     | `Sale`, the central aggregate, and its state machine. The vehicle snapshot, the customer's own details, access tokens, offer and acceptance events, the payment gate |
| `identity`  | Verification records behind one provider interface — manual licence images and selfie in v1, Stripe Identity later                                                   |
| `documents` | Versioned form templates, PDF generation, generated and signed document records                                                                                      |

Dropped from the original list, with reasons:

- **`staff`** — `01-staff-app.md` already established that staff work is the
  existing `/dashboard`, served by `core` and `dealers`. A new app renames
  working code for nothing.
- **`billing`** — `payments` exists and already runs the dealer subscriptions
  through Stripe. There is nothing left for a second app to own.
- **`customers`** — a customer exists only within one sale, has no account, and
  is deliberately not reused across dealers. The fields live on `Sale`.

**Do not name an app `admin`.** It collides with `django.contrib.admin` in
`INSTALLED_APPS` and on import paths. (`platform` is also out — stdlib module.)

A new app must be added to `pytest.ini`'s `testpaths`, or its tests silently
never run.

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

- **Staff** — freethedesk. Password, through `/dashboard`. Django's admin is not
  routed in production.
- **Dealer users** — password auth, linked to a `Dealer`. A `DealerMembership`
  for several logins per dealership is a later addition; today the link is the
  `OneToOneField` already on `Dealer`.
- **Customers** — no password and **not a role**. A signed one-time link scoped
  to a single `Sale`, per open question 13, redeemed for an httpOnly cookie
  scoped to that sale's own API path. allbikes already does this and the
  [security standard](../../../../freetheplatform/_docs/security-standard.md)
  section 12 prescribes it.

`role` therefore stays `staff | dealer | seo | none`, and the customer route
tree must be kept **out** of `PROTECTED_PREFIXES` in `proxy.ts` — adding it
would redirect a customer holding a valid link to a login page they can never
pass.

Existing JWT cookie auth in `core` covers staff and dealers unchanged.

## `Sale` is the spine

Everything hangs off one aggregate. It carries the vehicle, the customer, the
identity result, the document set, the payment gate and the status.

Its state machine is explicit — a `status` field plus a transitions module, not
`if` statements spread across views. Two things force this:

- **The offer window** (finding A). The customer's signature is an offer that
  lapses at close of business the next business day. Countersignature and notice
  of acceptance are separate recorded events. **Lapse itself is derived and
  displayed, not a transition** — see `02-sale-flow.md`, which scopes this to
  making the dealer aware rather than voiding their sale for them.
- **The payment gate** (Q10). Funds move customer-to-dealer by BSB and we never
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

Files: signed documents and condition reports in private storage, outside
`MEDIA_ROOT`, with an authenticated view as the only route out. Licence images
are ours in v1 — Stripe Identity and its FileLink URLs (finding section 5) come
later, and until then the retention obligation in `02-sale-flow.md` applies.

## Frontend

Next.js, one app, four route groups:

- `(marketing)` — the existing public site
- `/dashboard` — freethedesk console (already exists; keep the route)
- `/portal` — dealer portal (already exists; `/dealer` was never built and the
  rename would buy nothing)
- `/sale/[reference]/[token]` — customer flow, entered by signed link, no login,
  and kept out of `PROTECTED_PREFIXES`

## Build order

Staff → dealer → customer, as proposed. Staff first was right and is now largely
done: signup, Stripe subscription, onboarding and the approve/deny views all
exist.

**One caveat.** The customer flow carries every legal constraint and most of the
product risk, and building it last leaves those assumptions unvalidated longest.
The mitigation is that `Sale` and its state machine get designed **once, up
front** — which is `02-sale-flow.md`, not something to be rediscovered when the
customer portal is built. All three portals read and write the same aggregate.

## Open

- **The product needs a name.** "Online licensing" is a description, and it is
  what the marketing page and the `Dealer.Plan` codes already use.
- **Condition reports** — capture tooling is settled in principle (Q8) but its
  place in the flow isn't. Likely `documents`, attached to `Sale`. Out of v1.
- **`DealerMembership`** — several logins per dealership. Not needed until a
  dealer asks.
