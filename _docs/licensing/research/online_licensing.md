# Online licensing (WA)

Research answering three questions for `dealer_direct_to_your_door.md`:

1. Can the customer sign the licensing forms online, without us seeing them in
   person as a dealer?
2. Other dealers are doing online licensing. How?
3. If nobody sights the customer, who is checking that the person who signed is
   the person the ID belongs to?

Researched 26 Aug 2026 against primary legislation and current Transport WA
(DTMI) guidance. Not legal advice. Corrects two claims in
`wa_dealer_forms/README.md` — see **Corrections** at the end.

**Short version.** The in-person requirement was never about the *customer*.
DoT's own guidance says a dealer licenses the vehicle and an authorised
dealership representative may lodge the application. So the no-visit promise
does not need an electronic-signature argument at all. And the dealers already
doing this are not e-signing anything: they are on **Dealer Online**, licensing
the bike directly in the DVS system before it ever reaches the customer — which
we already hold, so questions 1 and 2 are closed for us.

**Question 3 is the live one, and it is a real gap.** Nobody verifies it, by
design. DoT's proof-of-identity standard for a WA licence holder is the *licence
number* — a record match against its own database, not a check that the person
typing it is its owner. Dealer Online inherits that standard, and it is fine for
a counter transaction where a human is standing there. Remove the counter and
the binding between person and document disappears with it. Nothing in the law
tells us to close that gap; the exposure if we don't is commercial, and it lands
on a third party who never bought anything from us. See section 3.

**Read the DOS contract before acting on any of this.** NSW publishes the
business rules for its equivalent scheme and they deputise the dealer as the
identity checker outright. Ours are not public — but we signed them. If they say
something similar, the standard is already set and section 3 becomes a matter of
meeting it rather than choosing one.

## 1. Signing the licensing forms online

Three questions get conflated here. Separating them settles it.

### Is an electronic signature legally valid on these forms?

In principle yes, and nothing in the vehicle-licensing statutes says otherwise.

- **Road Traffic (Vehicles) Act 2012 s5(1)(a)** — an owner applies for the
  grant, renewal or transfer of a licence by "submitting an application **in a
  form approved by the CEO**". That is the entire statutory requirement. No
  signature requirement, no writing requirement, no in-person requirement.
- **Road Traffic (Vehicles) Regulations 2014 r22** — an application must be
  accompanied by proof of age and identity "**that the CEO requires**". **r23**
  — the CEO *may* require proof of ownership and *may* require verification by
  statutory declaration.
- **RTV Act s10(2)** — a person who becomes the owner of a licensed vehicle
  must within 14 days "**give notice in writing** to the CEO".

Every operative requirement is delegated to the CEO. There is nothing to
contradict the Electronic Transactions Act.

- **Electronic Transactions Act 2011 (WA) s9** — a requirement to give
  information *in writing* is met electronically if it is readily accessible for
  subsequent reference **and the person to whom it is given consents**.
- **s10** — a requirement for a *signature* is met electronically if the method
  identifies the person and indicates their intention, is as reliable as
  appropriate, **and the person to whom the signature is required to be given
  consents**.
- **Electronic Transactions Regulations 2012 rr3–4** — the only carve-outs are
  wills and codicils, enduring powers of attorney, anything required to be
  "verified, authenticated, attested or witnessed under the signature of a
  person other than the author", and anything required to be delivered by
  personal service. **None of them apply.** VL17 and MR9B carry a bare
  "SIGNATURE OF DECLARANT" / "PURCHASER'S SIGNATURE" with no witness block, and
  neither is served personally.

So the statutes are permissive. But s9 and s10 both turn on the same hinge.

### Will DoT accept one? — this is the real question

For the licensing forms, **the person to whom the signature is given is DoT**,
so **DoT's consent is the gate** — not the customer's. The ETA hands the
decision to the recipient and DoT has already exercised it: it publishes a paper
process and, for a vehicle not previously licensed in the applicant's name,
requires the application to be lodged at a counter. There is no statute to argue
with. It is administrative policy that the ETA expressly defers to.

