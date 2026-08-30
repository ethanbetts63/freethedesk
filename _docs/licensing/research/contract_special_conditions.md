# Deposit terms and contract special conditions

**Draft for review. Not legal advice and not reviewed by a lawyer.** Consumer
Protection WA takes free trade enquiries — put the open questions in
`dealer_direct_to_your_door.md` to them before this goes live.

Two separate documents, and the split matters:

- **Part A** is the deposit stage, *before* any contract exists. It lives in the
  website purchase terms.
- **Part B** are Special Conditions written **on the face of the prescribed
  Schedule 5 contract**, not in website terms. A term that varies a prescribed
  clause has to be part of that contract — cl 5.2 refers to including something
  "as a Special Condition of this Contract". Putting them on a linked T&Cs page
  is the reg 14 problem rather than a way around it.

Square brackets mark values filled per order.

---

## Part A — Deposit terms

### A1. What a deposit is

Paying a deposit reserves stock. **It is not a purchase of the vehicle and does
not create a contract to buy it.**

A contract to buy is formed only when you and we have both signed a Vehicle Sale
Contract in the form prescribed by the Motor Vehicle Dealers (Sales) Regulations
1974, and we have given you notice that we accept it. We will send you that
contract to sign after you have paid your deposit and given us the details we
need to complete it.

### A2. What your deposit does

Your deposit holds your place in our order queue for the model and colour you
selected. For a vehicle we already hold in stock, it also means we stop offering
that vehicle to other buyers.

### A3. Neither of us is committed

Until the Vehicle Sale Contract is signed by both of us:

- you are not obliged to buy the vehicle; and
- we are not obliged to supply it.

### A4. Price

The price shown when you pay your deposit is indicative. The price you pay is
the Total Purchase Price stated in the Vehicle Sale Contract.

### A5. Refunds before the contract is signed

You may ask for your deposit back at any time before the Vehicle Sale Contract
has been signed by both of us, and we will refund it in full.

### A6. After the contract is signed

Once the Vehicle Sale Contract is signed by both of us, refunds are governed by
that contract, not by these terms.

> **Note, not clause text.** For new stock A1–A3 are straightforwardly true: no
> vehicle exists or is identified, and nothing is ordered until acceptance. For
> used stock a specific identified vehicle comes off the market at a displayed
> price, which is materially closer to a sale agreement. Accepted risk — the
> downside is a full refund. Flagged as an open question.

---

## Part B — Special Conditions to the Vehicle Sale Contract

To be reproduced in the Special Conditions section of the prescribed Schedule 5
contract. The prescribed clauses themselves are reproduced verbatim and are not
paraphrased or reworded.

### SC1 — Place of delivery

Clause 4.4 provides that delivery takes place at the Dealer's Premises unless
otherwise agreed. The parties agree that the Vehicle will instead be delivered
to the Purchaser at:

> [delivery address]

on the delivery date stated in this Contract, at a time agreed between the
parties in advance.

If the Purchaser is not present to accept delivery at the agreed date and time,
and has not given the Dealer reasonable notice beforehand, the Dealer may charge
the Purchaser its reasonable cost of making a further delivery attempt.

### SC2 — Authority to licence the Vehicle

The Purchaser appoints the Dealer as their authorised representative for the
purpose of lodging the application to licence the Vehicle with the Department of
Transport, and authorises the Dealer to lodge that application and any
supporting documents on the Purchaser's behalf.

### SC3 — Change of colour or specification

If the manufacturer or importer discontinues or is unable to supply the colour
or specification stated in this Contract, the Dealer will notify the Purchaser
and may offer an alternative.

The Purchaser is not obliged to accept an alternative. If the Purchaser does not
accept an alternative offered by the Dealer, either party may terminate this
Contract by Notice to the other, and the Dealer must immediately refund any
deposit paid. No damages are payable by either party under this Special
Condition.

If the Purchaser accepts an alternative, the parties will record the change in
writing before the Dealer proceeds.

### SC4 — Revision of the delivery date

The delivery date stated in this Contract is based on the supply date advised to
the Dealer by the manufacturer or importer.

If the Dealer becomes aware before the stated delivery date that the Vehicle
will not be available in time, the Dealer will notify the Purchaser as soon as
practicable and the parties may agree a revised delivery date in writing. The
Purchaser is not obliged to agree to a revised date.

Nothing in this Special Condition limits the Purchaser's rights under clause
7.1 if the Vehicle is not delivered by the delivery date stated in this Contract
or by any revised date agreed in writing.

