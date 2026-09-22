# Documents

How each document is produced, signed, stored and served. `02-sale-flow.md`
settles which documents exist and in what order; this settles how they are built.

## Two kinds of document, two techniques

| Kind                  | Source                                        | Technique                |
| --------------------- | --------------------------------------------- | ------------------------ |
| VL17, MR9B            | A published PDF with named form fields        | Fill an AcroForm         |
| Form 5A, Form 6       | A published PDF, shown not filled             | Serve the pinned version |
| Vehicle Sale Contract | A form of words in Schedule 5, no form exists | Typeset from source      |
| Authority to Lodge    | Ours, does not exist yet                      | Typeset from source      |

The split matters because it decides what breaks when the Department reissues
something. A reissued VL17 can rename a field and produce a silently blank box; a
reissued Form 5A only needs the new file. The contract is unaffected by either,
because Schedule 5 is regulation text rather than a published form — it changes
when the regulations change, which is a different and slower event.

## Templates as records

`FormTemplate` carries `kind`, `version_label`, `effective_from`, the `file`, and
`is_current`. The **field map stays in code**, keyed by `(kind, version_label)`.

That split is the whole design. The file is the part staff can swap when the
Department publishes a new one; the field map is the part that needs a developer,
because a renamed field is a code change however it arrives. Putting the map in
the database would mean a person editing field names in a form to fix a document
that is silently wrong.

Generation asserts a map exists for the pinned version and **refuses** when it
does not. Without that assertion the failure mode is a form that prints with
empty boxes, which looks like a customer who did not fill something in and gets
discovered at a Department counter. With it, the failure is a 500 at generation
time with the version in the message.

Every prescribed form was reissued July to August 2025 and the regulations
consolidation on hand is June 2024. Checking for reissues is a standing task, and
the reason `is_current` is a column rather than "the newest row".

A `SaleDocument` pins `template_version` and becomes immutable once signed.

## VL17 and MR9B

New stock is licensed for the first time, so VL17. Used stock has an existing
licence transferred, so MR9B. Both are fillable AcroForms, so this is writing
values into named fields.

```python
writer.set_need_appearances_writer(True)
for page in writer.pages:
    writer.update_page_form_field_values(page, values)
```

Two rules, both from allbikes and both load-bearing:

**Never refuse.** Both forms stay fillable, so a detail not yet held prints as a
blank box somebody can write in rather than as a document nobody can produce.
Blocking the download only ever moves the problem to a counter. The one gate is
price — a form quoting no price is not worth reading — and that is a 409 with a
sentence, not a failure.

**Leave signature and declaration-date fields blank.** These are statutory
declarations. Prefilling saves the customer copying details out; signing on their
behalf would forge the one act the declaration is about. Signatures are applied
only by the signing step below, and only after a declaration.

**Nothing is written to disk.** A filled form carries a licence number and a date
of birth. It is generated on demand and streamed.

### The postal address question

Where the Department sends the papers is the delivery address when there is one,
falling back to the licensee's address for a collection. They are one address,
not two, and carrying them separately invites them to disagree on a form the
customer signs a declaration about.

### MR9B's unresolved problem

MR9B is a two-part carbon form signed by both parties, so it cannot be produced
digitally in the form the Department issues. The product prefills and stamps it
anyway and the dealer handles the physical copy.

Three ways out, in preference order: the dealer is on Dealer Online and the form
disappears entirely; DVS accepts a printed substitute bearing an electronic
signature; or the dealer prints and completes it by hand from a prefilled copy.
The middle one is open question 4 and is unanswered.

Until it is answered, the used path is **not fully automatable for a dealer
without Dealer Online**, and the sales material must not say otherwise.

## The Vehicle Sale Contract

Schedule 5 is a form of words in the regulations, not a published form, so the
document is typeset. Structure, in order:

1. **Masthead** — the dealer's logo where they have one, the title, and the
   citation of the regulations.
2. **Purchaser details** — purchaser, address, email for cl 9.1 notices, phone,
   licence holder and licence number, date of birth, and the licence holder's
   address when it differs.
3. **Seller details** — trading name, dealer licence number, ABN, premises,
   email for cl 9.1.
4. **Vehicle details** — description, condition, capacity, stock number, VIN,
   engine number, odometer, registration and expiry, delivery date.
5. **Payment details** — vehicle price, delivery fee, total including GST,
   deposit, balance, trade-in and finance marked N/A, reference.
6. **Special conditions** — the dealer's approved set, filtered per sale.
7. **Terms and conditions** — the prescribed clauses, verbatim.
8. **Signatures** — with cl 1.1 and cl 1.2 restated above them.

**The prescribed terms are reproduced verbatim and never reworded.** They live in
one module as structured data — part number, part heading, and clauses with their
subclauses — so that the text is a block that can be read against the regulations
rather than strings scattered through layout code. Anything that differs from
them is a Special Condition printed in its own section, per cl 5.2.

