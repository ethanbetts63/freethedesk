# Customer flow

Phase 3. The half that carries every legal constraint and most of the product
risk, which is why `02-sale-flow.md` settled its order before anything was built.

This is also the only part of FreeTheDesk a member of the public uses while
holding no account. Everything below follows from that.

## Access

Access to a sale is a capability scoped to that one sale — no signup stands in
front of it. Since then, **accounts have been layered on top** (mirroring
allbikes): the first send also creates an `auth.User` keyed by the customer's
email (`Sale.account`), adopting the same emailed password flagged
`must_change_password`; `/account` lists their sales across dealers and opens
one by trading the session for that sale's own cookie
(`sales/views/account.py`). The emailed link stays primary; the old
reference+password sale login is **retired** — recovery on another device is
the account, and a resend never touches the account password. An account
session may mint sale cookies because its password only travels by email; a
sale cookie proves nothing about the email, so the reverse direction does not
exist.

**The link.** `/sale/<reference>/<token>` is emailed when the dealer sends the
sale. Opening it posts the token once, server-side, and the response sets an
httpOnly cookie scoped to `/api/sales/<reference>/`:

```python
response.set_cookie(
    f"sale-access-{reference}",
    sale.access_token,
    max_age=60 * 60 * 24 * 180,
    httponly=True,
    secure=settings.SESSION_COOKIE_SECURE,
    samesite="Lax",
    path=f"/api/sales/{reference}/",
)
```

Scoped to that sale's own path so one sale's cookie is never offered up with a
request about another, and httpOnly because nothing in the page needs to read it.
This is the pattern section 12 of the
[security standard](../../../../freetheplatform/_docs/security-standard.md)
prescribes for a record that outlives a tab — a sale runs for weeks, and
`sessionStorage` dies when the tab closes.

The token is then out of the URL. A link in an inbox, forwarded or screenshotted,
stops being a live credential once redeemed on the customer's own device.

**Recovery.** Reference plus a password, emailed at send time. Two throttles,
because one gets it wrong in both directions:

- **Per reference** — the reference is effectively the username, and per-IP alone
  lets anyone with a modest address pool make unlimited attempts at one sale.
- **Per address** — stops one source working through many references.

A shared office NAT locking its own customers out of unrelated sales, and a
botnet getting free rein on a single reference, are the same mistake made from
opposite ends. Allbikes has both throttles and the reasoning in a comment; port
it.

**And a lockout, because the throttles are not the credential control.** Both
counters live in a per-worker cache that every deploy empties, so "ten attempts"
really means "ten, in one process, since the last restart" — a cost control.
Section 5 of the security standard and `freetheplatform.auth.lockout` both say
so in terms.

So `Sale` carries `access_failure_count` and `access_locked_until`, the same
shape `AccountSecurity` carries for a staff account, reading the same
`FTP_AUTH["LOCKOUT_THRESHOLD"]` and `LOCKOUT_DURATION`. One setting, both
credentials: two thresholds would be two numbers with no justifiable difference
between them, and `manage.py ftp_auth_config` prints what is in force.

Expiry is not optional. A lock with no end is a way of switching a customer out
of their own sale by typing at it.

The refusal is one sentence for every case — wrong reference, wrong password,
cancelled sale, locked — and a reference that does not exist spends a hash
against a dummy anyway, so it cannot answer faster than one that does.

**Not a role, not a portal.** `role` stays `staff | dealer | seo | none`. The
customer is authenticated by a capability, not by identity, and there is no user
row to give a role to.

`/sale/...` must stay **out** of `PROTECTED_PREFIXES` in `proxy.ts`. The edge
check there redirects anything without an auth cookie to `/login`, and a customer
holding a perfectly valid link has no auth cookie and never will.

Session-recording analytics are excluded from these routes, as section 7 of the
security standard requires of any customer-order page. This one shows a driver's
licence.

## The requirements engine

One function, `customer_requirements(sale)`, is the single source of truth for
what can happen next. Both the customer's screen and the dealer's checklist
render from it.

That is the point. Two implementations of "can they sign yet" disagree
eventually, and the way it surfaces is a customer being shown a button that
returns 409 — or worse, a dealer being told a sale is ready when it is not.

```python
{
  "details_complete": bool,
  "identity_verified": bool,
  "warranty_acknowledged": bool,
  "documents_signed": bool,
  "customer_marked_paid": bool,
  "payment_confirmed": bool,
  "can_sign": bool,
  "can_open_payment": bool,
  "next_action": "details" | "verify" | "sign" | "payment" | "done",
}
```

