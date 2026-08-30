# Online licensing — product idea

**Status: idea, not a spec.** Nothing designed, nothing built.

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

- `research/online_licensing.md` — the legal position (26 Aug 2026)
- `research/contract_special_conditions.md` — deposit terms and special
  conditions to the prescribed Schedule 5 contract
- `wa_dealer_forms/` — DoT and MV Dealers Act forms, plus the Sales Regs

Both research docs are drafts, neither reviewed by a lawyer.
`wa_dealer_forms/README.md` contains two claims that `online_licensing.md`
corrects — see its Corrections section.

Open questions: `open-questions.md`.