Trade-in and finance are marked **N/A** rather than left blank. A blank field on
a contract reads as something forgotten.

The delivery date is a real decision, not a formatting one: cl 4.1 requires
delivery on or before the date stated, and cl 4.2 only supplies the three-month
default when no date is stated. State a date with buffer, because that date
becomes the obligation and missing it is a dealer breach under cl 7.1 giving a
full refund and no damages.

**Signature fields are blank until signed.** Clause 1.1 makes signing the
Purchaser's offer, and pre-signing on their behalf forges the one act the clause
is about.

A running header and "Page X of Y" on every page. A contract that gets separated,
printed one-sided or scanned out of order has to be reassemblable, and a page
with no number and no title is a loose sheet nobody can place.

### Special conditions, selected per sale

The dealer's approved set from `condition_choices`, filtered by the sale:

| Condition                             | Applies when                    |
| ------------------------------------- | ------------------------------- |
| SC1 Place of delivery                 | Delivery, not collection        |
| SC2 Authority to licence              | Always. Forks on licence holder |
| SC3 Change of colour or specification | New stock                       |
| SC4 Revision of the delivery date     | New stock                       |
| SC5 Balance payable before delivery   | New stock                       |
| SC6 Notices and electronic documents  | Always                          |
| SC7 Risk in the vehicle               | Delivery, not collection        |
| SC9 Delivery inspection               | Delivery, not collection        |
| SC10 Identity documents               | Always                          |

**There is no SC8, and that is deliberate.** Allbikes has one — capping the
dealer's pre-estimated damages at the card processing fee actually incurred —
because allbikes takes the customer's deposit through its own Stripe account and
has a real `balance_transaction.fee` to point at. FreeTheDesk never touches the
money; it moves customer-to-dealer by BSB. A clause whose amount is a fee nobody
in the transaction incurred is not a genuine pre-estimate under cl 8.3.

So the clause is dropped, per `open-questions.md` Q11, and **prescribed cl 8.2
operates unmodified** — pre-estimated damages capped at 5% of the total purchase
price. A dealer who does take card deposits by their own means and wants the
narrower cap can add it as one of their own conditions, which is exactly the case
the additions mechanism exists for. The numbering keeps its gap rather than
closing it, so that a contract from either system is comparable clause by clause.

A condition about where a vehicle is delivered has no business on a contract for
one being collected from the yard.

**SC5 is new-stock only, and this corrects allbikes.** Its justification — the
Department will only accept proof of ownership showing paid in full, and the
vehicle must be licensed before delivery — is a _first licensing_ problem. A used
vehicle is already licensed, MR9B is lodged within seven days of sale, and
nothing requires transfer before delivery. On the used path prescribed cl 3.1
works unmodified. Allbikes prints SC5 on every contract; this does not.

SC2 forks on whether the purchaser is the licence holder. When they are not, it
names the proposed licence holder, records their agreement, carries their
authority to lodge, and states that none of it makes them a party to the
contract.

## The Authority to Lodge

New, and the price of selling the plans separately. A licensing-only dealer has
no Schedule 5 contract, so SC2 has nowhere to live.

**This is a drafting brief, not wording.** Build against a draft — like every
other clause here it is a published agreement version, so the reviewed wording
lands as a version bump rather than as a change to anything that was built around
it.

It must carry:

- The purchaser's appointment of the dealer as their authorised representative
  for lodging the application to licence the vehicle with the Department of
  Transport, and any supporting documents, on their behalf.
- Identification of the vehicle and of the proposed licence holder, so it is
  specific rather than a general power.
- The fork for a licence holder who is not the purchaser, mirroring SC2.
- Consent to sign and to receive it electronically, mirroring SC6 — without which
  the Electronic Transactions Act 2011 (WA) s10 is not satisfied, because s10
  turns on the consent of the person the signature is given to.
- Consent to the dealer holding a copy of the licence and its details for that
  purpose, mirroring SC10.
- That it is not a contract of sale and creates no obligation to buy.

That last point is the one to get right. A licensing-only dealer is using this
product _alongside_ whatever contract they use themselves, and an instrument that
reads like a sale agreement would collide with it.

## Warranty notices

Form 5A or Form 6, decided by reg 7 and served as the pinned template version.
Not filled, not modified — reg 7 requires the purchaser be _given_ an information
statement in the form of Form 5A or Form 6, and the form is the statement.

The reg 7 test, all three conditions:

|                      | Motorcycle | Car (later) |
| -------------------- | ---------- | ----------- |
| Cash price incl. GST | ≥ $3,500   | ≥ $4,000    |
| Age                  | ≤ 8 years  | ≤ 12 years  |
| Odometer             | ≤ 80,000km | ≤ 180,000km |