`can_sign` is `details_complete and identity_verified and
warranty_acknowledged`, and those three are in that order for the reasons in
`02-sale-flow.md` — reg 7 puts the warranty statement before the sale, and
identity goes early because a vehicle gets licensed in someone's name before
anything downstream would catch a fraud.

The API never trusts the client's reading of this. Every write re-derives it
server-side and refuses with a 409 and a sentence, so a stale tab is a clear
message rather than a corrupted sale.

## The screens

One page, four steps, rendered from `next_action`. A step bar across the top
showing what is done, what is current and what is left — allbikes' `OrderSteps`
is the shape, and `PortalSteps` already exists in this codebase.

### 1. Fill

What the forms and the warranty engine need, and nothing else.

**Licence holder.** Family name, given names, licence number, date of birth,
residential address.

**Purchaser.** "Are you buying this yourself?" — and when not, their own name and
address. Ordinary enough to be first-class: a bike bought by a parent and
licensed to a child is a normal sale, and it changes which special condition
prints.

**Company.** "Is this being licensed to a company?" — and when so, company name,
ACN, organisation code.

**Where it is kept.** Primarily in WA, yes or no. A VL17 checkbox.

**Delivery.** Address, when the dealer set the sale to delivery.

Track A under the
[forms standard](../../../../freetheplatform/_docs/forms-standard.md) — three
conditional field groups is exactly the cross-field case the track exists for.

**Editable for as long as they still have something to do**, not only on the
first pass. These details print onto the documents they are about to sign, so
noticing a misspelt name at the moment of signing is precisely when it should be
fixable. Refusing would send the wrong name to the Department of Transport rather
than prevent it. The door closes when their checklist is empty — from then on a
change is a conversation with the dealer.

Saving stamps `details_updated_at`, which is what makes any already-signed
document stale.

### 2. Verify

Licence front, licence back, selfie. Three uploads, each with its own state,
because a clear licence and an unusable selfie is the ordinary failure and one
verdict across three files makes them redo all of it.

Submitting moves the sale to `awaiting_identity_review` and tells them plainly
that a person at the dealership will look at it — not "processing", which implies
a machine and a wait measured in seconds. A rejection comes back as the dealer's
own sentence, with the offending image cleared and the others kept.

Same upload pipeline as every other document in the product: sniffed by bytes,
fully parsed with bounded pixel counts, renamed to the verified type, stored
outside `MEDIA_ROOT`. Nothing here is a new control.

The whole step is replaced by a Stripe Identity redirect later. It is written to
be deleted: the screen reads `verification.status` and knows nothing about how it
got there.

### 3. Sign

Two parts, in an order the law fixes.

**The warranty notice first.** Used stock gets Form 5A or Form 6 by the reg 7
test; new stock gets the manufacturer's warranty information. Presented in full,
with the actual form to read, and acknowledged explicitly before anything else on
this step is reachable.

Reg 7 says _before_ the dealer sells. Not bundled into the pack afterwards, not a
checkbox beside the signature. Its own gate, in front of the documents.

If price, condition, year or odometer have moved since they acknowledged, the
fingerprint no longer matches and they are shown the current notice again. The
alternative is a customer who acknowledged a statutory warranty applied and then
bought a vehicle where it does not.

**Then the documents.** Each one is read in the browser and signed by typing
their full name, confirming a declaration, and **drawing their signature** on
the registry's `SignaturePad` (validated server-side by
`freetheplatform.signatures`; one drawing is shared across the documents until
redrawn). The drawn mark is what lands in each document's signature box — on a
licensing form it should match the licence — while the evidentiary weight still
comes from the authenticated session, the explicit declaration, and the hash of
the exact document it was made against. Allbikes runs this flow in production;
converge with it rather than redesigning.

Declarations, which are the record and are stored verbatim:

> **Contract.** I have read this vehicle sale contract and intend to sign it
> electronically. I understand that my signature is an offer to buy the vehicle.

> **Licensing form.** I declare that the information in this vehicle licensing
> form is true and correct and intend to sign this declaration electronically.

> **Authority to Lodge.** I authorise the dealer to lodge the application to
> licence this vehicle, and any supporting documents, on my behalf.

The contract's wording says _offer_ because cl 1.1 says offer. A customer who
believes they have bought a vehicle when they have made an offer has been
misled by the interface, and the screen after signing has to say the same thing:
**this is an offer until the dealer accepts it**, with the current status shown
live.

