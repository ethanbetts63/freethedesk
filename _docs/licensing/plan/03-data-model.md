# Data model

The models behind `02-sale-flow.md`. Settled once, up front, because all three
portals read and write the same aggregate and rediscovering its shape while
building the customer flow is the failure `00-app-overview.md` warns about.

## Multi-tenancy

**Shared database, a `dealer` foreign key on every tenant-owned model, enforced
in code.** Volume does not justify schema-per-tenant and the operational cost of
migrations across schemas is real.

But this data is dealer-confidential and includes a customer's identity
documents, so a query that forgets its tenant filter hands one dealer another
dealer's customers. Three mitigations, all in `core`, all from the first
tenant-owned model rather than added once something leaks:

```python
class TenantOwned(models.Model):
    dealer = models.ForeignKey("dealers.Dealer", on_delete=models.CASCADE, related_name="+")

    objects = TenantManager()      # .for_dealer(dealer) required; bare .all() raises

    class Meta:
        abstract = True
```

1. **`TenantOwned`** carries the FK and a manager whose default queryset refuses
   to return rows without explicit scoping. A developer who forgets gets an
   exception, not a leak.
2. **Request-level dealer resolution** from the authenticated user through
   `request.user.dealer`, never from a client-supplied parameter. A dealer id in
   a query string or a body is ignored wherever one appears.
3. **A cross-tenant isolation test on every list and detail endpoint**, asserting
   dealer B cannot see dealer A's row. Standing pattern, not a one-off.

Point 3 is the one that actually holds the line. The first two are habits that
survive exactly as long as everybody remembers them; the tests are enforcement.

`Dealer` itself is not `TenantOwned` — it is the tenant root.

## `sales`

### `Sale`

The aggregate. Long, and deliberately so: splitting it into a `Customer` row, a
`Vehicle` row and a `Sale` row buys normalisation nobody needs — a customer
exists only within one sale and a vehicle is a snapshot by design — and costs
three joins on every screen in the product.

**Identity and access**

| Field                  | Notes                                                        |
| ---------------------- | ------------------------------------------------------------ |
| `dealer`               | From `TenantOwned`                                           |
| `reference`            | `S-` plus 10 hex characters, unique, generated on first save |
| `access_token`         | `secrets.token_urlsafe(32)`, unique, not editable            |
| `access_password_hash` | For recovery on another device                               |
| `created_by`           | The dealer user who keyed it. Nullable, for a later DMS push |
| `source`               | `portal` in v1. The seam the embedded path writes            |

`reference` is 10 hex characters rather than allbikes' eight. Its own comment
there records the reason to widen — collisions follow the birthday bound, about
1.2% across 10,000 orders — and a product serving many dealers starts on the far
side of that rather than waiting to print two customers the same reference.

**Plan scope**

| Field      | Notes                                                                       |
| ---------- | --------------------------------------------------------------------------- |
| `produces` | Snapshot of `dealer.plan` at creation: `licensing`, `contracts`, `complete` |

Snapshotted, not read live. A dealer who changes plan mid-sale should not have
the document set rewritten underneath a customer who is halfway through signing.

**Vehicle snapshot**

`vehicle_class` (`motorcycle`, `moped`; `car` later), `condition` (`new`,
`used`, `demo`), `make`, `model`, `year`, `body_type`, `colour`, `vin`,
`engine_number`, `engine_capacity_cc`, `is_electric`, `odometer_km`,
`registration`, `registration_expiry`, `registration_months_included`,
`stock_number`, `rrp`.

`vehicle_class` is carried from day one even though v1 is motorcycles only. The
warranty thresholds differ by class and adding the field later means a migration
plus a backfill plus a default that is wrong for whatever came first.

`registration_months_included` is the new-stock answer to "when does this
registration expire" — a factory-new vehicle has no expiry date to state, only a
term that starts when it is licensed.

**Money**

`vehicle_price`, `delivery_fee`, `deposit_amount`, `balance_amount`. A
`CheckConstraint` holds all four at or above zero, matching the constraint
allbikes already carries.

**Fulfilment**

`fulfilment_method` (`pickup`, `delivery`), `delivery_address_line1`,
`delivery_suburb`, `delivery_state`, `delivery_postcode`.

**Purchaser and licence holder**

The two are separable, because a bike bought by one person and licensed to
another is ordinary.

