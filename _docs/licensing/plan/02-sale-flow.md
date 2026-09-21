# The sale flow — specification

The spine of the product. `00-app-overview.md` settles the architecture around
it; this settles what actually happens, in what order, and why each order is
forced.

Decided 19 Sep 2026. Supersedes anything in `00-app-overview.md` it contradicts —
corrections are listed at the end.

## Scope of v1

| Decision      | v1                                                       | Later                                            |
| ------------- | -------------------------------------------------------- | ------------------------------------------------ |
| Jurisdiction  | WA                                                       | Another state is a research project, not config  |
| Vehicle class | Motorcycle and moped                                     | Cars — thresholds differ, carried in the model   |
| Entry point   | Hosted portal only: dealer keys the sale, sends the link | Embedded or DMS push — `Sale` keeps the seam     |
| Vehicle data  | Dealer types it per sale, snapshotted onto the `Sale`    | Pushed from the dealer's site or DMS             |
| Identity      | Licence images plus selfie, dealer reviews               | Stripe Identity, swapped in behind the interface |
| Plans         | Licensing, contracts, and both                           | —                                                |
| Payment       | Dealer's BSB, dealer confirms receipt                    | Stripe Connect for the delivery fee              |
| Offer lapse   | Surfaced, never enforced                                 | —                                                |

Allbikes stays a separate application. FreeTheDesk borrows its patterns and its
prescribed-form knowledge freely and owes it no compatibility.

## The three constraints that dictate the order

Everything else is preference. These are not.

1. **The warranty statement must be given _before_ the sale.** Reg 7. Form 5A or
   Form 6 is shown and acknowledged before the customer signs anything — not
   bundled into the pack afterwards.
2. **The customer's signature is an offer, not a contract.** Schedule 5 cl 1.1
   and 1.2. A contract exists only when the dealer countersigns _and_ gives
   notice of acceptance, and the offer lapses at close of business the next
   business day (cl 1.3).
3. **Identity has to be bound before a vehicle is licensed in someone's name.**
   Not a legal duty — there is no prescribed procedure and therefore no safe
   harbour — which is exactly why it goes early and why the policy is written
   down. See `research/online_licensing.md` section 3.

## Status

```text
draft ─▶ awaiting_customer ─▶ awaiting_identity_review ─▶ ready_to_sign
                                                               │
                                                               ▼
                                                            signed
                                                               │
                                                  dealer: approve & sign
                                                               ▼
                                                           accepted
                                                               │
                                                               ▼
                                                     awaiting_payment
                                                               │
                                               dealer confirms receipt
                                                               ▼
                                                    payment_confirmed
                                                               │
                                                               ▼
                                                          completed
```

`cancelled` is reachable from anywhere before `completed`.

`awaiting_identity_review` exists only while identity is manual. Stripe Identity
returns a verdict without a human, so that state disappears with the swap — which
is the reason it is a state rather than a flag on `awaiting_customer`.

**Lapse is derived, never stored.** `offer_lapses_at` is computed from `signed_at`
plus one WA business day, at 17:00. The dealer's queue shows a countdown and then
a lapsed badge, and one reminder email goes out inside the window. Nothing
transitions. Most dealers will ignore this rule in practice, and the product's job
is to make sure they know it exists and then let them decide — not to void their
sale for them.

A business day is Monday to Friday excluding WA public holidays, as one constant
with the reasoning beside it. Per-dealer trading hours are deliberately not
modelled.

Every transition writes an audit event carrying actor, timestamp and client
address. That trail is the product: it is what a dealer points at in a dispute,
and it is the same argument as the identity layer.

## What each party does

### Dealer — creating the sale

Vehicle, then customer, then send. All of it typed, because FreeTheDesk holds no
inventory and should not grow one.

The vehicle is a **value snapshot on the `Sale`**, not a foreign key. That is the
right shape regardless of how it arrived, so a later DMS push writes the same
fields and nothing downstream changes.

Vehicle fields are exactly what the forms and the warranty engine consume: class,
condition, make, model, year, body type, colour, VIN, engine number, engine
capacity or electric, odometer, registration and expiry, stock number. Price,
delivery fee and deposit sit beside them.

Customer fields at this stage are only what addresses the link: name, email,
phone. Everything else the customer supplies themselves.

### Customer — the link

