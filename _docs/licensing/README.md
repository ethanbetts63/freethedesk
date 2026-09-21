# Online licensing

**Status: specified; steps 1 to 6 of the build sequence are built.** The sale
flow is settled in `plan/02-sale-flow.md` — read that first for how the product
works.

Built: the tenancy base and the sale aggregate; the dealer's queue, creation
screen and sale page; per-clause approval of the special conditions; every
document unsigned — VL17, MR9B, the Schedule 5 contract, the Authority to Lodge
and the warranty notice; the customer's link, recovery, Fill step and warranty
gate; and identity verification. Nothing is deleted anywhere — see
`retention.md`, which is a decision rather than an omission.

Not built: signing (step 7), acceptance and the lapse clock (step 8), payment
and completion (step 9), and Stripe Identity (step 10). See
`plan/07-build-sequence.md`.

## The idea

A subscription product for vehicle dealers that moves the paperwork half of a
sale online. The customer gives their details, verifies their identity and signs
remotely; the dealer gets back a prefilled, signed document pack ready to lodge
— uploaded into Dealer Online, or printed and taken to DoT.

**Dealer portal.** Business details entered once at setup, filling the dealer's
side of every form. Per sale: enter the vehicle, send the customer a link.

**Customer portal.** Details → identity verification (Stripe Identity, document
plus matching selfie) → signing → payment instructions.

## Why it might work

Almost nobody does this. A handful of car dealers run remote sales, a few more
over email; as at Aug 2026 no Australian motorcycle dealer was found running the
full flow. Allbikes already does — the research is done and there's a live
reference customer.

The identity layer is probably the real sell. Remote sale removes the counter,
and with it the only thing binding a person to the licence they present. No law
requires a dealer to close that gap and no procedure is prescribed — so there's
no safe harbour either, and the written policy is most of the defence.

## Scope

**v1 is WA, motorcycles.** All research is WA-specific and the warranty forms
are vehicle-class specific. Another state is another research project, not a
config change.

## Hard boundary

freethedesk is never inside a dealer's Dealer Online session — that runs under
their signed DTMI contract with a named representative and MFA. We produce the
pack; the dealer lodges it.

## What's here

**The plan**, in reading order. `02` is the one to start with — the rest answer
"how" once it has answered "what".

| Doc                         | Answers                                                     |
| --------------------------- | ----------------------------------------------------------- |
| `plan/02-sale-flow.md`      | **The specification.** What happens, in what order, and why |
| `plan/00-app-overview.md`   | The architecture around it — apps, tenancy, actors, routes  |
| `plan/01-staff-app.md`      | Phase 1. Largely delivered                                  |
| `plan/03-data-model.md`     | The models, the tenancy base, and retention                 |
| `plan/04-dealer-portal.md`  | The dealer's screens, actions, endpoints and emails         |
| `plan/05-customer-flow.md`  | Access, the four steps, the requirements engine, privacy    |
| `plan/06-documents.md`      | Form filling, contract typesetting, signing, storage        |
| `plan/07-build-sequence.md` | The order of work and what proves each step                 |

**The rest**

- `retention.md` — what the sale flow keeps, for how long, and what enforces it
- `open-questions.md` — the live decision record
- `research/online_licensing.md` — the legal position (26 Aug 2026)
- `research/findings-2026-08-30.md` — the warranty rule, the offer window, the
  used path, and the Stripe Identity answer
- `research/contract_special_conditions.md` — deposit terms and special
  conditions to the prescribed Schedule 5 contract
- `wa_dealer_forms/` — DoT and MV Dealers Act forms, plus the Sales Regs

Both research docs are drafts, neither reviewed by a lawyer.
`wa_dealer_forms/README.md` contains two claims that `online_licensing.md`
corrects — see its Corrections section.

Open questions: `open-questions.md`.
