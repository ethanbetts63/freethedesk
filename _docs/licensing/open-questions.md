# Open questions and concerns

Plain answers are Ethan's. **Bold notes** are research outcomes — detail in
`research/findings-2026-08-30.md`.

## Decided 19 Sep 2026

Scope decisions taken in one sitting. All of them are specified in
`plan/02-sale-flow.md`; they are listed here because this file is the decision
record.

| Question                               | Decision                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| How the plans separate (relates to Q3) | Licensing-only carries its own **Authority to Lodge** — SC2 has nowhere to live without Schedule 5   |
| Entry point                            | Hosted portal only in v1. "Built into your website" keeps a seam and is not built                    |
| Identity (Q14, Q15)                    | Manual licence images and selfie with dealer review; Stripe Identity swapped in last                 |
| Vehicle data                           | Dealer types it per sale, snapshotted onto the `Sale`. DMS push later                                |
| Offer lapse (finding A)                | Surfaced to the dealer, never enforced. Derived, not a state                                         |
| Document set                           | Licensing form, contract, warranty notice. Form 4 and the Form 1 register are out of v1              |
| Special conditions (Q2)                | Per-clause approval at onboarding in v1, with recorded deviations. SC2 and SC6 not removable         |
| Dealer acceptance                      | One "approve & sign" button; optional signature image in settings; notice sent by the system         |
| Dealer output                          | A sale detail page per sale, with every document downloadable signed and unsigned                    |
| Allbikes                               | Stays a separate application. FreeTheDesk owes it no compatibility                                   |
| Retention (new, forced by the above)   | The schedule ships **with** the identity step. It keeps everything; the identity images are evidence |

Still open after this sitting: the product's name, the lawyer review of the
default conditions and the Authority to Lodge, Q4 (DVS and an electronically
signed printed form), and Q5 (the Dealer Online contract).

## Found in research, not previously listed

**A. The offer lapses at close of business the next business day.** Schedule 5
cl 1.3. The customer's signature is only an offer; a contract exists when the
dealer countersigns _and_ gives notice (cl 1.2). Sign Friday, countersign
Tuesday, no contract. Async remote flow makes this routine — needs a hard dealer
escalation clock, acceptance recorded as its own event, live status for the
customer. Most important finding so far.

**B. MR9B is a two-part carbon form signed by both parties.** Can't be produced
digitally, so the used path may not be automatable without Dealer Online. Ask
DVS alongside Q4.

**C. Warranty statement must be given _before_ the sale** (reg 7). Form 5A or 6
shown before signing, not bundled into the pack after.

## Blocking — decides whether there is a product

**1. Market size.** WA motorcycle dealers with the volume for this is a short
list, and the forms are the part that doesn't generalise.
→ not an issue. we will solve the forms for all vehicle types — that's part of
the product. start with motorcycles / mopeds.

**2. Selling on allbikes' accepted risks.** `contract_special_conditions.md`
accepts risks as one dealer's judgment for their own business; selling the flow
hands them to people who never assessed them.
→ provide default special clauses, let dealers add and edit.

**Settled model.** Writing our own terms is unrestricted; the only line is
advising a _specific_ dealer which clause fits _their_ circumstances.

- One template — prescribed Schedule 5 + our defaults — reviewed once by a WA
  lawyer before shipping. This review is load-bearing, not optional.
- Per-clause approval at dealer onboarding. Removal and additions allowed, with
  deviations recorded ("SC5 removed by dealer, 4 Sep 2026"). That record beats
  immutability as evidence the dealer exercised judgment.
- Never review, validate or comment on their edits. Liability for their final
  contract is theirs.
- Default sets vary by stock type (see Q6). Clauses the flow needs (SC2) are a
  stated product requirement, not advice — remove it and the feature is off.
- No clause library with "when to use this" guidance. That's the shape that
  crosses into advice.

**3. Contract, or only the DoT forms?**
→ both, optionally either — dealer choice. All-inclusive package or variants at
different price points. v1 has contract and licensing.

**4. Will DoT accept a printed form bearing an electronic signature?** Only
matters for dealers without Dealer Online — who are the ones most likely to buy.
→ i'll call and find out. don't think it's an issue.

**5. Read the Dealer Online contract and business rules.** We hold them; not
public. NSW's equivalent deputises the dealer as identity checker.
→ yes, i'll try to get hold of it.

## Structural — the used vehicle path

**6. Special conditions are new-stock only.** SC3 and SC4 assume a manufacturer;
SC5's justification is about first licensing.
→ requires research.

