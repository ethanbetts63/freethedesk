# PII Inventory & Handling

_First pass 2026-09-19; rewritten the same day when the sale flow landed._ A map
of the personal information freethedesk holds, where it lives and how it is
handled. Companion to the shared
[security standard](../../freetheplatform/_docs/security-standard.md), which
covers auth, transport and headers but not data lifecycle.

This is a record of one system's data, not policy. It stays here rather than in
freetheplatform for that reason, and allbikes keeps its own.

Scope: the marketing site, the two customer portals and the Django API. Not
covered: Stripe's dashboard, Mailgun's own logs, or anything staff key into a
third-party tool directly.

---

## TL;DR

**This document described a system with no customer data in it. It no longer
does.** The online licensing product added a tier that did not exist: a member of
the public's name, date of birth, driver's licence number, residential address,
photographs of their licence and their face, and a disclosure — the dealer sees
all of it. That is now Tier 0 below, ahead of everything else, because it is the
most sensitive category either this system or allbikes holds.

Four things to know:

1. **Tier 0 is the new sensitive tier, and it is the only one with a written
   retention schedule** — [`licensing/retention.md`](licensing/retention.md).
   That schedule deletes nothing. The identity photographs are kept as the
   dealer's evidence of due diligence, and the periods for the sale record are
   set by the Motor Vehicle Dealers Act 1973 (WA) and are not yet verified. A
   schedule that says "kept, and here is why" is a decision; the absence of one
   is what G1 is about.
2. **Nothing anywhere has retention or deletion.** No purge job, no expiry, no
   `deleted_at`, in the sale flow or outside it. G1 below is unchanged in
   substance and narrowed only in that one tier now says so deliberately.
3. **The dealer is a third-party recipient, by design.** A customer's identity
   documents are disclosed to the dealership handling their sale. That is the
   purpose of collecting them, it is stated in the customer terms and the privacy
   policy, and it engages APP 6 rather than being incidental.
4. **`Message` keeps a rendered copy of every email sent.** Names, business
   details and portal links are stored in `body_text` / `body_html`
   indefinitely. The sale-link email additionally carries a **temporary access
   password in the clear**, which is new and is recorded as G8.

---

## Part 1 — What we collect

### Tier 0: Customer identity and sale data (highest sensitivity)

Created by the online licensing product. The subject is a member of the public
with no account, reached through a capability in a link.

All on `Sale` (`sales/models/sale.py`) unless noted.

| Data                                | Field(s)                                                                                                       | Notes                                                              |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Customer name and contact           | `customer_name`, `customer_email`, `customer_phone`                                                            | entered by the dealer; the address the sale link goes to           |
| **Date of birth**                   | `licence_date_of_birth`                                                                                        | plaintext column                                                   |
| **Driver's licence number**         | `licence_number`                                                                                               | plaintext column; a government-related identifier                  |
| Licence holder name and address     | `licence_family_name`, `licence_given_names`, `licensee_address_line1`, `licensee_suburb`, `licensee_postcode` | a residential address                                              |
| Purchaser, where a different person | `purchaser_*`                                                                                                  | a second identified individual on the same row                     |
| Delivery address                    | `delivery_*`                                                                                                   | a residential address, and where the Department sends the papers   |
| Company details                     | `company_name`, `company_acn`, `company_organisation_code`                                                     | identifies a sole director                                         |
| **Access password hash**            | `access_password_hash`                                                                                         | a credential; the plain text is emailed once and never stored      |
| **Access token**                    | `access_token`                                                                                                 | a bearer capability for the whole record                           |
| **Identity images**                 | `identity.Verification` — licence front, licence back, selfie                                                  | private storage, outside `MEDIA_ROOT`; the most sensitive category |
| Signature evidence                  | `documents.SaleDocument` — `signer_name`, `signing_ip_address`, `signing_user_agent`, `signing_statement`      | **the IP address is PII**; retained deliberately as evidence       |
| Sale history                        | `sales.SaleEvent` — `actor_label`, `ip_address`, `user_agent`, `context`                                       | append-only; the audit trail is the product                        |

**Disclosed to the dealer in full.** Every field above is visible to the
dealership on the sale, including the identity images, which they review by
hand. That is the purpose of collecting it and it is an APP 6 disclosure, stated
in the customer terms and the privacy policy.

**Retention:** [`licensing/retention.md`](licensing/retention.md). Nothing here
is deleted. The identity photographs are kept because they are the dealer's
evidence that they satisfied themselves who they were licensing a vehicle to,
and that evidence has to outlast the questions about the sale. The period for
the sale record is set by the Motor Vehicle Dealers Act 1973 (WA) and has not
been verified; until it is, nothing is deleted. The APP 11.2 tension this
creates is stated in that file rather than left to be discovered here.

