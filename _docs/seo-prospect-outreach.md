# SEO prospect outreach

Planned and built 2026-10-28. The prospect report pipeline in `../ftp_search`
finds businesses to write a short free report, four recommendations and the offer of the full one, for, mostly Perth
businesses paying for searches they do not win (`_search/prospecting/`), and
since 2026-10-30 podcast hosts for the affiliate program too. The report is
written the same way whoever it is for. This is the half that writes the
email, sends it from this server with the report's link (no pdf since
2026-11-11, owner's call: the attachment was the likely road to spam), and tracks the
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
- **Subjects, rotated by prospect**, so replies can be read against them.
  Subjects 1, 2, 4 and 5 were retired from the rotation on 2026-10-30 (owner's
  call: no "SEO" and no "free" in a subject); their rows keep them. In
  rotation: 3 (only with a paid search), 6 and 7, approved the same day for
  body 5. Should every live subject need a paid search again, a business
  without one is refused at upload (`no_subject`) until one is approved.
  1. I spent 3 hours on this. I am not a bot.
  2. {count} free fixes for {domain}
  3. Your '{paid search}' ad, and what your site is missing
  4. A free SEO report for {business}
  5. {business} isn't on Google's first page for '{paid search}'
  6. A list of fixes for {domain}
  7. What's wrong with {domain}, and how to fix it

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
- **Three purposes.** `purpose` is `client`, a business we hope will buy the
  full report, `affiliate`, a podcast host we hope will join the program
  ([`affiliate-program.md`](affiliate-program.md)), or `partner`, a coach or
  adviser we hope will refer their clients through the same program (owner,
  2026-11-11). The outbox sets it from the ledger entry's `source`, or
  `--purpose`; a held row's purpose changes on approval
  (`outbox.py approve --purpose partner`, `purpose` on the approve endpoint),
  and its subject and body are chosen again.
