# SEO prospect outreach

Planned and built 2026-10-28. The prospect report pipeline in `../ftp_search`
finds businesses to write a free ten-recommendation report for, mostly Perth
businesses paying for searches they do not win (`_search/prospecting/`), and
since 2026-10-30 podcast hosts for the affiliate program too. The report is
written the same way whoever it is for. This is the half that writes the
email, sends it from this server with the report attached, and tracks the
calls that follow. The first three (Rebus Legal, Hartley Plumbing, Solar 365,
28 October) went by hand from the compose page, before this existed;
`outbox.py` refuses them.

It copies the podcast outreach ([`affiliate-outreach.md`](affiliate-outreach.md))
wherever it can: the upload by shared secret, the claim before the send, the
business-hours window, the message log as the status, the dashboard page.

## Decisions (owner, 2026-10-28)

- **Upload, then the cron sends.** Publishing queues the email; the existing
  hourly `send_affiliate_outreach` run also sends queued prospect emails, in the
  same Perth weekday window (8am to 6pm) and with the same ten seconds between
  sends. No new scheduled task.
- **Five subjects, rotated by prospect**, so replies can be read against them:
  1. I spent 3 hours on this. I am not a bot.
  2. {count} free fixes for {domain}
  3. Your '{paid search}' ad, and what your site is missing
  4. A free SEO report for {business}
  5. {business} isn't on Google's first page for '{paid search}'

  `{count}` is the report's recommendation count, so the subject never
  disagrees with its report. Three hours is every report's figure, in the
  report's ask, the email and the subject alike (owner, 2026-10-30):
  believable, under the machine time on every report, and nothing counts it.
- **The server composes every body** (owner, 2026-10-30). The pipeline writes
  the report and nothing about why; the email is where the purpose shows, so
  it is written here from the row's own fields: the business, the paid
  searches when a sweep saw its ad, the two highest-impact titles in `issues`,
  the count, and for a host the affiliate figures from the site settings.
  Until 2026-10-30 the analyst wrote the email (`email.txt`) and body 1 sent it
  as written; rows from then still hold it in `body` and show it.
- **Two purposes.** `purpose` is `client`, a business we hope will buy the
  full report, or `affiliate`, a podcast host we hope will join the program
  ([`affiliate-program.md`](affiliate-program.md)). The outbox sets it from the
  ledger entry's `source`.
- **Four bodies.** A client gets body 1, 2 or 4, levelled like the subjects
  (owner, 2026-10-30): each new client report gets the one with the fewest
  sends so far, so six a night split 2, 2 and 2, never 6 and 0 as a coin toss
  can. Body 1 is the report email, in the words the analyst's email used:
  why this business (its ad on a search it does not win, or its site alone),
  the count, the two findings that stand out, and the ask to consider the
  paid report. Body 2 is the owner's fixed words, "the three-hour bet": make
  the changes and if your bookings don't move in a month, mark this as spam.
  Only the greeting and `metric`, the word for what the business counts
  (bookings, calls, quotes, sales; `outbox.py add --metric`), change. Body 4
  is body 2 with the report's five highest-impact titles, each cut to about
  50 characters at a word, numbered under the strategy line, and "(N more)"
  for the rest, so the reader sees what is inside before opening it; its
  "Forward" line names the attached pdf. Body 3
  is the affiliate offer, every host: the same report, then the program at
  the live discount, share and commissions (`affiliates.utils.pitching.pitch_figures`),
  and the full report free on sign-up. The source copies are in
  `call_script.md` in ftp_search, "The report email"; the server holds the
  same text in `prospect_sending`, and the two are changed together. Body 2's
  way out is the spam button, which it names twice; a 'no thanks' reply is
  still suppressed by hand. The dashboard's summary strip shows the bodies
  under the five subjects, and each row says which pair it got.
- **Unsubscribe by reply.** The email ends "Reply 'no thanks' and I won't email
  again." (the server adds it to an old stored body that lacks it). A reply that asks is suppressed with the dashboard's Unsubscribe
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
| `issues` | the report's five highest-impact recommendation titles, strongest first; body 1 names the first two, body 4 lists all five |
| `paid_searches` | the searches its ad was seen on; empty for a host, or a business found some other way |
| `purpose` | `client` or `affiliate`, from the upload; `client` unless it says |
| `subject_version` | 1 to 5, assigned on upload by rotation (3 and 5 only with a paid search) |
| `body_version` | a client: 1, 2 or 4, whichever has fewest; an affiliate: 3 |
| `metric` | what the business counts, for body 2; `bookings` unless the upload says |
| `body` | empty since 2026-10-30; the analyst's email on the rows before it, which body 1 sent as written |
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