`customer_name`, `customer_email`, `customer_phone` — what addresses the link,
entered by the dealer.

`purchaser_is_licence_holder`, and when false: `purchaser_family_name`,
`purchaser_given_names`, `purchaser_address_line1`, `purchaser_suburb`,
`purchaser_postcode`.

`licence_family_name`, `licence_given_names`, `licence_number`,
`licence_date_of_birth`, `licensee_address_line1`, `licensee_suburb`,
`licensee_postcode`, `kept_primarily_in_wa`.

`licensed_to_company`, and when true: `company_name`, `company_acn`,
`company_organisation_code`.

**Warranty**

`warranty_acknowledgement_key` — the fingerprint hash of price, condition, year
and odometer at the moment of acknowledgement — and `warranty_acknowledged_at`.
Comparing the stored hash against a freshly computed one is what makes an
acknowledgement stop counting when its inputs move, without a flag anyone has to
remember to clear.

**State and clocks**

| Field                     | Notes                                                    |
| ------------------------- | -------------------------------------------------------- |
| `status`                  | The state machine in `02-sale-flow.md`                   |
| `link_sent_at`            |                                                          |
| `details_updated_at`      | What document staleness is measured against              |
| `signed_at`               | The customer's offer. Starts the lapse clock             |
| `accepted_at`             | Dealer countersigned                                     |
| `acceptance_notified_at`  | Notice given — cl 1.2's second limb, recorded separately |
| `customer_marked_paid_at` |                                                          |
| `payment_confirmed_at`    |                                                          |
| `completed_at`            |                                                          |
| `cancelled_at`            |                                                          |

`accepted_at` and `acceptance_notified_at` are two columns because cl 1.2 is two
acts. In practice the system does both in one request, and the day one of them
fails is the day having only one timestamp becomes unrecoverable.

`offer_lapses_at` is a **property**, not a column: `signed_at` plus one WA
business day at 17:00. Nothing writes it and nothing transitions on it.

### `SaleEvent`

`sale`, `kind`, `actor` (nullable — the customer has no user), `actor_label`,
`at`, `ip_address`, `user_agent`, `context` (JSON).

Every transition writes one. Append-only, never updated, no delete path in the
application. This is the audit trail that is the product.

`actor_label` exists because the customer is not a `User` and "the customer"
plus their name at that moment is the only honest answer.

## `identity`

### `Verification`

One per sale. Built to be replaced, so the sale gates on `is_verified` and
nothing in `sales` knows how that became true.

| Field                        | Notes                                                        |
| ---------------------------- | ------------------------------------------------------------ |
| `sale`                       | `OneToOneField`                                              |
| `provider`                   | `manual` in v1, `stripe` later                               |
| `status`                     | `pending`, `submitted`, `verified`, `rejected`               |
| `verified_at`, `verified_by` | The reviewing dealer user, null for a provider verdict       |
| `rejection_reason`           | Shown to the customer, so it has to be a sentence not a code |

Manual-only fields, dropped with the provider swap: `licence_image_front`,
`licence_image_back`, `selfie_image`, each with its own review status, because a
clear licence and an unusable selfie is the ordinary case and one verdict over
three files makes the customer re-upload all of them.

Stripe-only fields, added with the swap: `stripe_verification_session_id`,
`stripe_report_id`, `document_address` (for the licence-address comparison in
`research/online_licensing.md` control 3).

Images use the existing `dealers/utils/uploads.py` pipeline — sniffed by bytes,
fully parsed with bounded pixel and page counts, renamed to the verified type —
and a private storage class alongside `PrivateDealerDocumentStorage`. Nothing
about that is new work; it is the same pipeline pointed at a second tree.

## `documents`

### `FormTemplate`

`kind` (`vl17`, `mr9b`, `form_5a_motorcycle`, `form_6`), `version_label`,
`effective_from`, `file`, `is_current`, `notes`. Unique on `kind` plus
`version_label`.

The PDF is a record because the Department reissues these — all of them, July to
August 2025 — and the field map stays in code keyed by `(kind, version_label)`
because a renamed field needs a code change anyway. Splitting it that way puts
the file where it can be swapped by staff and the part that needs a developer
where a developer will see it.

A reissue that renames a field and is deployed without its map produces a blank
box, not an exception. So generation asserts the map exists for the pinned
version and refuses otherwise, which converts a silent wrong document into a
loud failure.

### `SaleDocument`