- **Five bodies, one in the test.** A client gets body 5, the fixes list
  (`CLIENT_BODIES`; owner's words, 2026-11-11): who Ethan is, the catch said
  plainly, every title of the report whole, the report's link, the forward
  line, the number. Bodies 1, 2 and 4 are paused,
  kept for the rows that drew them; the levelling returns when a second body
  is added. Body 1 is the report email, in the words the analyst's email used:
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
  is the affiliate offer, every host, in the owner's words of 2026-11-11: the
  report as a sample of what they would be advertising, every title in full,
  the report's link, then the program at the live discount, share and
  commissions (`affiliates.utils.pitching.pitch_figures`) and the affiliate
  page. It goes under subject 8, "Podcast affiliate offer for {business}"
  (the podcast's name), out of the client rotation. Body 6 is the partner
  offer, every coach or adviser, in the owner's words of 2026-11-11: body 3
  with the partnership in place of the podcast offer (their clients get the
  discount, they get the share), under subject 9, "A partnership idea for
  {business}", also out of the client rotation. No email carries the pdf:
  a row without a page is neither sent nor followed up. The source copies are in
  `call_script.md` in ftp_search, "The report email"; the server holds the
  same text in `prospect_sending`, and the two are changed together. Body 2's
  way out is the spam button, which it names twice; a 'no thanks' reply is
  still suppressed by hand. Each dashboard row says which subject and body it
  got.
- **Unsubscribe by reply.** Bodies 1, 3 and 5, and so every follow-up, end
  "Reply 'no thanks' and I won't email again." (body 5 since 2026-11-04; the
  server adds it to an old stored body that lacks it). A test holds every body
  in rotation to it. A reply that asks is suppressed with the dashboard's Unsubscribe
  action. The Spam Act requires a functional unsubscribe facility; a reply
  address is one.
- **Plain text**, as pitches A and C: a note from one person, not a newsletter.
- **The follow-up, a week on** (owner, 2026-11-04), **and again on the owner's word** (2026-11-11). When seven days have passed
  with no call and no reply in the owner's inbox (ethanbetts63@gmail.com, where
  replies land), the outreach agent queues it at startup:
  `POST /api/seo/prospects/follow-up/` with the slug, through `outbox.py
follow-up`. It is refused (409, with the reason) when it is too soon, already
  queued, or the row is called, replied, excluded or suppressed. The hourly run
  sends it in the same window and at the same pace: the report linked again,
  under a subject drawn from the live rotation (never the report email's own,
  nor an earlier follow-up's, unless no other is live for that prospect) and the
  client body of the day, its first paragraph opening "Just following up on my
  previous email, in case it got buried." Once one has gone, `again`
  (`outbox.py follow-up --again`) queues another; never while one still waits. Both are chosen when it is queued and kept on
  the row (`follow_up_subject_version`, `follow_up_body_version`), levelled
  across follow-ups the way the first email's are. Its message type is
  `seo_prospect_follow_up.<its subject>`, so the dashboard's status still reads
  the first email; `followed_up_at` on the row is when it went. Once only.

## The server

**Model** `seo/models/prospect.py`, `SeoProspect`. It is the calls list too.

| Field                                | Notes                                                                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `domain`                             | unique; the ledger's key                                                                                                   |
| `business`, `slug`, `report_version` |                                                                                                                            |
| `report_path`                        | the report's full path on the owner's machine, shown to copy                                                               |
| `report_pdf`                         | `FileField` in private storage: messaging keeps an attachment's name, not its file, so the cron needs the PDF here         |
| `contact_name`, `email`, `phone`     | from the prospecting ledger                                                                                                |
| `overview`                           | one line: what the business is, built from the ledger (trading name, Google category, suburb)                              |
| `issues`                             | the report's five highest-impact recommendation titles, strongest first; body 1 names the first two, body 4 lists all five |
| `paid_searches`                      | the searches its ad was seen on; empty for a host, or a business found some other way                                      |
| `purpose`                            | `client`, `affiliate` or `partner`, from the upload or approval; `client` unless it says                                   |
| `subject_version`                    | a client: 3 (needs a paid search), 6 or 7, by rotation, 1, 2, 4 and 5 retired; an affiliate: 8; a partner: 9               |
| `body_version`                       | a client: 5 (1, 2 and 4 paused); an affiliate: 3; a partner: 6                                                             |
| `metric`                             | what the business counts, for body 2; `bookings` unless the upload says                                                    |
| `body`                               | empty since 2026-10-30; the analyst's email on the rows before it, which body 1 sent as written                            |
| `queued_at`, `sent_at`               | `sent_at` set by the cron's claim, as `pitched_at` is                                                                      |
| `called_at`, `call_notes`            | set by hand on the dashboard                                                                                               |
| `reply`                              | none, positive or negative, by hand                                                                                        |
| `excluded_reason`                    | blank means eligible; set by hand to hold one back                                                                         |

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
`send(..., related=prospect, plain=True)`, with no attachment.

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
called" action with notes, reply, exclude, unsubscribe.

## The report's link (owner, 2026-11-04)

Every report has an address of its own on the site,
`freethedesk.com.au/reports/<business>-<token>` (`/reports/bedford-chiropractic-clinic-xufxp7pjfd`;
the first links went out under `/r/`, and the site sends them on, owner 2026-11-07):
the report as a page, the layout a phone shows and, on a desktop, the
site's guide layout (the cover full width, the contents as a menu beside one
column), with the site's strip over it (the number, the address, a button to
the SEO page, the PDF), the ask for the full report under it (a band the page's
width: the words beside the SEO page's picture of what an audit reads; the
page's alone, since the PDF's upsell card carries the picture) and the site's
footer last. The owner texts it by hand during a call, from the call brief, which prints
it with `?s=text`; every report email and follow-up links it, the only way
the report reaches them ("You can read the whole report here"); nothing else
links to it. A re-attach (`outbox.py html`) also brings the report's titles and
count, so the email lists what the page holds after a cut.

- **The page.** `report_html` on the row, the `report.html` beside the PDF in
  the project, uploaded with the report (`outbox.py add`) or after it for
  the rows from before the page existed (`POST /api/seo/prospects/html/`,
  `outbox.py html`). A re-attach sends the PDF printed with the page too, and
  the endpoint replaces the row's `report_pdf` with it, so the page's PDF link
  serves the same version as the page. The site rewrites `/reports/:key` and `/reports/:key/pdf` to
  Django's `/api/seo/r/<key>/` and `.../pdf/` (`seo/views/prospects.py`,
  `SeoReportPageView`, `SeoReportPdfView`). A row with no page serves its PDF at
  the link.
- **The preview.** A link pasted into a chat or a text shows a card only if
  the page carries Open Graph tags, and it carried none (owner, 2026-11-07).
  `page_document` now writes them into the head: the title ("<business>: SEO
  report"), one line, the address, and a 1200 by 630 picture. The picture is
  the report's own cover when the row has one (`report_cover`, taken by
  `render --pdf` as `preview.jpg` beside the PDF and uploaded with the page by
  `outbox.py add` or `html`), served public and cacheable at
  `/reports/<business>-<token>/cover.jpg` (`SeoReportCoverView`; the apps
  fetch it apart from the page, and a refused or uncacheable picture leaves
  the link bare); otherwise the site's SEO picture, the one the ask shows, at
  `/og-images/seo-report.jpg`. The apps cache a link's card for a day or
  more, so a link pasted before the tags existed keeps showing nothing; test
  with a link not pasted before, or one with `?v=2` on it.
