# SEO prospect outreach

Planned and built 2026-10-28. The prospect report pipeline in `../ftp_search`
finds Perth businesses paying for searches they do not win
(`_search/prospecting/`), writes each a free ten-recommendation report, and
publishes it with the email that goes with it
(`_search/projects/<slug>/reports/<version>/email.txt`). This is the half that
sends that email from this server and tracks the calls that follow. The first
three (Rebus Legal, Hartley Plumbing, Solar 365, 28 October) went by hand from
the compose page, before this existed; `outbox.py` refuses them.

It copies the podcast outreach ([`affiliate-outreach.md`](affiliate-outreach.md))
wherever it can: the upload by shared secret, the claim before the send, the
business-hours window, the message log as the status, the dashboard page.

## Decisions (owner, 2026-10-28)

- **Upload, then the cron sends.** Publishing queues the email; the existing
  hourly `send_affiliate_outreach` run also sends queued prospect emails, in the
  same Perth weekday window (8am to 6pm) and with the same ten seconds between
  sends. No new scheduled task.
- **Five subjects, rotated by prospect**, so replies can be read against them:
  1. I spent {hours} hours on this. I am not a bot.
  2. {count} free fixes for {domain}
  3. Your '{paid search}' ad, and what your site is missing
  4. A free SEO report for {business}
  5. {business} isn't on Google's first page for '{paid search}'

  `{hours}` is the report's ask's figure and `{count}` its recommendation
  count, so a subject never disagrees with its report.
- **Unsubscribe by reply.** The email ends "Reply 'no thanks' and I won't email
  again." (the analyst's fixed wording; the server adds it if a body lacks
  it). A reply that asks is suppressed with the dashboard's Unsubscribe
  action. The Spam Act requires a functional unsubscribe facility; a reply
  address is one.
- **Plain text**, as pitches A and C: a note from one person, not a newsletter.

## The server

**Model** `seo/models/prospect.py`, `SeoProspect`. It is the calls list too.

| Field | Notes |
| --- | --- |
| `domain` | unique; the ledger's key |
| `business`, `slug`, `report_version` | |
| `report_path` | the report's full path on the owner's machine, shown to copy |
| `report_pdf` | `FileField` in private storage: messaging keeps an attachment's name, not its file, so the cron needs the PDF here |
| `contact_name`, `email`, `phone` | from the prospecting ledger |
| `overview` | one line: what the business is, built from the ledger (trading name, Google category, suburb) |
| `issues` | three short lines: the report's highest-impact recommendation titles |
| `paid_searches` | the searches its ad was seen on |
| `subject_version` | 1 to 5, assigned on upload by rotation |
| `body` | the analyst's email body, signature included |
| `queued_at`, `sent_at` | `sent_at` set by the cron's claim, as `pitched_at` is |
| `called_at`, `call_notes` | set by hand on the dashboard |
| `reply` | none, positive or negative, by hand |
| `excluded_reason` | blank means eligible; set by hand to hold one back |

The emailed status is read from the message log (`related=prospect`,
`message_type="seo_prospect.<version>"`), not stored: queued, sent, delivered,
bounced, suppressed, failed. Register the five message types with the messaging
registry. Add a Tier 3 row to [`pii_inventory.md`](pii_inventory.md): business
owners' names and published contact details, from their own public pages.

**Upload** `POST /api/seo/prospects/`, `IsInternalApiRequest`, multipart: the
fields above and the PDF. A domain, email or slug already present is refused
with 409, so no business is ever sent two reports; a suppressed address is
refused too.

**Send** `seo/utils/prospect_sending.py`, called at the end of
`send_affiliate_outreach` and sharing its window and its Mailgun Free plan
budget (100 a day across all mail). Claims with
`filter(pk=..., sent_at__isnull=True).update(sent_at=now)`, then
`send(..., attachments=[(name, pdf_bytes, "application/pdf")], related=prospect, plain=True)`.

**Dashboard** `/dashboard/admin/prospects`, "Prospects" beside Outreach: the
calls to-do list. Not yet called first, then by sent date. Each row: business,
overview, issues, email, phone, emailed status and date, report path, a "Mark
called" action with notes, reply, exclude, unsubscribe. A summary strip of
sent, replied and called per subject.

## The pipeline side (ftp_search)

- `email.txt` has one strict format, `Subject: …`, a blank line, the body
  (`_search/prompts/shared/analyst-prospect.md`), and the deep check reads it
  as before. The analyst's subject is kept for a hand-sent copy; the send uses
  the rotation.
- **Nothing is uploaded until the owner approves it** (owner, 2026-10-28).
  `_search/tools/prospecting/outbox.py` keeps the local outbox,
  `_search/prospecting/outbox.json`. The report delegator's last step for a
  prospect report (step 15 of `_search/prompts/01_delegator.md`) is
  `outbox.py add -p <slug>`: it reads `email.txt`, the PDF, `report.json` (the
  ask's hours plus the owner's one, the recommendation count, the three
  highest-impact titles) and the ledger's contact; warns when the address's
  domain is neither the site's nor a webmail one; refuses a business the
  message log shows was already sent a report; and lists it as
  `awaiting_approval`. The owner asks for the unapproved reports
  (`outbox.py list --status awaiting_approval`), reads each, asks for any edits,
  and says it may go: then `outbox.py approve <slug>` records a fingerprint of
  the PDF and the email, and `outbox.py release` posts every approved report
  whose files still match it (a report changed after approval goes back to
  awaiting approval) and marks the ledger entry `queued`. Approval and release
  happen only on the owner's word; no pipeline step does either. `outbox.py
  sync` and `ledger.py sync` move it to `sent` from the message log.
- **The call brief** (owner, 2026-10-29). `release` and `sync` print
  `_search/projects/<slug>/reports/<version>/call_brief.pdf`
  (`_search/tools/prospecting/brief.py`): one A4 page to read while phoning.
  Owner's name and phone, ABN and rating from the ledger, the email's address,
  sent time and subject from the outbox, the ad sighting and who sat in the map
  box instead, every recommendation in one line with its page in the report,
  then the call's opening, a line for each likely no, and the prices. The words
  come from `_search/prospecting/call_script.md`, which the owner edits. The
  call is not a sale: it checks the email arrived and points at one free fix.
  The call itself is still logged on the dashboard, not on the brief.
- The key and the address are this repository's own `INTERNAL_API_KEY` and
  `API_SERVER_URL` (`DEV_API_SERVER_URL` with `--dev`) from `.env`, read by
  `freetheplatform`'s `env.secret` and never printed: the same pair
  `upload_prospects` uses.

## As built

`seo/models/prospect.py` and `storage.py` (migration `seo` 0018),
`seo/utils/prospect_sending.py` (subjects, claim, send) and `prospects.py` (the
composed status), `seo/views/prospects.py`, `seo/serializers/prospect.py`, the
`--reports` count on `send_affiliate_outreach` (default 5 a run), and
`frontend/src/app/dashboard/admin/prospects/`. Tests in `seo/tests/view_tests/`
and `seo/tests/command_tests/`. The owner's deploy steps are in `to_do.md`.