A signed link, per open question 13. `/sale/<reference>/<token>` redeems once for
an httpOnly cookie scoped to `/api/sales/<reference>/`, which is the pattern the
[security standard](../../../../freetheplatform/_docs/security-standard.md) section
12 prescribes for a record that outlives a tab. Recovery on another device is the
reference plus a password emailed at send time, with the paired per-reference and
per-address throttles.

**The customer is not a role and this is not a portal.** `role` stays
`staff | dealer | seo | none`, and `/sale/...` must stay out of
`PROTECTED_PREFIXES` in `proxy.ts` — adding it would bounce a customer holding a
valid link to a login page they can never pass.

Three steps, in this order, because constraint 1 and constraint 3 put them there:

**Fill.** Licence family name, given names, licence number, date of birth,
residential address. Whether the purchaser is the licence holder, and the
purchaser's own details when they are not. Whether it is being licensed to a
company, and then company name, ACN and organisation code. Whether it is kept
primarily in WA. Delivery or collection, and the delivery address.

Editable for as long as the customer still has something to do, not only on the
first pass — noticing a misspelt name at the point of signing is precisely when it
should be fixable, and refusing would send the wrong name to the Department of
Transport rather than prevent it.

**Verify.** Licence front, licence back, and a selfie. Submitting moves the sale
to `awaiting_identity_review`; the dealer approves or rejects each image. This is
the manual stand-in — see _Identity_ below for why it is shaped to be thrown away.

**Sign.** The warranty notice is presented and acknowledged first, then the
documents are signed. Both are gated: neither is reachable until details are
complete and identity is verified.

### Dealer — approve and sign

One button. The server rebuilds the contract with the dealer's block completed —
their uploaded signature image if they have one in settings, otherwise
"Electronically signed by \<name\>" — records the dealer's acceptance, and emails
the customer the notice of acceptance with the executed PDF attached.

The notice is what cl 1.2 requires and it is sent by the system, so it becomes a
recorded event rather than something a dealer might have done. Automatic
countersignature is possible and deliberately not built: a manual approval is the
dealer's last look at a sale they are about to be bound by.

### Payment

Funds move customer-to-dealer by BSB and FreeTheDesk never observes them, so the
gate is two distinct acts by two distinct actors: the customer marks it paid, the
dealer confirms it received. Licensing unlocks on the second.

The instructions page shows the dealer's own account details from their profile.
A proof-of-payment upload is accepted but advances nothing on its own, for the
same reason a document upload does not — a screenshot proves a file arrived, not
that the money did.

Paying the delivery fee online needs Stripe Connect and is out of v1. The
marketing page sells it as an optional additional feature, which is survivable,
but the copy should not imply it is live.

## Documents

Which documents exist is a function of the plan and the stock type, and nothing
else.

| Document                               | Licensing | Contracts | Both | Stock     | When           | Signed by        |
| -------------------------------------- | --------- | --------- | ---- | --------- | -------------- | ---------------- |
| Warranty notice — Form 5A or Form 6    | yes       | yes       | yes  | Used only | Before signing | Acknowledged     |
| Manufacturer warranty information      | yes       | yes       | yes  | New only  | Before signing | Acknowledged     |
| Authority to Lodge                     | yes       | —         | —    | Both      | At signing     | Customer         |
| Vehicle Sale Contract (Schedule 5)     | —         | yes       | yes  | Both      | At signing     | Customer, dealer |
| VL17 — licence a vehicle               | yes       | —         | yes  | New       | At signing     | Customer         |
| MR9B — notification of change of owner | yes       | —         | yes  | Used      | At signing     | Customer         |

**The Authority to Lodge is new, and it is the price of selling the plans
separately.** A licensing-only dealer has no Schedule 5 contract, so SC2 — the
clause appointing the dealer to lodge with the Department of Transport — has
nowhere to live. A short standalone instrument carries it instead, and it goes
into the same lawyer review as the default special conditions — which is a
wording pass on a published agreement version, not something the build waits on.

### The warranty engine

Deterministic, from reg 7, and the whole of it. All three conditions must hold.

|                      | Motorcycle | Car (later) |
| -------------------- | ---------- | ----------- |
| Cash price incl. GST | ≥ $3,500   | ≥ $4,000    |
| Age                  | ≤ 8 years  | ≤ 12 years  |
| Odometer             | ≤ 80,000km | ≤ 180,000km |

