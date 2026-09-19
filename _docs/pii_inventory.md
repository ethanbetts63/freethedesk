# PII Inventory & Handling

_First pass, 2026-09-19._ A map of the personal information freethedesk holds,
where it lives and how it is handled. Companion to the shared
[security standard](../../freetheplatform/_docs/security-standard.md), which
covers auth, transport and headers but not data lifecycle.

This is a record of one system's data, not policy. It stays here rather than in
freetheplatform for that reason, and allbikes keeps its own.

Scope: the marketing site, the two customer portals and the Django API. Not
covered: Stripe's dashboard, Mailgun's own logs, or anything staff key into a
third-party tool directly.

---

## TL;DR

Freethedesk holds far less than allbikes does, and the sensitive part is narrow:
three categories of dealer document, one of which is an identity document, plus
a date of birth. Access control over those is sound — they sit outside the
web-served tree and leave only through an authenticated view, and the dealer's
own client is told nothing but uploaded/not-uploaded.

Two things to know:

1. **There is no retention or deletion anywhere.** No purge job, no expiry, no
   `deleted_at`. Every table and the document tree grow forever. This is the
   same gap allbikes records as G1, and it is not closed here either.
2. **`Message` keeps a rendered copy of every email sent.** Names, business
   details and portal links are stored in `body_text` / `body_html`
   indefinitely. No credential is written into one here — a password reset
   carries a single-use token, not a password — which is the one way this is
   better than allbikes' equivalent.

---

## Part 1 — What we collect

### Tier 1: Dealer identity and licensing data (highest sensitivity)

All on `DealerProfile` (`dealers/models/dealer_profile.py`), gathered during
post-payment onboarding.

| Data                                     | Field(s)                                                                                    | Notes                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Authorised officer name                  | `authorised_officer_name`                                                                   |                                                           |
| **Authorised officer date of birth**     | `authorised_officer_date_of_birth`                                                          | plaintext column                                          |
| Licence numbers                          | `dealer_licence_number`, `repairer_licence_number`, `authorised_officer_licence_number`     | plaintext columns                                         |
| Business identifiers                     | `legal_name`, `abn`, `acn`, `organisation_code`                                             | company data, but identifies a sole trader                |
| Business address                         | `address_line1`, `suburb`, `postcode`, `state`                                              | a home address, where the dealer trades from one          |
| **Dealer licence document**              | `dealer_licence_document`                                                                   | `FileField`, private storage                              |
| **Authorised officer identity document** | `authorised_officer_identity_document`                                                      | `FileField`, private storage — a licence or passport scan |
| **Business evidence document**           | `business_evidence_document`                                                                | `FileField`, private storage                              |
| Declaration evidence                     | `declared_at`, `conditions_accepted_at`, `conditions_accepted_ip`, `conditions_accepted_by` | **the IP address is PII**                                 |
| Staff review trail                       | `reviewed_at`, `reviewed_by`, `verification_notes`                                          | free text written by staff about a named person           |

### Tier 2: Account and contact data

| Model           | File                       | PII fields                                                                                              |
| --------------- | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `Dealer`        | `dealers/models/dealer.py` | `business_name`, `contact_name`, `phone`, `state`, `staff_notes`; email lives on the linked `auth.User` |
| `SeoSubscriber` | `seo/models/subscriber.py` | `business_name`, `contact_name`, `phone`, `website`, `staff_notes`; email likewise on `auth.User`       |
| `SeoProfile`    | `seo/models/profile.py`    | `website_url`, `search_console_property`, `primary_location`, `target_keywords`, `competitors`, `notes` |

Both customer models are 1:1 with an `auth.User` whose `username` **is** the
email address, so an account row is itself a contact record.

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

**G1 — No retention or deletion, anywhere.** No purge command, no anonymisation,
no expiry. An identity document uploaded by a dealer who cancelled in 2026 is
still on disk in 2032. Australian Privacy Principle 11.2 requires destroying or
de-identifying personal information once it is no longer needed for any
permitted purpose, and there is no mechanism here to do that.

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

**G7 — The privacy policy has not been checked against this document.** Until it
has been, treat it as unverified rather than as a description of the above.

---

## Part 3 — Third-party processors (data leaving the system)

| Processor             | Via                           | Personal data sent                                                      | Hosting   |
| --------------------- | ----------------------------- | ----------------------------------------------------------------------- | --------- |
| **Stripe**            | `payments/`                   | Checkout session; customer email and business name attached at checkout | US / AU   |
| **Mailgun**           | `freetheplatform.messaging`   | Every transactional email body — names, business details, portal links  | US        |
| **Twilio**            | `freetheplatform.messaging`   | SMS to staff numbers; bodies carry a customer's business name           | US        |
| **Vercel**            | hosting + `@vercel/analytics` | Request metadata, IP-derived analytics                                  | US (edge) |
| **Microsoft Clarity** | `frontend/src/app/layout.tsx` | Session recordings: interaction events, page content, possibly input    | US        |

---

## Part 4 — Recommendations

Ordered by priority. Allbikes' own inventory proposes the same retention work in
more detail; if one purge command is ever written, the two are worth writing
together rather than twice.

### P0

1. **Write a retention schedule and enforce it with a daily command.** Starting
   points, to settle with the business:

   | Data                                                | Retain until                             | Then                                          |
   | --------------------------------------------------- | ---------------------------------------- | --------------------------------------------- |
   | Dealer identity and licence documents               | subscription ends + the statutory period | delete the files, null the fields             |
   | `authorised_officer_date_of_birth`, licence numbers | subscription ends + the statutory period | delete                                        |
   | `Message.body_text` / `body_html`                   | 90 days after `sent_at`                  | blank the bodies, keep `to`/type/status/times |
   | `Enquiry`                                           | 12 months after `status` is terminal     | delete the row                                |
   | Cancelled `Dealer` / `SeoSubscriber` records        | subscription ends + the statutory period | delete or de-identify                         |

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