Pass all three and it is Form 5A with the "Used Bike Warranty" illustration,
three months or 5,000km. Fail any and it is Form 6. New stock gets neither — the
manufacturer's warranty information is shown instead, which is product copy
rather than a prescribed form.

**Given before the sale.** Reg 7 says so twice, once for each form. It is its own
gate ahead of signing, not a page in the pack.

**The acknowledgement carries a fingerprint.** Price, condition, year and
odometer are hashed at the moment of acknowledgement. If any of them moves the
hash no longer matches, the acknowledgement stops counting, and the customer is
shown the current notice. Derived rather than flagged, so it cannot fall out of
step with the edit that caused it — the failure it prevents is a customer who
acknowledged that a statutory warranty applied and then bought a vehicle where it
does not.

## Signing

Not a cryptographic certificate, and the documentation should never call it one.
It is an electronic-signature record, and the claim it supports is narrow and
defensible: _this authenticated session made this declaration against this exact
document at this time from this address._

The sequence, in one transaction with the sale row locked:

1. Re-derive the requirements server-side and refuse with a 409 if the gate is
   not open. A stale tab must not produce a signed document.
2. Build the final PDF with the signature applied — the customer's drawn
   signature (a `freetheplatform.signatures.SignatureImage`) stamped into the
   signature box for a prescribed form, or placed in the contract's signature
   cell, with "Electronically signed by \<name\>" and the timestamp as small
   print beside it. The renderers in `documents/render/` already take the
   image; the allbikes builders are the working reference for form geometry.
3. SHA-256 the bytes, then append the signing-evidence page
   (`freetheplatform.signatures.append_evidence_page`) so the record travels
   inside the document — the printed hash names the signed content, not itself.
4. Store the file, the signer's name, the moment, the verbatim declaration, the
   hash, the client address, the user agent, and the original signature PNG in
   private storage — the drawn mark is the artefact a dispute would compare
   against a licence.
5. Record a `freetheplatform.agreements` acceptance with the document kind and
   the hash in `context`.
6. Advance the sale and write a `SaleEvent`.

MR9B is stamped on **both** its seller and purchaser copies, because each carries
the same purchaser signature.

The evidence lives in two places on purpose: the agreements acceptance is the
immutable record, and the columns on `SaleDocument` sit beside the file so that
what a dealer opens in a dispute and the evidence about it are not in two
systems.

### The dealer's countersignature

The same mechanism, with two differences. The dealer has an optional
`signature_image` stamped into their block instead of a typed name, and the
completed PDF replaces the customer-signed one as the `sale_contract` document —
a contract signed by one party and a contract signed by both are the same
document at two moments, not two documents.

The customer-signed version's hash and evidence are retained in the agreements
acceptance, so what the customer signed remains provable after the dealer signs
over it.

### Staleness

`is_stale` compares a document's `uploaded_at` against the sale's
`details_updated_at`. Derived, never stored, because a flag can fall out of step
with the edit that set it.

A stale document is shown as stale to both parties rather than hidden. The dealer
needs to know it exists and why it no longer counts, and the customer needs to be
sent back to sign rather than left thinking they are finished.

## Storage and serving

**Unsigned documents are never rows.** Generated on demand, streamed, gone. They
carry a licence number and a date of birth and writing one to disk creates a file
nobody asked for and nothing deletes.

**Signed documents persist** in the private tree outside `MEDIA_ROOT`, on the
storage class pattern `dealers/utils/storage.py` already establishes. No
webserver is pointed at that tree, which makes the authenticated view the entire
access-control story for them.

Two views, two authorisations, one streaming helper: the customer reaches their
own documents through the sale access cookie, the dealer through their session
and tenant scope. Sharing the streaming and not the authorisation is deliberate —
the shared part is mechanical, and the part that decides who may read a driver's
licence stays visible at each call site.

Paths carry no original filename and no personal detail, following
`dealers.models.dealer_document_path`: a UUID under a directory keyed by id.

## The pack

The dealer's sale page lists every document with both versions — unsigned always,
signed once it exists. They answer different questions: the unsigned copy is what
gets printed when something has to be done by hand or a customer wants to read it
on paper, and the signed one is the record.

A single merged pack is **not** in v1. It is a small piece of work and an easy
addition later; what makes it unattractive now is that a merged PDF of documents
at different signature states is a document whose own status is ambiguous. Per
document, per state, until there is a reason to bundle.

## Libraries

`pypdf` for AcroForm filling and page merging, `reportlab` for typesetting and
for the signature overlay. Both are already proven on exactly these documents in
allbikes, and neither is in FreeTheDesk's requirements yet — they are new
dependencies, pinned to the installed and passing versions per section 17 of the
[security standard](../../../../freetheplatform/_docs/security-standard.md).