Pass all three and it is Form 5A, three months or 5,000km. Fail any and it is
Form 6. Motorcycles are a single tier; cars tier again inside the outer limits,
which is why vehicle class is carried on the `Sale` from day one rather than
assumed.

Applying a bright-line statutory test with no discretion is automation, not legal
practice — the same way payroll software applying award rates is not. That
distinction is what keeps this side of the line drawn in
`research/findings-2026-08-30.md` section 6.

**An acknowledgement stops counting when its inputs change.** Price, condition,
year and odometer are hashed into a fingerprint stored on the sale; if any of them
moves, the acknowledgement no longer matches and the customer is shown the current
notice again. Derived, not flagged, so it cannot fall out of step with the edit
that caused it.

### Templates are records, not files in the repo

Every prescribed form was reissued July–August 2025 and the regulations
consolidation on hand is June 2024. A reissue that changes a field name breaks
every dealer at once, silently, and the failure looks like a blank box rather than
an error.

So a `FormTemplate` row carries kind, version label, effective date and the PDF
itself; the field map stays in code keyed by kind and version, because a changed
field name needs a code change anyway. A generated document pins the version it
used and becomes immutable once signed.

Checking for reissued forms is a standing task, not a one-off.

### Generation and storage

Nothing unsigned is written to disk. A filled form carries a licence number and a
date of birth, so it is generated on demand and streamed. Only signed documents
persist, in the private tree outside `MEDIA_ROOT`, reachable solely through an
authenticated view.

A signed document records the signer's name, the moment, the exact declaration
shown, the client address and user agent, and the SHA-256 of the final PDF. It is
an electronic-signature record, not a cryptographic certificate, and the claim it
supports is that this authenticated session made this declaration against this
exact document.

A prefilled document signed before the details on it changed is **stale**, derived
by comparing its signing time against the sale's last detail change. Staleness
sends the customer back to sign again rather than silently shipping a wrong name
to the Department.

## Evidence goes through `freetheplatform.agreements`

The package is installed and `payments/utils/agreements.py` already uses it for
subscription checkout. Policy is to consume an existing shared capability rather
than fork one, and three things here are exactly what it publishes.

| Evidence                        | Agreement key                 | Related | Context carries             |
| ------------------------------- | ----------------------------- | ------- | --------------------------- |
| Dealer's special-conditions set | `dealer.special_conditions`   | Dealer  | Per-clause choices          |
| Warranty notice acknowledgement | `customer.warranty_notice`    | Sale    | Price, year, odometer, form |
| Customer signature declaration  | `customer.document_signature` | Sale    | Document kind, PDF SHA-256  |
| Dealer's acceptance             | `dealer.contract_acceptance`  | Sale    | Document kind, PDF SHA-256  |

What the package deliberately does not do is invalidate an acceptance when the
underlying facts move. That is a product concern and stays local: the package
holds the immutable evidence, the sale holds the fingerprint that decides whether
it still counts.

This replaces the hand-rolled `conditions_version` / `conditions_accepted_at` /
`_ip` / `_by` columns already sitting unused on `DealerProfile`.

## Special conditions

The model settled in `open-questions.md` Q2, now scheduled into v1.

- **One default set**, reviewed once by a WA lawyer before shipping, published as
  an agreements version.
- **Per-clause approval at onboarding.** The dealer reads each default clause and
  keeps or removes it, and may add their own. Stored in
  `DealerProfile.condition_choices`, which is already modelled and unused.
- **Deviations are recorded** with date and actor. That record beats immutability
  as evidence that the dealer exercised judgment.
- **SC2 and SC6 cannot be removed.** SC2 is the lodging authority and SC6 is the
  consent to transact electronically; without either the feature is off. That is a
  stated product requirement, not advice about their circumstances.
- **Their own additions are never reviewed or commented on.** Liability for the
  final contract is theirs, and reviewing it is the act that would cross into
  legal practice.
- **No clause library with "when to use this" guidance.** That shape is the one
  that crosses the line.

Per-sale selection sits on top of the dealer's set, exactly as Allbikes does it:
SC1 and SC7 only where there is a delivery, SC3 only on new stock, SC5 only on new
stock — its justification is a first-licensing problem and it has no basis on the
used path, where prescribed cl 3.1 works unmodified.

## Identity

Built to be replaced. The gate is `verification.is_verified`; what satisfies it is
a provider.