Signing is one transaction, with the sale row locked. The server builds the final
PDF, hashes it, stores the evidence, records the acceptance and moves the state
together or not at all.

### 4. Pay

Shown after the dealer accepts, not before. The dealer's account name, BSB and
account number, the amount, and the reference to quote.

Then a button: **I have paid this**. That is all it is — a claim, timestamped,
which notifies the dealer to go and look at their bank. A proof-of-payment upload
is accepted beside it and advances nothing on its own, because a screenshot
proves a file arrived, not that money did.

Licensing unlocks when the dealer confirms receipt, which is a separate act by a
separate actor. FreeTheDesk never sees the money and should never imply it has.

### Done

Every signed document, downloadable. What happens next, in the dealer's words
where the dealer set them. The dealer's contact details, because from here the
customer's questions are for them.

## What they can always see

Across every step, in a panel that does not move: the vehicle, the price, the
dealer's name and contact, the reference, and the current status in plain words.

After signing, that status is a live answer to the only question they will
actually have — _has the dealer accepted yet_ — and cl 1.3 makes it a real
question rather than an anxious one. Offers do lapse.

## API

All unauthenticated, all resolving the sale from the access cookie in `initial()`
rather than in each handler. A base view that resolves once and raises otherwise
means a handler cannot be added that forgets the check — allbikes arrived at that
after writing the same four lines nine times, and the convention had already
failed once by then.

| Endpoint                                   | Method | Throttle scope                 |
| ------------------------------------------ | ------ | ------------------------------ |
| `sales/<reference>/redeem/`                | POST   | `sale-access`                  |
| `sales/<reference>/login/`                 | POST   | `sale-login` + `sale-login-ip` |
| `sales/<reference>/`                       | GET    | `sale-customer`                |
| `sales/<reference>/details/`               | PATCH  | `sale-customer`                |
| `sales/<reference>/identity/<side>/`       | POST   | `sale-upload`                  |
| `sales/<reference>/warranty/`              | POST   | `sale-customer`                |
| `sales/<reference>/documents/<kind>/`      | GET    | `document-render`              |
| `sales/<reference>/documents/<kind>/sign/` | POST   | `sale-customer`                |
| `sales/<reference>/payment/marked/`        | POST   | `sale-customer`                |

Five new scopes. `sale-login` and `sale-login-ip` are credential-class and
tight. `sale-upload` and `document-render` are cost. `sale-customer` is ordinary
traffic by a customer working through their own sale, set where a runaway client
stops and a person filling in a form never notices.

Every response carries `Cache-Control: no-store` through the existing middleware,
which matters more here than anywhere else in the product: these pages show a
date of birth and a licence number.

## Input bounds

Every string is bounded at the serializer through
`freetheplatform.security.bounds`, per section 9 of the security standard. This
is the one place in FreeTheDesk where an anonymous member of the public writes to
the database repeatedly over weeks, so the ceilings are the control and the
browser copy exists only to tell them at the point of typing.

Three traps worth restating because they produce fields that look bounded: a
model `TextField` reaches a `ModelSerializer` unbounded, DRF's `EmailField` and
`URLField` are unbounded by default, and an anchored regex is already a bound — a
WA postcode is `^\d{4}$` and needs nothing else.

## Emails

Three reach the customer during the flow and one after: the link with their
password, the identity rejection with its reason, the notice of acceptance with
the executed contract, and the completion with every signed document.

The notice of acceptance is the one that matters legally — it is cl 1.2's second
limb — and it is sent by the system so that it is a recorded event rather than
something a dealer meant to do.

## Privacy, which is a build item here

This flow creates a personal-data tier FreeTheDesk does not have today: name,
date of birth, driver's licence number, residential address, and images of a
licence and a face. It also creates a disclosure — the dealer sees the customer's
identity documents — which is a third party receiving personal information
through us.

Three things ship with this phase, not after it:

1. **Customer platform terms**, carrying consent to transact electronically, to
   identity verification, and to the dealer seeing the images. Open question 17's
   second document, and nothing else covers this relationship.
2. **A privacy policy naming who holds what**, including that the dealer receives
   it and how long we keep it.
3. **`_docs/pii_inventory.md` rewritten.** It currently describes a system with no
   customer data in it at all.

Plus the retention schedule from `03-data-model.md`, which is the same change.
It concluded that nothing is deleted; the reasoning is in
`_docs/licensing/retention.md`.

Assume APP obligations apply in full. The small-business exemption falls away
where personal information is disclosed for a benefit or a service, which is a
fair description of this.