**This is the crucial split.** The paperwork the customer signs *with us* — the
Schedule 5 sale contract, Form 4, Form 5A/6 — is a different case entirely.
There the signature is given to the *other contracting party*, so both parties
can consent to electronic signing in the terms, and s10 is satisfied. That half
of the pack can go fully electronic on our own authority. It is only the forms
addressed to DoT that need DoT's say-so.

### Does anyone have to attend in person? — yes, but it is us

Verbatim from DoT's *License a vehicle in Western Australia* page:

> Note: In most cases a motor vehicle dealer will license a new vehicle.

> If the vehicle is not licensed in WA or hasn't been in your name before, **you
> or an authorised dealership representative must present the application in
> person**, with proof of ownership from the seller (a licensed dealership in
> this case).

And from *Buy a vehicle and transfer a vehicle licence*:

> When you buy a licensed vehicle from a car dealer, **it is the dealer's
> responsibility to complete the steps to transfer the vehicle licence into your
> name**.

The buyer's only obligation is to pay the transfer fee and vehicle licence duty,
which DVS invoices them for directly.

**Answer to question 1.** The customer never has to be seen by us or by DoT. A
counter visit is required for first licensing, but an authorised representative
of the dealership may make it, and that clause is published on DoT's own site
rather than inferred from the form. The one genuinely open point is narrow:
whether DVS will accept a **printed VL17 bearing the customer's electronic
signature** when our rep lodges it. That is the question to put to DVS — and it
only matters if we cannot get onto Dealer Online, which removes the form
entirely.

## 2. How other dealers do it: Dealer Online

**Dealer Online (DOS)** is DoT's dealer portal. Verbatim, it lets a dealer:

> - create and issue a registration for a 'factory new' vehicle
> - transfer ownership of a vehicle into your dealership's name when acquiring
>   vehicles in the normal course of business
> - **transfer ownership of a vehicle owned by your dealership to a new owner**
> - pay transfer fees and adjustments
> - renew vehicle registrations owned by your dealership
> - change the number plates on vehicles and to reissue them to another vehicle
> - produce duplicate copies of registration papers …
> - calculate the registration fee of a new registration
> - delicence a vehicle through the return of the number plates

The first and third bullets are the entire licensing spine of the plan. A dealer
on DOS mails no MR9B and queues at no counter — they transact directly against
the DVS system. That is why the customer never sees a licensing form, and it is
the same mechanism behind Tesla telling WA buyers it will "process registration
on your behalf, either directly or via an authorised agent", and behind Cars24
and Carma delivering registered cars.

Note the consumer portal is **not** an alternative: DoTDirect's online transfer
explicitly excludes "transfers involving companies or organisations", so the
dealer-to-customer direction cannot be run through it. Dealer Online exists
precisely to fill that gap.

Hours are Mon–Fri 7:45am–6:00pm and Sat 8:00am–1:00pm, with MFA via Microsoft
Authenticator — so licensing is not a 24/7 automated step, and a bike bought on
a Sunday is licensed on Monday.

### Eligibility (met — recorded for the record)

We hold a Dealer Online account, so this is history rather than a task. It is
worth keeping because the criteria explain *why* the department is willing to
let a dealer transact directly, which matters to the identity question below.

> - currently licensed under the Motor Vehicle Dealers Act 1973 with the
>   appropriate class of licence to buy, sell and auction vehicles
> - have a licenced premise in WA and hold a Certificate Authorised Premise
>   (CAP) number …
> - be in the business of selling new and/or used licensed motor vehicles,
>   **motor bikes** or caravans …
> - have operated in Western Australia for a minimum of 3 months
> - **conduct a demonstrated minimum of 25 monthly transactions**
> - hold a current **Bulk Licensing Permit** (new vehicle dealers only)
> - a site inspection of the company premises may be required.

Plus National Police Clearances for all owners/partners/directors, public
liability and workers compensation insurance details, a contract with DTMI
setting out terms of use, and a nominated employee completing ~2 hours of
eLearning plus one day of practical training at Innaloo.

Note what that list is and is not. It is a vetting of **the dealer** — licensed,
premises-inspected, police-cleared, trained, under contract, with a named
authorised representative. The department's control over a DOS transaction is
the dealer's accountability for it. There is no step anywhere in it that vets
the *purchaser*. That is deliberate, and it is the whole of section 3.

### The second half: the Bulk Licensing Scheme

