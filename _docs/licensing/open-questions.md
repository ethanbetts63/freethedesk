# Open questions and concerns

Nothing here is answered.

## Blocking — decides whether there is a product

1. **Market size.** WA motorcycle dealers with the volume to want this is a
   short list. The business only exists if it generalises, and the forms are the
   part that doesn't.

2. **Selling on allbikes' accepted risks.** `contract_special_conditions.md`
   accepts several risks as one dealer's judgment call for their own business.
   Selling the flow to others hands those risks to people who never assessed
   them. Its four "before this goes live" questions need real answers first: can
   a Special Condition displace prescribed cl 3.1; can an authorised rep lodge
   VL17 for the customer; is a deposit on an identified vehicle already a sale
   agreement requiring the Schedule 5 form; does an online flow satisfy cl 1.1.

   answer: i think a good way to mitigate this is to provide our default special clauses
   but allow the user to add special clauses / edit existing ones. 

3. **Does the pack include the sale contract, or only the DoT forms?** With the
   contract, every dealer's special conditions need legal review and we inherit
   Q2. Without it, the customer signs in two places and the one-flow pitch dies.

answer: yes. we are going to make this an all inclusive package. or package variants 
at different price points. but at least for v1 yes we will have the contract and the licensing. 
4. **Will DoT accept a printed form bearing an electronic signature?** Open in
   the research. Only matters for dealers without Dealer Online — who are
   exactly the small dealers most likely to buy this. Ask DVS.

5. **Read the Dealer Online contract and business rules.** We hold them; not
   public. NSW's equivalent deputises the dealer as identity checker outright.
   If ours does too, the identity standard is already set. Do this first.

## Structural — the used vehicle path isn't designed

6. **Special conditions are new-stock only.** SC3 (manufacturer discontinues a
   colour) and SC4 (manufacturer supply date) are meaningless for a used bike.
   SC5's justification is about first licensing; a used bike is transferred by
   MR9B, so the stated reason doesn't hold.

7. **Statutory warranty forms are absent.** Form 5, 5A and 6 are in
   `wa_dealer_forms/` and nothing references them. Which applies is a rule —
   picking it automatically is a real feature, but the rule needs establishing.

8. **Condition disclosure for a sight-unseen used vehicle.** SC9 covers transit
   damage only. No condition report, no defects schedule, no position on a bike
   arriving worse than represented. Most likely source of dispute.

9. **Roadworthiness inspection on the used path.** A Bulk Licensing Permit
   removes the AIS inspection for new stock. Used is unresearched.

## Design — affects how it gets built

10. **Payment is dealer-confirmed, not system-observed.** Default is the
    dealer's own BSB, so we never see the money. Needs an explicit gate:
    instructions issued → customer marks paid → dealer confirms received →
    licensing unlocked. Stripe Connect is the opt-in branch that collapses
    those. Stripe Identity works either way — it needs no payments integration.

11. **SC8 assumes a card fee the default path doesn't incur.** Pre-estimated
    damages are set to the actual card processing fee. On BSB there isn't one.

12. **Confirm DOS rejects a mismatched licence number.** The research assumes it
    bounces a bad name/DOB/number combination against DVS rather than
    reconciling later. Untested, and it decides whether a commercial DVS gateway
    provider is needed at all.

13. **Temp credentials vs. signed link.** A one-time signed link is less code,
    has nothing to leak, and generates no support calls.

14. **Identity document retention.** Stripe Identity means holding pass/fail and
    extracted fields, not licence images. But SC10 has the customer consenting
    to the *dealer* holding a copy — so who controls the images needs settling.

15. **Per-dealer identity policy.** The written policy is the defence, and it
    belongs to the dealer. Probably generated per dealer, with recorded
    acceptance.

16. **Dealer Online isn't 24/7.** Mon–Fri 7:45–18:00, Sat 8:00–13:00. A Sunday
    purchase is licensed Monday — the customer flow shouldn't imply otherwise.