- **The name.** The address leads with the business's name as a slug, then
  the token (`prospect_links.link_key`), so it reads as the business's own page
  and not a random string (owner, 2026-11-06). The name is not a key: the
  server finds the row by the token after the last hyphen, and a link with the
  token alone (every link sent before 2026-11-06) or under another name is sent
  on (302, the query kept) to the named address, where the open is logged. A
  business renamed on its row moves its link; the old one still lands. Both answer `X-Robots-Tag: noindex, nofollow, noarchive`,
  `Cache-Control: private, no-store`, and a `robots` meta in the page; the
  site's CSP allows the report's inline charts and embedded fonts.
- **The token.** Ten characters from an alphabet with no 0/o or 1/l/i and no
  hyphen (`new_link_token`), so a link read out on a call is typed as heard and
  the name before it parses; set once per row, unique, never regenerated, so a
  texted link keeps working after a re-render.
- **The opens.** `SeoProspectOpen`: one row per open, the page or the PDF, when,
  where the link came from (`?s=email`, `follow-up`, `text`, `dashboard`), the
  user agent, and `likely_bot` for a crawler or a messaging app's link preview
  (iMessage and WhatsApp fetch a link the moment it is sent). No address is
  kept. The dashboard shows the opens by people and the last one, on the list
  and the row; the first engagement signal the outreach has.
- **The text is the owner's own.** No button sends one (owner, 2026-11-04):
  the owner texts the link from their phone, during or after a call where the
  person said yes to it, which is express consent; a cold text is a commercial
  message the Spam Act does not allow on inferred consent. The brief's link
  carries `?s=text`, so those opens read as from a text.
- **The three hand-sent reports** (Rebus Legal, Hartley Plumbing, Solar 365)
  had no row. `outbox.py register` posts them with `sent_at`, the subject and
  body they went with and the analyst's words, and the server creates the row
  already sent (`outcome: registered`), never queued, so each gets a link and a
  dashboard row.

## The pipeline side (ftp_search)

- **The pipeline writes no email** (owner, 2026-10-30). A prospect project
  is set up and written like any other, from the site alone; the pipeline is
  told nothing about ads or podcasts. What the sweep saw stays in the ledger
  and reaches the server through the outbox, for the subject lines and the
  call brief.
- **Uploaded when done, emailed only when approved** (owner, 2026-11-05;
  until then nothing was uploaded before approval, 2026-10-28).
  `_search/tools/prospecting/outbox.py` keeps the local outbox,
  `_search/prospecting/outbox.json`. The report delegator's last step for a
  prospect report (step 15 of `_search/prompts/01_delegator.md`) is
  `outbox.py add -p <slug>`: it reads the PDF, `report.json` (the
  recommendation count, the three highest-impact titles) and the ledger entry
  (the contact, the sightings, the `source` that sets the purpose); warns when
  the address's domain is neither the site's nor a webmail one; refuses a
  business the message log shows was already sent a report; posts the report
  with its page to `POST /api/seo/prospects/`, which creates the row **held**
  (`approved_at` null) with its link and the subject and body chosen; and
  lists it as `awaiting_approval` with the link. The hourly run sends only
  rows with an `approved_at`. The owner reads each report at its link, asks
  for any edits (`render --pdf`, then `add` again, which puts the new page and
  PDF behind the same link through `/api/seo/prospects/html/`), and says it
  may go: then `outbox.py approve <slug>` posts the word to `POST
/api/seo/prospects/approve/` (`approved` 1, or 0 to take it back:
  `outbox.py unapprove`, or an `add` after approval), the next hourly run
  sends it, and the ledger entry is marked `queued`. `approve` refuses a PDF
  that is not the one uploaded, so what goes out is what the owner read.
  Approval happens only on the owner's word; no pipeline step does it.
  `outbox.py add` refuses to post to a server without the approve endpoint,
  since one from before it queued every upload. `outbox.py sync` and
  `ledger.py sync` move it to `sent` from the message log. The dashboard
  shows a held row as "Awaiting approval" (status `held`), before `queued`.
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
  and says what awaits review (links and full paths) and what was sent and not yet
  called (with the brief); makes small edits and republishes; approves on the
  owner's word; opens the report, brief, site, listing and
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
  owner's word, like approve.
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
