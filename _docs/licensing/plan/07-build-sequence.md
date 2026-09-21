# Build sequence

The order of work, and what proves each step. Phase 1 (`01-staff-app.md`) is
largely delivered; everything below is phases 2 and 3.

**Steps 1 to 6 are built.** Each heading below carries its state. Where the build
departed from what a step says, the step says so — the doc is a record of what
was done, not only of what was intended.

Each step lands as a coherent set of commits straight onto `main`. No branches —
see [agent-workflow.md](../../../../freetheplatform/_docs/agent-workflow.md#branching).

## Principle

**The aggregate is designed once, at step 1, and every later step reads and
writes it.** `00-app-overview.md` names the risk in building the customer flow
last: its legal constraints stay unvalidated longest. The mitigation is that
`02-sale-flow.md` and `03-data-model.md` already settled the shape, so no later
step gets to rediscover it.

Where a step could be ordered either way, the tie-break is: put the thing that
would force a migration earlier, and the thing a customer sees later.

## Step 1 — Tenancy and the aggregate

**Built.**

The foundation, and the only step with no user-visible output.

**Delivers.** `TenantOwned` and `TenantManager` in `core`. The `sales` app with
`Sale`, `SaleEvent`, reference generation, and the state machine as its own
transitions module rather than `if` statements in views.

**Touches.** `core/models/`, new `sales/`, `pytest.ini`, `config/settings.py`.

**Proves it.** A transition test per edge, including every refusal. A cross-tenant
isolation test asserting the manager raises on an unscoped queryset — the habit
is worthless without the test that enforces it. `makemigrations --check
--dry-run`.

**Unblocks.** Everything.

The state machine is worth its own module on day one. Two things force it: the
offer window has three separate recorded moments (signature, countersignature,
notice), and the payment gate has two transitions by two different actors. Both
become unreadable as scattered conditionals.

## Step 2 — The dealer creates a sale

**Built.**

**Delivers.** `/portal/sales`, `/portal/sales/new`, `/portal/sales/[reference]`
as a read-only detail page. The sale API, tenant-scoped. `DealerShell` gains the
Sales entry.

**Touches.** `sales/views/`, `sales/serializers/`, `frontend/src/lib/dealerApi.ts`,
`frontend/src/app/portal/sales/`, `DealerShell`.

**Proves it.** Request-level tests for auth, validation, response shape and side
effects. **A cross-tenant test on every list and detail endpoint** — this is the
step that establishes the pattern, so it is the step to get it right in. Frontend
typecheck, lint and the production build.

**Unblocks.** Everything with a sale in it. Nothing downstream can be exercised
until one can be created.

This is the cheapest place to find out whether the tenancy scoping is actually
applied everywhere, because there is one model and two endpoints.

**As built.** The sale page is editable rather than read-only — the API and its
tests were there, and leaving a dealer unable to correct a typo in a customer's
name would have been a gap, not a smaller step. `IsOperatingDealer` was added
beside `IsDealer`: a suspended or unpaid dealership can still reach the portal
to be told where it stands, and cannot produce paperwork in a customer's name.

## Step 3 — Special conditions at onboarding

**Built.**

Before contract generation, because the contract prints the dealer's approved
set and generating one against a default nobody approved is the wrong first
version of the document.

**Delivers.** The default clause set published as a `dealer.special_conditions`
agreement version. Per-clause approval in `/portal/setup`: read each, keep or
remove, add their own. SC2 and SC6 non-removable with the reason stated.
`condition_choices` written; an agreements acceptance recorded with the choices
in `context`. The four unused `conditions_*` columns dropped.

**Touches.** `dealers/models/dealer_profile.py` plus its migration,
`dealers/serializers/`, `payments/utils/agreements.py` for the new key,
`frontend/src/app/portal/setup/`.

**Proves it.** That the published version is the one selected, that the statement
recorded is the one shown, and that removing a clause writes both the column and
the acceptance. A test that SC2 and SC6 cannot be removed through the API, not
only through the interface.

**Note.** The default clause wording is a published agreement version, which
means changing it later is publishing a new version — not a migration and not a
redeploy. So this step is built and merged against the current draft, and the
lawyer's wording lands as a version bump whenever it arrives.

Also delivers the two smaller setup sections — bank details and the dealer's
signature — because they are the same screen and the same migration.

**As built.** Three endpoints rather than one: `dealers/onboarding/` keeps the
verification fields and their review lock, `dealers/trading/` takes the bank
details and the signature and is never locked, and
`dealers/special-conditions/` reads the clause set and records the acceptance.
The lock is what separated them — it protects evidence somebody is currently
reading, and a bank account a dealer needs to correct on a Tuesday is not that.

The clause set is published through `publish_version` from the catalogue in
`dealers/utils/special_conditions.py` rather than through `publish_configured`
from a markdown file. Two copies of a contract term is one copy that can be
edited without the other.

## Step 4 — Documents, unsigned

**Built.**

**Delivers.** The `documents` app. `FormTemplate` with the field map in code.
VL17 and MR9B prefill. The reg 7 warranty engine and notice selection. The
Schedule 5 contract typeset, with per-sale special-condition filtering. The
Authority to Lodge. Every one of them downloadable, unsigned, from the dealer's
sale page.

**Touches.** New `documents/`, `sales/views/` for the download endpoints,
`requirements.in` and both lockfiles for `pypdf` and `reportlab`, the sale page.

**Proves it.** Unit tests for the warranty engine at every threshold boundary
from both sides — it is a bright-line statutory test and the boundaries are the
whole of it. Tests that each special condition appears exactly when it should and
not otherwise, including that **SC5 does not print on used stock**. A test that
generation refuses when the pinned template version has no field map. Golden
tests on the prescribed contract text, so a reword is caught rather than reviewed.

Splitting this step is reasonable if it runs long: the prescribed forms and the
warranty engine are independent of the contract and the Authority to Lodge.

**As built.** Not split. The golden test reads every prescribed clause back out
of the regulations HTML in `wa_dealer_forms/` rather than comparing against a
stored hash — a hash proves the text has not changed since somebody last looked
at it, and reading it out of the legislation proves it was right when they did.
All 32 clauses match verbatim.

`FormTemplate`'s "one current version per kind" is enforced by
`make_current()` rather than by a partial unique constraint: MySQL does not
support a unique constraint with a condition, so Django would accept the
declaration, skip creating it, and leave a rule that reads as enforced and is
not.

## Step 5 — Customer access and Fill

**Built.**

The first step a member of the public touches, and the step that creates a
personal-data tier FreeTheDesk does not have today.

**Delivers.** The signed link, one-time redemption for the path-scoped httpOnly
cookie, reference-plus-password recovery with both throttles. The requirements
engine. `/sale/[reference]/[token]` and the Fill step. The sale-link email.

**Touches.** New `sales/views/customer.py` and its base view, `frontend/src/app/sale/`,
`frontend/proxy.ts` — to confirm the route is **excluded** — and the notification
templates.

**Proves it.** That the cookie is httpOnly, path-scoped and `Secure` under
production settings. That a valid link for sale A grants nothing on sale B. That
both login throttles fire independently. That the requirements engine is
re-derived server-side on every write and a stale client gets a 409 rather than a
corrupted sale. An edge test that `/sale/...` is not redirected to `/login`.

**Ships with it, not after:**

1. **Customer platform terms** — consent to transact electronically, consent to
   identity verification including dealer access, per open question 17.
2. **A privacy policy naming who holds what**, including that the dealer receives
   it.
3. **`_docs/pii_inventory.md` rewritten.** It currently describes a system with no
   customer data in it at all.
4. **The retention schedule decided**, including the two periods
   `03-data-model.md` refuses to invent — look up what the MV Dealers Act requires
   a dealer to keep and for how long.

Fill collects a date of birth, a driver's licence number and a residential
address. That is the tier, and it arrives here rather than at step 6.

**As built.** All four shipped: `frontend/content/legal/customer-platform-terms.md`
with its route, the privacy policy's sections 2, 5 and 9 rewritten around the
customer tier, `pii_inventory.md` rewritten with Tier 0 at the top, and
`_docs/licensing/retention.md`.

The retention lookup was done with the sources in the repository and came back
**unanswered**, which is recorded rather than papered over: the Sales Regulations
state one period — trust account records, six years — and the Form 1 register
duty sits in s25 of the Act, which is not held here. So the periods stay
unsettled and nothing is deleted, which is where FreeTheDesk already was.

The identity photographs are **kept**, not deleted on a timer. The first cut of
this gave them 30 days after the sale ended, on the reasoning that the images
are a means to the verdict and are spent once the verdict exists. That is true
of a machine's verdict and false of a person's: the photographs are the dealer's
evidence that they satisfied themselves about the purchaser, and evidence that
expires before the question does is a claim. The 30-day rule and the command
that enforced it were both removed.

The customer's routes take a `customer/` segment — `sales/<reference>/customer/…`
rather than `sales/<reference>/` — because the dealer's detail view already
answers on that path and one path cannot resolve to two views with different
authentication. They stay under `sales/<reference>/`, so the cookie's `path`
still covers exactly them.

`/sale` is kept out of `PROTECTED_PREFIXES` by a build check,
`frontend/scripts/check-customer-routes.mjs`, rather than by a convention. The
same check asserts it is in the analytics exclusion list.

## Step 6 — Identity

**Built.**

**Delivers.** The `identity` app behind one provider interface. Three uploads
through the existing pipeline into a private tree. Dealer review, per image, with
a reason that reaches the customer as a sentence. The
`awaiting_identity_review` state.

**Touches.** New `identity/`, the sale page's identity block, the customer's
Verify step, a new private storage class.

**Proves it.** That the gate is closed until all three are approved. That a
rejection clears the offending image and keeps the others. That an image is
reachable only through the authenticated view, by the owning dealer or the owning
customer, and by nobody else.

Built to be deleted. The interface is the swap boundary and the manual fields are
the part that goes.

**As built, and changed afterwards.** This step originally shipped
`manage.py purge_sale_identity`, deleting the three photographs 30 days after a
sale ended. **It has been removed**, and with it `Verification.purged_at`,
`identity.services.purge` and the README's scheduler note.

The images are evidence of due diligence, not a spent means to a verdict. A
dealer asked in three years why they licensed a vehicle to a particular person
has to be able to show what they looked at; a verdict with no photograph behind
it is their own assertion that they were satisfied. Deleting on a timer converts
evidence into a claim precisely when somebody starts asking.

What survives of that reasoning is the schedule itself,
`_docs/licensing/retention.md`, which now says everything is kept, why, and that
the APP 11.2 tension is real and unresolved. Writing down a retention decision
was the point; the 30 days was a guess inside it.

The service functions lock the verification row
(`SELECT … FOR UPDATE`) before writing, because a customer replacing one
photograph while the dealer reviews the one beside it is an ordinary Tuesday and
the loser of that race disappeared with no error anywhere.

## Step 7 — Warranty and signing

**Delivers.** The warranty notice presented and acknowledged, with the
fingerprint that invalidates it when its inputs move. Document signing: the
declaration, the built PDF, the hash, the evidence, the agreements acceptance.
The `signed` state, and the customer screen that says plainly it is an offer.

**Touches.** `sales/views/customer.py`, `documents/` for the signature overlay,
the customer Sign step.

**Proves it.** That the warranty gate sits **before** signing and cannot be
bypassed. That changing a price invalidates an existing acknowledgement. That
signing is one transaction — a failure part-way leaves no document and no
transition. That the stored hash matches the stored bytes. That a stale document
is reported as stale.

This is the step where the three legal constraints in `02-sale-flow.md` become
code, and the tests are the evidence that they did.

## Step 8 — Acceptance and the lapse clock

**Delivers.** Approve & sign as one dealer action: countersign, store, record,
notify, transition. `acceptance_notified_at` as its own stamp. The derived
`offer_lapses_at`, the countdown, the lapsed badge, the urgent sort, and the one
reminder email.

**Touches.** `sales/` transitions and views, the sale page, the queue, a WA
business-day helper, notification templates.

**Proves it.** That acceptance writes both timestamps and sends the notice. That
the lapse calculation is right across a Friday, a weekend and a WA public
holiday. **That nothing transitions when the clock passes** — the badge is the
whole mechanism, and a test that asserts the absence of a transition is what
stops someone helpfully adding one later.

## Step 9 — Payment and completion

**Delivers.** Payment instructions from the dealer's own bank details. The
customer's "I have paid this". The dealer's confirmation, which unlocks
licensing. Optional proof-of-payment upload that advances nothing. Mark complete.
The completion email with every signed document.

**Touches.** `sales/`, both portals, notification templates.

**Proves it.** That the two acts are separate transitions by separate actors.
That a proof-of-payment upload does not advance the sale. That licensing is not
reachable before the dealer confirms.

## Step 10 — Stripe Identity

The final step, and the one the interface at step 6 was shaped for.

**Delivers.** A `stripe` provider on the same `Verification` interface. Document
plus `require_matching_selfie`. The dealer views the licence through a FileLink
URL. The licence-address comparison with a staff hold on mismatch. The manual
fields, the review UI and the `awaiting_identity_review` state all removed.

**Touches.** `identity/`, the Stripe configuration, both portals, a migration
dropping the manual columns and the tree they wrote to.

**Proves it.** Provider-adapter tests against the exact payload, no real network.
That the gate behaves identically to the manual provider. That the manual tree is
actually emptied rather than orphaned.

Needs **Files Write** alongside the Identity read permissions. Costs roughly
$1.50 per verification, first 50 free.

Retires most of the retention problem step 6 had to think about: the images sit
at Stripe rather than in our private tree, and what survives here is the verdict.
Note that this changes the evidence position — the dealer's proof of due
diligence becomes a Stripe FileLink rather than a file we hold — and
`retention.md` will need rereading against that when the swap lands.

## Verification

Per the repository's `AGENTS.md`:

| Changed                   | Command                                           |
| ------------------------- | ------------------------------------------------- |
| Django/Python             | `py -m pytest <paths>`, broadening when warranted |
| Django models             | `py manage.py makemigrations --check --dry-run`   |
| Frontend static checks    | `Set-Location frontend; npm run check`            |
| Frontend production build | `Set-Location frontend; npm run build`            |

Every step touching a route also runs `manage.py check --deploy`, which carries
the route-coverage check: a new endpoint with no throttle scope fails the build.
The scopes each step adds are named in `04-dealer-portal.md` and
`05-customer-flow.md`.

## Nothing here is blocked

Worth stating plainly, because the outstanding questions can read like
dependencies and none of them is one. **Every step above can be built, tested and
merged today.** The only hard ordering is between the steps themselves — you
cannot sign a document that does not generate yet.

Nothing external is waiting on anyone. There is no third party to integrate with
before step 10, no Department approval to obtain, no permission to hold. The WA
research is done, the forms are in the repository, and the flow is specified.

What the open items actually are:

| Item                                  | What it really is                                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| WA lawyer review of the defaults      | A wording change to a published agreement version. Land it whenever it arrives                                         |
| Q4 — DVS and an e-signed printed form | Decides what the sales material may promise about the used path. Touches no code                                       |
| Q5 — the Dealer Online contract       | May set the identity standard rather than leaving it to judgment. Manual review satisfies anything it is likely to say |
| The statutory retention period        | Until it is known, nothing is deleted — which is where FreeTheDesk already is. Knowing it enables a deletion           |
| The product's name                    | Copy                                                                                                                   |

The wording review is the only one that is not ours to do, and even it is not a
dependency: the clause text is a version in `freetheplatform.agreements`, so
replacing it is publishing a new version, not a migration or a redeploy.

## Before a stranger's contract is generated

Not a build gate — a short list of things to be true before the first external
dealer puts this in front of a real customer. Every one of them is a text change
or a decision, and none of them is on the critical path of anything above.

- The default special conditions and the Authority to Lodge carry wording a WA
  lawyer has read. The model in `open-questions.md` Q2 — supply a template,
  never advise a specific dealer — rests on the template having been reviewed
  once, and that is your own call to time.
- The customer platform terms and the privacy policy exist, per step 5.
- The retention schedule has its statutory period filled in, per steps 5 and 6.
  Nothing has to be deleted for that to be true — the period is what the customer
  is told, and it is currently published as unsettled.
- The dealer sales material does not promise more of the used path than Q4 has
  answered for.

Two questions worth closing early anyway, because they are cheap and they inform
design rather than gate it: reading the Dealer Online contract and business rules
(Q5), and testing whether Dealer Online actually rejects a mismatched name, date
of birth and licence number — which decides whether the record-match layer can be
relied on, and therefore whether a commercial verification gateway is ever worth
paying for.

## Not in v1

Stated so they are not re-argued: the embedded and DMS entry path, cars, states
other than WA, Form 4 and the Form 1 register, condition reports, Stripe Connect
and the delivery fee paid online, `DealerMembership`, a merged document pack,
dealer-branded customer screens, and automatic countersignature.