### Tier 1: Dealer identity and licensing data

All on `DealerProfile` (`dealers/models/dealer_profile.py`), gathered during
post-payment onboarding.

| Data                                     | Field(s)                                                                                | Notes                                                     |
| ---------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Authorised officer name                  | `authorised_officer_name`                                                               |                                                           |
| **Authorised officer date of birth**     | `authorised_officer_date_of_birth`                                                      | plaintext column                                          |
| Licence numbers                          | `dealer_licence_number`, `repairer_licence_number`, `authorised_officer_licence_number` | plaintext columns                                         |
| Business identifiers                     | `legal_name`, `abn`, `acn`, `organisation_code`                                         | company data, but identifies a sole trader                |
| Business address                         | `address_line1`, `suburb`, `postcode`, `state`                                          | a home address, where the dealer trades from one          |
| **Dealer licence document**              | `dealer_licence_document`                                                               | `FileField`, private storage                              |
| **Authorised officer identity document** | `authorised_officer_identity_document`                                                  | `FileField`, private storage — a licence or passport scan |
| **Business evidence document**           | `business_evidence_document`                                                            | `FileField`, private storage                              |
| Bank details                             | `bank_account_name`, `bank_bsb`, `bank_account_number`                                  | shown to a customer on their payment instructions         |
| Signature image                          | `signature_image`, `signature_name`                                                     | `FileField`, private storage                              |
| Declaration evidence                     | `declared_at`, plus the `freetheplatform.agreements` acceptances                        | **the acceptance's IP address is PII**                    |
| Staff review trail                       | `reviewed_at`, `reviewed_by`, `verification_notes`                                      | free text written by staff about a named person           |

### Tier 2: Account and contact data

| Model           | File                       | PII fields                                                                                              |
| --------------- | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `Dealer`        | `dealers/models/dealer.py` | `business_name`, `contact_name`, `phone`, `state`, `staff_notes`; email lives on the linked `auth.User` |
| `SeoSubscriber` | `seo/models/subscriber.py` | `business_name`, `contact_name`, `email`, `phone`, `website`, `staff_notes`; email also on `auth.User`  |
| `SeoProfile`    | `seo/models/profile.py`    | `website_url`, `search_console_property`, `primary_location`, `target_keywords`, `competitors`, `notes` |
| `SeoSetupStep`  | `seo/models/setup_step.py` | `detail` (the Search Console or Analytics property a check matched): business data, not personal        |

Both customer models are 1:1 with an `auth.User` whose `username` **is** the
email address, so an account row is itself a contact record. An SEO signup has
no `auth.User` until it is paid: the unpaid row holds the email itself, and is
kept as a lead to follow up on an abandoned checkout.

`SeoSubscriber.password_claim_hash` is a credential, not PII: the SHA-256 of
the single-use token that lets the signup browser choose the first password
after paying. The token itself lives only in that browser's httpOnly
`seo-claim-<reference>` cookie (path `/seo/payment`, seven days), and the hash
is emptied once used.

### Tier 3: Enquiry and marketing data

| Model     | File                     | PII fields                                                                              | Consent / opt-out |
| --------- | ------------------------ | --------------------------------------------------------------------------------------- | ----------------- |
| `Enquiry` | `core/models/enquiry.py` | `name`, `business`, `email`, `phone`, `website`, `message` (free text), `configuration` | none              |

`message` is free text on a public form, so it can contain anything the sender
chose to put in it. Bounded at 2,000 characters, not filtered.

### Tier 4: Derived and technical

| Data                    | Where                                                        | Notes                                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recipient email / phone | `freetheplatform.messaging.Message.to`, plus rendered bodies | see Part 2                                                                                                                                                                                                                                              |
| Acceptance IP           | `DealerProfile.conditions_accepted_ip`                       | legitimate as signing evidence; still PII, still unbounded                                                                                                                                                                                              |
| Authentication failures | `freetheplatform.auth.AccountSecurity`                       | one row per account: consecutive failure count, first and last failure time, locked-until, and when an alert was last sent. No address and no password. Nothing is written for an identifier matching no account, so the table is bounded by real users |
| Staff session history   | `token_blacklist.OutstandingToken` / `BlacklistedToken`      | one row per refresh token issued and per token revoked: user FK, issue and expiry times — a login and logout history by implication. No IP, no user agent. Bounded: pruned once expired, opportunistically on login (`core/utils/token_cleanup.py`)     |
| Payment events          | `payments/models/stripe_event.py`                            | Stripe event and object ids only. No name, address or card data                                                                                                                                                                                         |
| Session recordings      | Microsoft Clarity (`frontend/src/app/layout.tsx`)            | mouse, scroll and click events, and potentially form input; external. Injected only when `CLARITY_PROJECT_ID` is set                                                                                                                                    |
| Request analytics       | Vercel Analytics (`frontend/src/app/layout.tsx`)             | privacy-lean, still IP-derived                                                                                                                                                                                                                          |
| Server logs             | `LOGGING` → stream → host log files                          | `freetheplatform.auth` logs the submitted identifier and the client IP on a failed login, deliberately: a pattern of failures is the earliest signal of an attack anyone gets. Never the password                                                       |