**v1 — manual.** The customer uploads licence front, licence back and a selfie;
the dealer approves or rejects each. It is the proven path, it exercises the gate
end to end, and it gives the dealer the licence image they need to see under open
question 14.

**Later — Stripe Identity.** Document plus `require_matching_selfie`. The images
stay at Stripe and the dealer views them through a FileLink URL, so FreeTheDesk
never holds them. Needs Files Write alongside the Identity read permissions.
Swapping providers sets the same status and deletes the manual state; nothing else
in the flow moves.

### The retention consequence, which is not optional

`_docs/pii_inventory.md` records G1: _there is no retention or deletion anywhere in
FreeTheDesk_. No purge job, no expiry, no `deleted_at`.

Licence images and a selfie are the most sensitive category either system holds.
Allbikes had `purge_bike_order_identity` for exactly this and it was deleted with
nothing behind it. The second benefit of Stripe Identity named in
`research/online_licensing.md` is that it retires the retention problem rather than
scheduling around it — and v1 does not have that benefit.

So the **schedule** ships with the identity step, not after it, and the security
standard's requirement that each private-document category state a retention
period is answered before a real customer's licence is uploaded.

What it says is that nothing is deleted — see `_docs/licensing/retention.md`. The
identity images are the dealer's evidence of due diligence rather than a spent
means to a verdict, and the sale record's period is statutory and unverified. A
purge command shipped alongside this and was removed once that was settled; the
schedule is the part that mattered.

The customer flow also adds a personal-data tier that does not exist today — name,
date of birth, licence number, residential address, identity images — and a
disclosure relationship, because the dealer sees the customer's documents. That
makes two of open question 17's three documents part of building the customer
flow rather than something to write later: the customer-facing platform terms
carrying consent to transact electronically and to identity verification
including dealer access, and a privacy policy naming who holds what.
`pii_inventory.md` needs rewriting in the same change.

All three are ours to write, so none of them waits on anybody. They are listed
here so they are scheduled into the step that creates the data rather than
discovered after it.

## Known risk: MR9B on the used path

MR9B is a two-part carbon form signed by both parties, so it cannot be produced
digitally in the form the Department issues. Allbikes prefills and stamps it anyway
and the dealer handles the physical copy.

Three ways out, in preference order: the dealer is on Dealer Online and the form
disappears entirely; DVS accepts a printed substitute bearing an electronic
signature; or the dealer prints and handles it by hand. The middle one is open
question 4 and is still unanswered.

**The used path may therefore not be fully automatable for a dealer without Dealer
Online**, and those are the dealers most likely to buy. This does not block v1 —
the documents are still produced and still correct — but the dealer sales pitch
must not promise more than the used path can deliver until DVS has answered.

## Corrections to `00-app-overview.md`

| Claim there                                | Actually                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| Seven new apps                             | Three: `sales`, `identity`, `documents`                                      |
| A `staff` app                              | No. `01-staff-app.md` already corrected this — staff is `core` and `dealers` |
| A `billing` app                            | No. `payments` exists and already runs the subscriptions                     |
| A `customers` app                          | No. A customer exists only within one sale; the fields live on `Sale`        |
| Customer flow entered by signed link       | Correct, and it must be kept out of `PROTECTED_PREFIXES`                     |
| Lapse is a real state reached by the clock | Derived and displayed, never transitioned — a deliberate scope decision      |
| Stripe Identity                            | Deferred; manual review in v1 behind the same gate                           |
| Licence images stay at Stripe              | Only after the swap. Until then they are ours, and kept — see the schedule   |

## Open

None of these stops anything being built. They are listed so they are not
forgotten, not because the work waits on them — see `07-build-sequence.md`.

- **The product has no name.** "Online licensing" is a description, and it is what
  the marketing page, the plan codes and these documents all use. Copy, settled
  whenever.
- **The lawyer review** of the default special conditions and the new Authority to
  Lodge. A wording pass on a published agreement version, so it lands as a version
  bump rather than a change to anything structural.
- **Open question 4** — will DVS accept a printed form bearing an electronic
  signature. Decides what the sales material may promise about the used path for
  dealers without Dealer Online. Touches no code.
- **The Dealer Online contract and business rules.** Still unread, and they may
  already prescribe the identity standard rather than leaving it to judgment.
  Worth reading early because it informs the policy, not because it gates it.