A **Bulk Licensing Permit** is a DOS prerequisite for new vehicle dealers, and
it is valuable on its own. It gives a dealer permission to

> certify the accuracy of information submitted and the fitness of standard
> motor vehicles or trailers for licensing purposes **without the need for a
> vehicle inspection**.

Join with **Form E177** (nomination/permit, listing authorised representatives),
then licence each vehicle with **Form VL1A**. The bulk licensing administration
fee is **$13.30** per vehicle. Only people named on the E177 may sign a VL1A.

This removes the AIS roadworthiness inspection from the new-stock flow, which is
the other step that would otherwise put the bike — and possibly the customer —
in a queue.

**Answer to question 2.** They are not signing forms online. They hold a Bulk
Licensing Permit and a Dealer Online account, and licence the bike themselves in
the DVS system before delivery. E-signature never enters it.

### The same pattern in every state

Dealer delegation is the national norm, not a WA arrangement. Every road
authority runs one:

| State | Scheme | What the dealer can do |
| --- | --- | --- |
| **WA** | Dealer Online (DOS), plus the Bulk Licensing Scheme | Issue registration for factory-new stock; transfer dealership-owned vehicles |
| **NSW** | DVRS agreement → Dealer Online (DOL) | Register new and second-hand, transfer, renew, lodge notices of disposal, exchange plates |
| **VIC** | myVicRoads Partner + New Vehicle Dealer Certification Scheme | "register most new vehicles and transfer registered Victorian vehicles without leaving the dealership" |
| **QLD** | TMR online transfer, dealer-side | Whole transfer completed online; the buyer finishes their half remotely |
| **SA** | EzyReg delegate | Dealer participates in registration transactions including CTP selection |

NSW confusingly also calls its portal "Dealer Online". Different system, same
idea. The takeaway is that nothing about our model is novel to a regulator —
every state has already decided a vetted dealer may transact on a customer's
behalf.

### NSW publishes its business rules, and they are pointed

WA does not publish the DOS business rules. NSW publishes the DVRS ones, and
they answer the identity question directly: dealers are **deputised as the
identity checker**. Authorised Services Officers must check customer Proof of
Identity "on behalf of Transport for NSW", against a 100-point check under the
Financial Transaction Reports Act 1988, accepting only documents on the approved
list, retaining photocopies, with customers **personally presenting** their
documents.

*Sourcing caveat:* Transport for NSW served 403s on both the DVRS Business Rules
PDF and the Motor Dealers Guide, so the above is from search extracts rather
than a direct read. Verify before relying on it.

If it holds, it changes the shape of section 3. It makes it likely that **our
DOS contract with DTMI carries an analogous clause** — and we have that document
where we do not have NSW's. Read it before setting any identity policy: it may
convert this from "no rule, exercise judgment" into "here is the standard we
already agreed to."

## 3. Who checks that the signer is the person on the ID

Nobody does. That is not an oversight in our flow — it is the design of the
whole regime, and it only becomes a problem when you take the counter away.

### DoT's standard is a record match

VL186 sets out what proof of identity a vehicle licence application needs:

> You will need to prove your identity by providing one of the following:
> • A Western Australian driver's licence number; **or**
> • Primary (eg. Passport, Birth Certificate) and secondary documents.

For anyone who already holds a WA licence, **the number is the proof**. Not the
card, not the photo — the number, checked against DoT's own records. Dealer
Online inherits exactly that standard: we key the purchaser's name, date of
birth and driver's licence number, and DVS matches them against its database.

At a counter that is perfectly sound, because a human is looking at the person
holding the card while the number is typed. The record match and the face match
happen together and nobody notices they are two separate things. Sell remotely
and they come apart: DVS still confirms the *record* exists, but nothing
connects the person at the keyboard to it.

### What the residual risk actually is

Not forged documents. **Impersonation using a real person's real details.**
Someone orders a scooter in a victim's name with a genuine licence number, we
licence it to the victim, and deliver to an address the fraudster controls. The
victim gets a DVS invoice for duty and the transfer fee, becomes the registered
owner of a bike they have never seen, and inherits every infringement it earns.
We are the mechanism.

### Nothing obliges us to close it

- **Vehicle licensing law:** the CEO takes the licence number as proof (VL186).
  No verification duty falls on the dealer.