### Tier 5: Staff

Django's default `auth.User` — username, email, first and last name, hashed
password — plus the `AccountSecurity` row above. Low volume, standard handling.

Customer accounts share the same table: when a sale link is first sent, the
customer gets an `auth.User` keyed by their email (`Sale.account`), holding
`username`/`email` = customer email, `first_name` = customer name, and a hashed
password. See the Accounts note in `_docs/licensing/plan/05-customer-flow.md`.

**The staff users page** (`/dashboard/admin/users`, API `/api/admin/users/` from
`freetheplatform.auth.staff`, activity from `core/account_directory.py`) stores
nothing new, but it is a new access pattern: one screen gathering an account's
dealer or SEO record, its sales across every dealer, its enquiries and every
message sent to its address, as linked summaries rather than copies. Staff can
edit the account and set its password; the password is never shown or echoed,
and the owner is emailed (`auth.password_set`) without it. `IsAdminUser` only.

---

## Part 2 — How it is handled today

### Done well

- **Dealer documents are outside the web root.** `dealers/utils/storage.py`
  writes under `PRIVATE_MEDIA_ROOT`, a tree no `static()` call and no webserver
  is pointed at. They leave only through an authenticated view.
- **Uploads are verified, not trusted.** The type is sniffed from the file's
  bytes, the image or PDF is fully parsed with bounded pixel and page counts,
  and the stored extension comes from the verified type rather than from the
  uploaded name.
- **A dealer's own client is told nothing but a flag.** The onboarding API
  returns uploaded or not-uploaded, never a URL.
- **Payment data minimisation.** Card details never reach Django. `Dealer` and
  `SeoSubscriber` hold Stripe identifiers; `StripeEvent` holds event ids.
- **Lockout records nothing about non-accounts.** An identifier matching no user
  produces no row, so the failure table cannot be grown by guessing at one.
- **Blacklist rows are pruned.** Expired tokens are removed opportunistically on
  login, so the session history does not accumulate indefinitely.
- **Passwords are never written into a message.** The reset flow sends a
  single-use token that signs the account's current password hash; there is no
  operator-set password to store in the clear.

### Gaps

**G1 — No retention or deletion anywhere.** There is no purge command, no
anonymisation and no expiry in this codebase. An identity document uploaded by a
dealer who cancelled in 2026 is still on disk in 2032, and so is a customer's
licence photograph. Australian Privacy Principle 11.2 requires destroying or
de-identifying personal information once it is no longer needed for any
permitted purpose.

Tier 0 is the one place where that is a stated decision rather than an omission:
[`licensing/retention.md`](licensing/retention.md) says what is kept, why the
identity photographs are evidence rather than a spent means, and that the
statutory period has not been verified. It also states the APP 11.2 tension
rather than resolving it. Everywhere else the silence is just silence.

**G2 — `Message` is a second copy of most contact data.** Every email is stored
fully rendered, indefinitely. Names, business details and portal links live in
`body_text` and `body_html` with nothing that removes them.

**G3 — Microsoft Clarity has no consent gate.** It is injected on every route
whenever `CLARITY_PROJECT_ID` is set, with no cookie-consent check. Clarity
records session replays; without explicit masking it can capture what people
type into the signup, onboarding and login forms. Masking is configured in the
Clarity dashboard rather than in code, so it has to be verified there.

**G4 — No processor register.** Part 3 is a list, not a record of which
data-processing agreement is in place with whom, or where each processor hosts.
Mailgun, Stripe, Twilio, Vercel and Clarity are all US-based, which engages
APP 8.

**G5 — No data-subject-request path.** There is no tool and no runbook for
"what do you hold on me" or "delete me". The data spans five models in four apps
plus one file tree — small enough that this is a short job, large enough that
nobody will get it right from memory.

**G6 — No audit trail on identity-document access.** Nothing records which staff
account opened a dealer's identity document, or when. For the most sensitive
thing here, viewing is invisible. Recorded in the shared plan's deferred list as
a data-modelling project rather than a security one.

