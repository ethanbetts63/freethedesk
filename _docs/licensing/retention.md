# Retention — the sale flow

_Decided 19 September 2026._ What the online licensing product keeps, for how
long, and what happens then.

This exists because the customer flow creates a personal-data tier FreeTheDesk
did not have: a member of the public's name, date of birth, driver's licence
number, residential address, and photographs of their licence and their face.
`pii_inventory.md` records G1 — _there is no retention or deletion anywhere in
FreeTheDesk_ — and adding the most sensitive category either system holds
without answering it is the thing `02-sale-flow.md` refuses to do.

The security standard requires each private-document category to state a
retention period. This is that statement for the sale flow. It does not cover
the categories that already existed; those stay in `pii_inventory.md` Part 4,
still open.

## The schedule

**Nothing in the sale flow is deleted.** That is the decision, not the absence
of one.

| Category                                                                       | Retain until                          | Then                                                                      |
| ------------------------------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------- |
| Identity images — licence front, licence back, selfie                          | **not yet settled** — see below       | —                                                                         |
| Signed `SaleDocument` files                                                    | **not yet settled** — see below       | —                                                                         |
| `Sale` personal fields — DOB, licence number, purchaser and licensee addresses | **not yet settled** — see below       | —                                                                         |
| `SaleEvent`                                                                    | kept — the audit trail is the product | —                                                                         |
| `Sale.access_password_hash`                                                    | the sale is cancelled                 | cleared with the sale's other access, when cancellation is built (step 8) |

There is no purge command and no scheduled deletion. There was one — it removed
the identity images 30 days after a sale ended — and it was removed along with
the period it enforced, because the period was wrong.

## Why the identity images are kept

They are **evidence of due diligence**, not a by-product of the check.

A dealer asked in three years why they licensed a vehicle to a particular person
has to be able to show what they looked at, not merely record that they looked.
A verdict without the photographs behind it is the dealer's own assertion that
they were satisfied; the photographs are the thing that makes the assertion
worth anything. Destroying them on a timer converts evidence into a claim, and
it does so exactly when the sale is old enough for somebody to start asking.

The earlier 30-day rule got this backwards. It treated the images as a means to
the verdict, spent once the verdict existed — which is true of a machine's
verdict and false of a person's.

## The period that is not ours to invent

How long a motor vehicle dealer must keep a sale record is set by the **Motor
Vehicle Dealers Act 1973 (WA)** and its regulations, not by us.

**What was looked up, 19 September 2026.** The regulations consolidation held in
`wa_dealer_forms/` (03-j0-00, as at 7 Jun 2024) was searched for stated periods.
It contains exactly one: reg 12(2)(b), **trust account records kept for not less
than 6 years** from the date the money was received. That is a trust-money duty
and does not on its face reach a sale record.

The Form 1 register duty sits in **s25 of the Act**, and the Act itself is not in
this repository — the regulations prescribe the register's _form_ (reg 3) and its
_medium_ (regs 4, 4A) and say nothing about how long it is kept. So the period is
still unverified.

**Until it is verified, nothing is deleted.** Retaining costs nothing and changes
nothing; guessing at a period and enforcing it could destroy a record a dealer is
required to hold, and that is not recoverable. Knowing the number enables a
deletion rather than unblocking one.

Two things to obtain before the first external dealer transacts:

1. s25 of the Motor Vehicle Dealers Act 1973 (WA), and any regulation under it
   prescribing how long the register of prescribed transactions is kept.
2. Whether the duty attaches to the **register** only, or to the sale documents
   and the identity evidence behind each entry.

## The tension, stated rather than hidden

APP 11.2 asks an entity to destroy or de-identify personal information once the
purpose it was collected for is exhausted, unless a law or a court order
requires it to be kept. Keeping photographs of a stranger's face and licence
indefinitely is only defensible while the record-keeping duty above actually
reaches them.

So the two questions are the same question, and the answer above is provisional
in one direction only: if the duty turns out not to cover the identity evidence,
a period has to be chosen for it and this file changes. Nothing is being deleted
in the meantime, which is the recoverable side of the choice.

## The dealer's own copy is theirs

Anything a dealer downloads leaves this retention schedule entirely. Their
obligations over it are their own. That is said in the dealer subscription terms
rather than implied by the product managing it, because implying otherwise would
have a dealer relying on a deletion we cannot perform.

## What the customer is told

The [customer terms](../../frontend/content/legal/customer-platform-terms.md)
say the identity photographs are kept and why, and the
[privacy policy](../../frontend/content/legal/privacy-policy.md) carries the
whole table above, including that the period is unsettled and that nothing will
be deleted before it is published. A retention schedule the subject cannot read
is a schedule that is not being offered to them.