**Send by hand** `POST /api/seo/messages/`, `IsInternalApiRequest`, multipart
`to`, `subject`, `body` and any `attachments` (added 2026-10-29, after the
first follow-up went through the compose page). One email, sent now, as
written, plain text, from the outreach sender; related to the prospect row with
the same address, under its own message type `seo_followup` so the calls list's
emailed status is untouched. It sends to a business the server already knows,
which is the point: the one-per-business rule belongs to the first contact.
Suppression still applies. Called by `outbox.py send` (below); never by the
pipeline on its own.

**Dashboard** `/dashboard/admin/prospects`, "Prospects" beside Outreach: the
calls to-do list. Not yet called first, then by sent date. Each row: business,
overview, issues, email, phone, emailed status and date, report path, a "Mark
called" action with notes, reply, exclude, unsubscribe. A summary strip of
sent, replied and called per subject, and per body.

## The pipeline side (ftp_search)

- **The pipeline writes no email** (owner, 2026-10-30). A prospect project
  is set up and written like any other, from the site alone; the pipeline is
  told nothing about ads or podcasts. What the sweep saw stays in the ledger
  and reaches the server through the outbox, for the subject lines and the
  call brief.
- **Nothing is uploaded until the owner approves it** (owner, 2026-10-28).
  `_search/tools/prospecting/outbox.py` keeps the local outbox,
  `_search/prospecting/outbox.json`. The report delegator's last step for a
  prospect report (step 15 of `_search/prompts/01_delegator.md`) is
  `outbox.py add -p <slug>`: it reads the PDF, `report.json` (the
  recommendation count, the three highest-impact titles) and the ledger entry
  (the contact, the sightings, the `source` that sets the purpose); warns when
  the address's domain is neither the site's nor a webmail one; refuses a
  business the message log shows was already sent a report; and lists it as
  `awaiting_approval`. The owner asks for the unapproved reports
  (`outbox.py list --status awaiting_approval`), reads each, asks for any edits,
  and says it may go: then `outbox.py approve <slug>` records a fingerprint of
  the PDF, and `outbox.py release` posts every approved report
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
  then the call's opening and a line for each likely no. The words come from
  `_search/prospecting/call_script.md`, which the owner edits. The call is not
  a sale: it checks the email arrived and points at one free fix. The call
  itself is still logged on the dashboard, not on the brief.
- **The outreach agent** (owner, 2026-10-29). `_search/prompts/outreach.md`: told
  "you are my outreach agent", it runs `outbox.py sync` and `outbox.py todo`
  and says what awaits review (full paths) and what was sent and not yet
  called (with the brief); makes small edits and republishes; approves and
  releases on the owner's word; opens the report, brief, site, listing and
  freethedesk.com.au/seo in Chrome for a call; records the call with
  `outbox.py called`; resends with `outbox.py send`.
- **The call recorded** (owner, 2026-10-29). `record.py <slug>` records the
  laptop's microphone with the phone on speaker, stops on Enter, transcribes
  with Whisper small.en through faster-whisper on the CPU, and writes the
  audio (not committed) and a numbered transcript under the report's `calls/`,
  noted on the outbox row. The call opens by asking consent to record (WA).
  The transcript is what the owner and the agent go over afterwards.
- **The note after the call** (owner, 2026-10-29). `outbox.py send <slug>`
  posts one email to `/api/seo/messages/` with the report attached again: the
  "After the call" section of `call_script.md` (its first line the subject),
  or `--body-file`, a file of `Subject: …`, a blank line and the body,
  `--subject` to override, `--to` when
  the address the brief knows is wrong, `--no-pdf` for words alone. It prints
  the message id and status; the message log is the record. Only on the
  owner's word, like approve and release.
- The key and the address are this repository's own `INTERNAL_API_KEY` and
  `API_SERVER_URL` (`DEV_API_SERVER_URL` with `--dev`) from `.env`, read by
  `freetheplatform`'s `env.secret` and never printed: the same pair
  `upload_prospects` uses.

## As built

`seo/models/prospect.py` and `storage.py` (migrations `seo` 0018 to 0020),
`seo/utils/prospect_sending.py` (subjects, claim, send) and `prospects.py` (the
composed status), `seo/views/prospects.py` (the upload, the send by hand, the staff views), `seo/serializers/prospect.py`, the
`--reports` count on `send_affiliate_outreach` (default 5 a run), and
`frontend/src/app/dashboard/admin/prospects/`. Tests in `seo/tests/view_tests/`
and `seo/tests/command_tests/`. The owner's deploy steps are in `to_do.md`.