- **Motor Vehicle Dealers Act 1973:** identity-proofs *us*, not the buyer —
  s17(1)(a) requires the Commissioner to be satisfied of a salesperson's
  identity, and ss16/17 require good character and fit-and-proper status for
  dealer, yard manager and salesperson alike. s25 requires the purchaser's name
  and address in the Form 1 register, and s25(3) makes it an offence to
  **knowingly** make a false entry — $5,000. "Knowingly" matters: recording a
  stolen identity in good faith is not that offence.
- **AML/CTF:** motor vehicle dealers were not captured by tranche 2. From
  1 July 2026 the new reporting entities are real estate, professional services,
  and dealers in precious metals and stones. No KYC duty from that direction.

### But the dealer's licence is what is exposed

There is no prescribed procedure, so there is also **no safe harbour**. Under
s20(1) the Commissioner may allege to the State Administrative Tribunal that a
licence holder

> (e) has engaged in fraudulent conduct in connection with carrying on business
> under an authorisation; or
> (f) **has been negligent or incompetent** in connection with carrying on
> business under an authorisation; or
> (g) has failed to ensure the proper management and supervision of business
> carried on under an authorisation

and SAT may disqualify a person from holding any authorisation (s20A(2)).
Paragraph (f) is the live one. If this flow is used for identity crime the test
becomes what a competent dealer would have done — and with no checklist to point
at, **the written policy is most of the defence**. Decide the standard
deliberately and record it.

### The four controls, and how they fit together

They close different gaps, at different points in the order. Only the
combination is complete.

**1. Record match — already free, via Dealer Online.** Keying the licence
number into DOS puts it against DVS's own database, which is the authoritative
source. A fabricated or mistyped number should fail there. This means **a
commercial DVS gateway provider (Equifax IDMatrix, IDsure, Cited and similar,
all reselling the federal Document Verification Service over NEVDIS) is probably
redundant for us** — we have the issuing authority itself in the loop. Worth
paying for only if we want the check to happen *before* taking money rather than
at licensing time.

*Assumption to confirm:* that DOS actually rejects a mismatched
name/DOB/licence-number combination rather than accepting it and reconciling
later. Cheap to establish — deliberately key a wrong digit on a live transaction
and see whether it bounces. Do that before relying on this layer.

**2. Person-to-document binding — the actual gap, and Stripe Identity closes
it.** Document checks and selfie checks are both available for Australia. Set
`options[document][require_matching_selfie]=true` and the customer photographs
their licence and takes a selfie; Stripe checks the document against a database
of known fraudulent templates, decodes machine-readable features for
consistency, runs presentation-attack detection, then face-matches the selfie to
the document photo. Failures come back as typed codes — `selfie_face_mismatch`,
`selfie_manipulated`, `document_expired`. Roughly $1.50 per verification, first
50 free, and we are already on Stripe so it is one API surface rather than a new
vendor relationship.

Note the ID-number check that would cross-reference a national database is
**United States only**, so Stripe cannot do layer 1 for us. This is precisely
why the two layers are complementary rather than alternatives: Stripe binds
person to document, DOS binds document to record.

**Second benefit, and it may be the bigger one.** The document images live at
Stripe rather than in our filesystem. `dealer_direct_to_your_door.md` flags
licence scans as a liability, and the `purge_bike_order_identity` command that
was meant to age them out was deleted with nothing behind it. Verifying through
Stripe Identity means we hold a pass/fail plus extracted fields, not a
front-and-back image of someone's licence — which retires most of that retention
problem instead of scheduling around it.

**3. Deliver only to the address on the licence — free, and probably the
strongest of the three.** Fraud on a physical good needs a delivery address the
fraudster controls. Insisting the bike goes to the residential address on the
licence removes the payoff almost entirely, because the goods land at the
victim's house. Stripe Identity returns `document.address` in the verification
report, so the comparison is automatic; DOS separately captures residential and
garaging addresses. Treat a mismatch as a hold requiring a phone call, not a
hard block — people legitimately move, and garaging address can differ from
residential.

**What this does not fix.** Licensing happens before delivery, because DVS needs
proof of ownership marked paid in full. So a fraudulent order is licensed in the
victim's name before any of this catches it, unless verification runs *up front*
— at deposit, or at the latest before the balance is taken. Put the Stripe
Identity step early in the order page checklist, not next to delivery.