`sale`, `kind`, `file`, `template_version` (nullable — the contract has no
template), `uploaded_at`, and the signing evidence: `signer_name`, `signed_at`,
`signing_statement`, `document_sha256`, `signing_ip_address`,
`signing_user_agent`, plus `signed_by_role` (`customer`, `dealer`).

Unique on `sale` plus `kind`.

`is_stale` is derived, comparing `uploaded_at` against `sale.details_updated_at`,
never stored. A flag can fall out of step with the edit that set it; a comparison
cannot.

The signing evidence is duplicated deliberately. It also exists as a
`freetheplatform.agreements` acceptance, which is the immutable record; these
columns sit beside the document so that the thing a dealer opens in a dispute and
the evidence about it are not in two systems.

Unsigned documents are never rows. They are generated on demand and streamed,
because a filled form carries a licence number and a date of birth and writing
one to disk creates a file nobody asked for and nothing deletes.

## Additions to existing models

### `DealerProfile`

| Field                                                  | For                                                       |
| ------------------------------------------------------ | --------------------------------------------------------- |
| `bank_account_name`, `bank_bsb`, `bank_account_number` | The payment instructions page                             |
| `signature_image`                                      | Optional. Stamped into the dealer's block on acceptance   |
| `signature_name`                                       | Falls back to "Electronically signed by \<name\>"         |
| `trading_hours_note`                                   | Free text shown to a customer. Not parsed, not a schedule |

`condition_choices` already exists and is unused. It becomes the dealer's current
special-conditions state:

```json
{
  "defaults": { "SC1": true, "SC3": true, "SC5": false, "SC9": true },
  "additions": [{ "heading": "...", "paragraphs": ["..."] }]
}
```

Current state only. The dated history — what was removed, when, by whom — is the
sequence of `freetheplatform.agreements` acceptances against
`dealer.special_conditions`, which is immutable and already carries actor, time,
address and a `context` snapshot. Keeping history in a JSON column as well would
give two answers to one question.

`conditions_version`, `conditions_accepted_at`, `conditions_accepted_ip` and
`conditions_accepted_by` are **removed** in the same migration. They are a
hand-rolled version of what the agreements package publishes, they have never
been written to, and leaving them is an invitation to write to the wrong one.

### `Dealer`

No change. `plan`, `status` and `payment_status` already carry everything the
sale flow reads.

## Retention

The security standard requires each private-document category to state a
retention period, and `_docs/pii_inventory.md` records that FreeTheDesk currently
deletes nothing. Adding a customer's licence images without answering this is the
thing `02-sale-flow.md` refuses to do.

| Category                                                | Retain until                        | Then |
| ------------------------------------------------------- | ----------------------------------- | ---- |
| Identity images (licence front/back, selfie)            | To be confirmed — see below         | —    |
| Signed sale documents                                   | To be confirmed — see below         | —    |
| `Sale` personal fields (DOB, licence number, addresses) | To be confirmed                     | —    |
| `SaleEvent`                                             | Kept — the audit trail is the point | —    |

**Nothing is deleted.** The settled schedule is
[`retention.md`](../retention.md); this table is the plan's summary of it.

The first cut of this gave the identity images 30 days after the sale ended, on
the reasoning that they are a means to the verdict and are spent once the verdict
exists. That is true of a machine's verdict and false of a person's: the images
are the dealer's **evidence of due diligence**, and a dealer asked in three years
why they licensed a vehicle to a particular person has to be able to show what
they looked at rather than assert that they looked. So they are kept, and the
purge command that enforced the 30 days was removed.

**The remaining number is not ours to invent.** How long a dealer must keep the
sale record is set by the MV Dealers Act and its regulations — the Form 1
register duty under s25 is the obvious anchor — and the Act is not held in this
repository. Until it is looked up, everything is retained and the table says so,
rather than guessing at a period and enforcing it.

**The dealer's own copy is theirs.** Anything they download leaves our retention
entirely, and their obligations over it are their own. Say so in the dealer
subscription terms rather than implying the product manages it.

## Migrations

`sales`, `identity` and `documents` are new apps and start clean. The only
migration touching existing data is the `DealerProfile` change, which adds the
bank and signature fields and drops the four unused conditions columns.

Add all three to `pytest.ini`'s `testpaths`. It currently reads
`core dealers payments seo`, and an app missing from it has tests that never run
and a suite that stays green regardless.