### SC5 — Payment of the balance before delivery

Clause 3.1 provides for the balance of the Total Purchase Price to be paid on
delivery. The parties agree that the balance is instead payable when the Dealer
notifies the Purchaser that the Vehicle is ready to be licensed.

This is because the Department of Transport will only accept proof of ownership
that shows the Vehicle has been paid for in full, and the Vehicle must be
licensed before it can be delivered to the Purchaser.

Clause 5.1 continues to apply: the Dealer remains the owner of the Vehicle until
the Total Purchase Price has been received in full.

### SC6 — Notices and electronic documents

The Purchaser consents to signing this Contract electronically and to receiving
this Contract, notices and other documents relating to it electronically.

For the purposes of clause 9.1, Notices may be given by email to:

> Purchaser: [customer email]
> Dealer: [dealer email]

The Purchaser acknowledges that a copy of this Contract was provided to them
electronically at the time they signed it.

### SC7 — Risk in the Vehicle *(confirmatory — delete if not wanted)*

For the avoidance of doubt, and despite the change to the place of delivery in
SC1, clause 5.2 applies unchanged: risk in the Vehicle and the responsibility to
insure it pass from the Dealer to the Purchaser when the Vehicle is delivered.

> Not a variation — the prescribed default already produces this outcome. Worth
> stating only because SC1 moves the place of delivery. Cut it if the Special
> Conditions block is getting long.

### SC8 — Cancellation by the Purchaser

If this Contract is terminated in circumstances where the Dealer is entitled to
pre-estimated damages under clause 8.2, the amount the Dealer will seek is the
card processing fee the Dealer actually incurred on the Purchaser's payment and
cannot recover from its payment provider.

The Dealer will refund the balance of any deposit paid.

> The fee is a real, documented, per-transaction cost, well inside the 5% cap in
> cl 8.2 and defensible as a genuine estimate under cl 8.3. Record the actual
> `balance_transaction.fee` against the order — do not use a flat figure or a
> percentage.

### SC9 — Delivery inspection

On delivery the Purchaser will inspect the Vehicle and take photographs of it,
and will tell the Dealer as soon as reasonably possible about any damage that
appears to have occurred in transit.

Nothing in this Special Condition limits the Purchaser's rights under the
Australian Consumer Law, or the Dealer's obligations under it, including where
damage or a defect is discovered later.

### SC10 — Identity documents

The Purchaser consents to the Dealer collecting and holding a copy of the
Purchaser's driver's licence, and the personal details shown on it, for the
purpose of completing the licensing of the Vehicle.

---

## Deliberately left out

- **Immobiliser.** Excluded on instruction. Note the approved immobiliser
  requirement falls on the proposed licence holder, and whether scooters are
  exempt is still an open question with DVS.
- **Price hold.** Considered and rejected. Clauses 3.2 and 3.3 continue to apply
  unchanged, so a manufacturer price rise can be passed on up to 5% of the Total
  Factory Price. Customers paying months ahead will not expect this — worth
  surfacing in the checkout copy even though it is not a Special Condition.
- **Deletion commitment for identity documents.** Excluded on instruction.
  `purge_bike_order_identity` still runs; it is simply not promised in the
  contract.
- **Trade-in and finance.** Not special conditions. Mark clauses 6 and 2 as
  **N/A** in the contract's own fields so they do not read as left blank.

## Contract fields, not special conditions

Delivery date · Total Purchase Price · deposit paid · balance · delivery fee ·
VIN and engine number once known · trade-in N/A · finance N/A.

Clause 4.1 requires delivery "on or before the delivery date stated in this
Contract", and cl 4.2 only supplies the three-month default where **no** date is
stated. State a date, with buffer — that date becomes the obligation, and
missing it is a dealer breach under cl 7.1 giving a full refund and no damages.

## Before this goes live

1. Can a Special Condition displace prescribed cl 3.1 at all? If not, SC5 is the
   offence rather than the fix, and the balance has to wait for delivery.
2. Can an authorised representative lodge VL17 for the customer? If not, SC2 is
   worthless and the no-visit model needs rethinking.
3. Is a deposit against a specific bike already a vehicle sale agreement that
   must be in the Schedule 5 form? Decides whether Part A is viable at all.
4. Does an online flow satisfy cl 1.1's "copy provided at the time of signing"?
   SC6 is drafted on the assumption that it does.