**4. The delivery gate — and Carma has already proved it works.** We deliver to
the door ourselves, which is an in-person moment nobody planned as a control.
Carma, an Australian digital-first used car dealer, has made exactly that moment
their primary gate rather than a nicety: at delivery the customer **must** show
a valid Australian driver's licence to prove identity, **and** a comprehensive
insurance cover note in their own name for that specific car. Both compulsory —
without them the delivery does not complete and the driver leaves with the car.

Worth copying, including the insurance requirement, which is doing more work
than it first appears. Arranging comprehensive cover in your own name is itself
an identity-verified act performed by a third party with its own fraud controls,
and it is a difficult thing to do under a stolen identity. It also happens to
solve a separate problem: cl 5.2 of the Schedule 5 contract passes risk on
delivery, so a customer who cannot produce cover is one we should not be
handing a bike to anyway.

This is stronger than the "sight it at handover as a backstop" framing above.
Make it a gate: no licence and no cover note, no handover.

### Recommendation

Layers 2, 3 and 4, plus confirming layer 1 behaves as assumed — and reading the
DOS contract first, since it may already prescribe the standard.

- **Stripe Identity** at deposit, or at the latest before the balance. Document
  plus `require_matching_selfie`.
- **Delivery restricted to the address on the licence**, with a staff hold on
  mismatch rather than a hard block.
- **Carma's delivery gate**: licence sighted and face matched at handover, plus
  a comprehensive cover note in the customer's own name. No exceptions, because
  an exception process is what a fraudster looks for.
- **Skip the DVS gateway provider** unless the DOS test shows it is not doing
  the record match.
- **Write it down as policy.** Under s20(1)(f) that document is the defence.

Note the layering is deliberate: Stripe binds person to document *early*, before
we licence the bike in someone's name; the delivery gate catches anything that
slipped through *late*, before the asset leaves. Neither alone covers both ends.

## What is left to do

The licensing questions are closed. What remains is identity and the contract.

1. **Read the DOS contract and business rules.** We hold them; they are not
   public. If they impose a purchaser-identity obligation the way NSW's DVRS
   rules do, that is the standard, and everything below is built to meet it
   rather than invented from scratch. Do this before anything else.
2. **Test the DOS record match** (above). Decides whether a DVS gateway
   provider is needed at all.
3. **Build the Stripe Identity step** into the order page checklist, early —
   before the balance, not near delivery.
4. **Add the licence-address comparison** and a staff hold state for mismatches.
5. **Add the delivery gate** to the driver's process and to the customer-facing
   next-steps page, so nobody is surprised at the door: licence plus a
   comprehensive cover note in their own name, or no handover.
6. **Write the identity policy down.** Short. What we check, when, what fails,
   who reviews a hold. This is the s20(1)(f) defence.
7. **Consumer Protection remains a separate conversation** and is unchanged:
   cl 1.1 of the Schedule 5 contract, and whether a deposit against a specific
   bike is already a vehicle sale agreement. The ETA analysis in section 1 does
   support e-signing the contract itself, since both parties consent.

## Answered while here: immobilisers

`dealer_direct_to_your_door.md` asks whether scooters are exempt from the
approved immobiliser requirement. **Yes.** DoT's immobiliser page lists among
vehicles that "aren't required to have an immobiliser fitted":

> mopeds and motorcycles

An immobiliser is otherwise required on the grant of a licence and on transfer
of ownership, and the onus sits with the purchaser — but the exemption removes
that from our flow entirely, for new and used stock alike. Underlying rule: Road
Traffic (Vehicles) Regulations 2014 Part 10 r388; exemption gazetted in WA
Government Gazette No. 205, 22 Nov 2002, p. 5563.

## Corrections to wa_dealer_forms/README.md

1. **The purchaser has no 14-day errand.** The README states the buyer "must
   submit the red copy, in person at a DVS centre or by mail, within 14 days".
   That is not in the form and not in DoT's guidance. MR9B's own instructions
   put the whole lodgement duty on the dealer — blue copy, mailed within 7 days
   — and describe the red copy as something the dealer forwards or hands to the
   purchaser with the current licence papers. DVS then invoices the purchaser
   for duty and the transfer fee. The RTV Act s10(2) 14-day "notice in writing"
   duty is discharged *by* the dealer's MR9B lodgement; the 14-day deadline the
   README is thinking of is the **private-sale** MR9 obligation, which does not
   apply to a dealer sale.