**G7 — The privacy policy has been checked against Tier 0 only.** Its sections 2,
5 and 9 were rewritten on 19 September 2026 to name the customer categories, the
disclosure to the dealer and the retention schedule. Tiers 1 to 5 and Part 3 are
still unverified against it.

**G8 — The sale-link email carries a temporary password in the clear.** It has to
— it is recovery for a customer with no account, and asking them to fetch it
separately means a support call for something the link already grants — but
`Message.body_text` therefore holds a live credential for the sale until it is
next resent. Bounded by the sale's own lifetime rather than by anything that
clears it. Two ways out, neither taken yet: blank the stored body once the
message is delivered, or hold the credential out of the stored copy.

**G9 — No audit trail on customer identity-image views.** The same gap as G6, one
tier up. Nothing records which dealer user opened a customer's licence
photograph, or when. Viewing the most sensitive thing in the system is invisible
on both sides of it.

**G10 — The SEO welcome email carries a temporary password in the clear.** The
same shape as G8, accepted deliberately on 2 October 2026: the account holds
nothing personal beyond the signup email until the owner signs in, and the
first sign-in forces a new password (`must_change_password`). Since 5 October
2026 most customers replace it on the payment confirmation page before it is
ever used, which ends the emailed one there and then. `Message.body_text`
still keeps the temporary one indefinitely, so the same two ways out apply.

---

## Part 3 — Third-party processors (data leaving the system)

| Processor              | Via                                                  | Personal data sent                                                                                                     | Hosting   |
| ---------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------- |
| **Stripe**             | `payments/`                                          | Checkout session; customer email and business name attached at checkout                                                | US / AU   |
| **Mailgun**            | `freetheplatform.messaging`                          | Every transactional email body — names, business details, portal links, and a sale's access password                   | US        |
| **Twilio**             | `freetheplatform.messaging`                          | SMS to staff numbers; bodies carry a customer's business name                                                          | US        |
| **Vercel**             | hosting + `@vercel/analytics`                        | Request metadata, IP-derived analytics                                                                                 | US (edge) |
| **Microsoft Clarity**  | `frontend/src/app/layout.tsx`                        | Session recordings: interaction events, page content, possibly input                                                   | US        |
| **Anthropic (Claude)** | `/api/read/` (`freetheplatform.readapi`), token-only | Any record a view permission reaches, every dealer's, read by the reporting agents; never credentials or file contents | US        |

---

## Part 4 — Recommendations

Ordered by priority. Allbikes' own inventory proposes the same retention work in
more detail; if a purge command is ever written, the two are worth writing
together rather than twice.

### P0

1. **Write a retention schedule, and enforce it once the periods are known.**
   Tier 0 has the schedule — [`licensing/retention.md`](licensing/retention.md) —
   and no command, because its periods are the statutory ones and they have not
   been verified. Starting points for the others, to settle with the business:

   | Data                                                | Retain until                             | Then                                          |
   | --------------------------------------------------- | ---------------------------------------- | --------------------------------------------- |
   | Dealer identity and licence documents               | subscription ends + the statutory period | delete the files, null the fields             |
   | `authorised_officer_date_of_birth`, licence numbers | subscription ends + the statutory period | delete                                        |
   | `Message.body_text` / `body_html`                   | 90 days after `sent_at`                  | blank the bodies, keep `to`/type/status/times |
   | `Enquiry`                                           | 12 months after `status` is terminal     | delete the row                                |
   | Cancelled `Dealer` / `SeoSubscriber` records        | subscription ends + the statutory period | delete or de-identify                         |
   | Unpaid `SeoSubscriber` signups (abandoned checkout) | 12 months after `created_at`             | delete the row                                |

   One command, with `--dry-run`, wired to a daily schedule.

2. **Gate or remove Microsoft Clarity.** Either drop it, or add a consent banner
   and inject only after opt-in, and confirm masking is set to mask-all with the
   portal and signup routes excluded.

3. **Check the privacy policy against Part 1 and Part 3.** It has to name
   identity documents and date of birth, every processor with its country,
   retention periods, and a working access, correction and erasure path.

### P1

4. **Build a data-subject-request tool.** `manage.py export_customer_data
--email <addr>` and an erasure counterpart, walking every model in Part 1 plus
   the private tree. The export alone makes the common request a two-minute job.

5. **Create a processor register.** Extend Part 3 with purpose, hosting
   location, DPA status and a link to each sub-processor list.

6. **Redact contact details from application logs**, keeping the identifier the
   auth package deliberately records on a failed login and nothing else.

### P2

7. **Audit-log identity-document views.** `(user, profile, file, timestamp)` on
   each staff read.

8. **Consider storing `Message` as text only**, or regenerating the HTML from the
   template when a human actually needs to see it. It is the largest blob of
   personal data in the database, and in every backup.