**Resolved — the used path is simpler.** MR9B is lodged within 7 days _of sale_;
no proof of payment needed, nothing requires transfer before delivery. SC5 has
no basis here — prescribed cl 3.1 works unmodified. Schedule 5 already splits
new from used (cl 4.3 gives 1 month not 3; cl 3.2/3.3 are new-only). Make SC3–5
conditional on stock type. See also item B.

**7. Statutory warranty forms absent.** Form 5, 5A and 6 are unreferenced.
→ good point, we must give the customer the warranty form. already automated on
our site, so not hard to repeat.

**Rule established.** Motorcycle: ≥$3,500 **and** ≤8yr **and** ≤80,000km → Form
5A ("Used Bike Warranty"), 3 months or 5,000km. Fail any → Form 6. Cars tier
separately. Reg 5 also makes Form 4 declare warranty status. All forms reissued
Jul–Aug 2025 — version checking is a standing task.

**8. Condition disclosure for a sight-unseen used vehicle.** SC9 covers transit
damage only.
→ we need a stronger clause. be clear in our dealer terms that on a fully online
sale the customer's understanding of condition comes entirely from its
representation on the dealer's site, so defects not clearly visible there may be
cause for rejection.

**Right approach** — a B2B term isn't reached by ACL s64, so it holds where a
consumer-facing disclaimer would be void. Note WA has **no cooling-off period**
on vehicle sales. Two refinements: snapshot a timestamped condition report into
the contract rather than pointing at a mutable website that will be edited or
gone by dispute time; and if we say "cause for rejection", that right has to
exist somewhere — a special condition, or phrase it around existing ACL rights.

**9. Roadworthiness inspection on the used path.**
→ not an issue.

## Design — affects how it gets built

**10. Payment is dealer-confirmed, not system-observed.** Default is the
dealer's BSB, so we never see the money. Needs an explicit gate: instructions →
customer marks paid → dealer confirms received → licensing unlocked.
→ start with BSB and manual verification; Stripe Connect is a long-term option.

**11. SC8 assumes a card fee the BSB path doesn't incur.**
→ true. we probably won't have a deposit flow, so drop the clause.

**12. Confirm DOS rejects a mismatched licence number.**
→ not an issue.

**13. Temp credentials vs. signed link.**
→ signed link.

**14. Identity document retention.** SC10 has the customer consenting to the
_dealer_ holding a licence copy.
→ the dealer should be able to see the licence image. this is important.

**Resolved cleanly.** Stripe exposes images via the FileUpload API and
recommends sending the client a FileLink URL rather than downloading. Dealer
views it in their portal, Stripe serves it, we never store it. Needs Files Write
permission.

**15. Per-dealer identity policy.** The written policy is the dealer's defence —
probably generated per dealer with recorded acceptance.

**16. Dealer Online isn't 24/7.** Mon–Fri 7:45–18:00, Sat 8:00–13:00.
→ not really an issue.

**17. We need our own terms — three documents, not two.**

- **freethedesk ↔ dealer** (subscription): fees, liability allocation, the Q8
  condition term, data accountability. B2B allocation holds, but the unfair
  contract terms regime covers standard-form small business contracts.
- **freethedesk ↔ customer** (platform terms + privacy): nothing else covers
  this relationship. Must carry consent to transact electronically, consent to
  identity verification including Stripe and dealer access to images, and a
  privacy policy naming who holds what.
- **dealer ↔ customer**: the prescribed contract plus their conditions. Not
  ours — Q2's model depends on that.

**18. Assume we are a full APP entity from day one.** The Privacy Act small
business exemption likely doesn't apply, since it falls away where personal
information is disclosed for a benefit or service.

**19. The warranty test reads Perth's date, not the dealer's.**
`documents/warranty.py` counts a vehicle's age from `timezone.localdate()`, which
is `TIME_ZONE` — `Australia/Perth`. That is right while every dealer is in WA and
the whole product is built around WA's prescribed forms.

It stops being right the moment a dealer is not. The eight-year limb of reg 7 is
a bright line, and on 31 December a dealer in Brisbane and a dealer in Perth are
looking at different years for the same vehicle. The fix is a timezone on the
dealer and `vehicle_age_years(..., today=localdate_for(dealer))`; the function
already takes `today`, which is the whole of the seam.

Not urgent, and deliberately not done early: a per-dealer timezone with one
possible value is a column nobody can test.