2. **MR9B is therefore not an obstacle to the no-visit model.** It costs *us* a
   carbon form and a stamp. It costs the customer nothing and requires them to
   go nowhere. The README's conclusion that "three answers here decide whether
   used stock can run end to end online" overstates it — and Dealer Online
   replaces the form outright.

Also collected since: **VL12** (Application for the Grant or Transfer of Vehicle
Licence — the dealer form DoT's current licensing page points to, carrying the
Duties Act ss246/247 exemption declaration), **VL186** (proof of identity),
**VL50** (ownership declaration) and **MR9** (private-sale transfer, for
comparison). All are in `wa_dealer_forms/`.

## Sources

Primary legislation, quoted from current consolidations on legislation.wa.gov.au:
Road Traffic (Vehicles) Act 2012 (ss5, 10); Road Traffic (Vehicles) Regulations
2014 (rr15, 21–24, 388); Electronic Transactions Act 2011 (WA) (ss7, 8, 9, 10);
Electronic Transactions Regulations 2012 (rr3, 4); Motor Vehicle Dealers Act
1973 (ss16, 17, 20, 20A, 25, 31B, 31C, and the s5 definition of *salesperson*);
Motor Vehicle Dealers (Sales) Regulations 1974 (rr3, 4, 4A and Form 1).

Transport WA (DTMI), all read 26 Aug 2026:

- Dealer Online — https://www.transport.wa.gov.au/licensing/dealers-industry/dealers/dealer-online (page updated 9 Sep 2025)
- Bulk Licensing Scheme — https://www.transport.wa.gov.au/licensing/dealers-industry/dealers/bulk-licensing-scheme
- Sell and transfer a vehicle (Dealers) — https://www.transport.wa.gov.au/licensing/dealers-industry/dealers/sell-transfer
- License a vehicle in Western Australia — https://www.transport.wa.gov.au/licensing/vehicle/license-vehicle/western-australia
- Buy a vehicle and transfer a vehicle licence — https://www.transport.wa.gov.au/licensing/vehicle/buy-sell-transfer/buy
- Transfer a vehicle with DoTDirect — https://www.transport.wa.gov.au/save-time-transfer-a-vehicle-with-dotdirect
- Immobilisers — https://www.transport.wa.gov.au/licensing/vehicle/safety-standards-security/immobilisers
- Forms VL17 (29.04.2026), MR9B (21.05.2026), VL12 (18.04.2024)

Identity verification: Stripe Identity documentation — *Verification checks*
(document, selfie and ID number variants), read 26 Aug 2026, confirming AU
support for document and selfie checks, `require_matching_selfie`, the
`document.address` field in the VerificationReport, and that ID number checks
are US-only. Federal Document Verification Service and gateway service provider
model via idmatch.gov.au. AML/CTF tranche 2 scope from current practitioner
guidance (MinterEllison, Norton Rose Fulbright).

Interstate dealer schemes: Service NSW, *Apply for a Dealer Vehicle Registration
Scheme (DVRS) agreement*, and Transport for NSW *Motor dealers* / DVRS Business
Rules (search extracts only — TfNSW returned 403 on the PDFs, flagged in text);
Transport Victoria, *New vehicle dealer certification scheme*, and VicRoads
*myVicRoads Partner — transfers help*; qld.gov.au, *Registration transfer —
online*; CTP Insurance Regulator SA, *For motor vehicle dealers* (EzyReg
delegate).

Comparators: Tesla Support Australia, *Ordering a Vehicle* / *Taking Delivery*;
Cars24 Australia buyer guidance; **Carma** — *How Carma works*, terms and
conditions, and help centre article *What do I need to have with me when the car
is delivered?* (the licence-plus-cover-note delivery gate); MTA WA, *Department
of Transport WA Dealer Online System update*. No Australian motorcycle or
scooter dealer was found running the full flow — online purchase, delivered
licensed, no visit — as at 26 Aug 2026.
