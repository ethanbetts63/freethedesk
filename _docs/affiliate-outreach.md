# Podcast affiliate outreach

Agreed 2026-10-25, built 2026-10-26. The stages below are the plan as agreed;
"Running it" and "As built" at the end are what shipped and how to use it. The
pitch emails themselves are in
[`affiliate-pitch/README.md`](affiliate-pitch/README.md); the affiliate
accounts, codes and commissions are being built separately and this plan only
touches them at one point (the sign-up link, stage 6).

## The idea

Find small podcasts with a published contact address, write one true line about
each show by hand, upload the lot to the server, and let a cron job pitch five
an hour until the queue is empty. Hundreds are prepared at once; they go out
over a couple of weeks. The admin dashboard shows who has been pitched, with
which version, and what came of it.

It is Bloomprint's podcast pipeline (`bloomprint/marketing`) with the parts
that hurt taken out, and splitcart's local-to-server upload shape
(`splitcart/pipeline`) for the handoff.

## What is kept from Bloomprint, and what isn't

| Bloomprint                                                                 | Here                                                                                                                                                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| iTunes Search API, AU store, every two-letter term aa to zz, 200 a term    | Kept as is. The AU store is a proxy for Australian shows and a foreign host who signs up is still a client (owner, 2026-10-25). The country review step goes. |
| 100 episodes or fewer, an episode in the last 30 days, English, DNS check  | Kept.                                                                                                                                                        |
| RSS gives owner email, host, website, latest episode title and description | Kept. The feed URL is recorded as the address's published source: the Spam Act's inferred-consent evidence, as `FloristProspect.email_source` is.             |
| Claude writes a subject and "I just listened to..." per show               | Claude writes only the optional `opener`: one true line from the episode description, or nothing. Never a claim to have listened. Subjects are the templates'. |
| State in gitignored files, split between laptop and server, since lost     | The server database is the only record of who exists and who was emailed. Locally only the search cursor (terms and feeds tried) is kept, and it is committed. |
| Gmail SMTP from a personal account, no unsubscribe                         | `freetheplatform.messaging` through Mailgun from a freethedesk.com.au address, with the suppression list, bounce webhook and a one-click unsubscribe page.    |
| One-off `send_outreach --count N` bursts, 30 seconds apart                 | An hourly cron sends the next 5 (stage 4).                                                                                                                   |
| Upload one JSON per request into server `inbox/` files                     | Upload posts batches of entries; the server upserts them straight into the prospect table and reports what it already knew.                                  |

## Where it lives

A new Django app, `outreach`. The affiliate agents are building accounts,
codes and commissions in their own files, and this app must not collide with
them; the two meet only through the prospect's email (stage 6). Their sign-up
is `POST /api/affiliates/signup/` into `affiliates.Affiliate`; the "Podcast
affiliate" enquiry type that `_docs/to_do.md` still describes is being removed. Frontend files
go under `frontend/src/app/dashboard/admin/outreach/` and
`frontend/src/app/unsubscribe/[token]/`.

Local data files live in `outreach/data/`: `podcasts.jsonl` (the queue being
prepared, gitignored), `archive/` (uploaded lines, gitignored),
`searched_terms.json` and `searched_feeds.json` (the cursor, committed).

---

## Stage 1 — Prospect table

**Model** `outreach/models/podcast_prospect.py`, `PodcastProspect`:

| Field                                                              | Type                                        | Notes                                                                                        |
| ------------------------------------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `email`                                                            | `EmailField(unique)`                        | Lowercased on upload. One pitch per address, however many shows share it                     |
| `email_source`                                                     | `URLField`                                  | The RSS feed URL the address was published in                                                |
| `podcast_name`, `host_name`                                        | `CharField`                                 | `host_name` blank means the template says "there"                                            |
| `first_name`                                                       | `CharField(blank)`                          | Derived from `host_name` on upload when it looks like a person's name, else blank            |
| `website`, `apple_url`                                             | `URLField(blank)`                           |                                                                                              |
| `genre`                                                            | `CharField(blank)`                          | iTunes primary genre                                                                         |
| `episode_count`                                                    | `PositiveIntegerField`                      | At scrape time                                                                               |
| `latest_episode_title`, `latest_episode_description`               | `CharField`, `TextField`                    | What the opener was written from                                                             |
| `last_release_date`                                                | `DateField(null)`                           |                                                                                              |
| `opener`                                                           | `TextField(blank)`                          | The one hand-written line. Blank is allowed and sends without it                             |
| `version`                                                          | `CharField(choices a/b/c)`                  | Assigned on upload by rotation: the version with the fewest prospects gets the next one      |
| `pitched_at`                                                       | `DateTimeField(null)`                       | Set by the cron's claim before the send (stage 4). Null means queued                         |
| `reply`                                                            | `CharField(choices none/positive/negative)` | Set by hand on the dashboard; replies land in the owner's inbox                              |
| `affiliate`                                                        | `FK(affiliates.Affiliate, null, SET_NULL)`  | The affiliate account that matched this address (stage 6)                                    |
| `excluded_reason`                                                  | `TextField(blank)`                          | Blank means eligible. Set by hand on the dashboard; the cron skips anyone with one           |
| `scraped_on`                                                       | `DateField`                                 | From the uploaded entry                                                                      |
| `created_at`, `updated_at`                                         |                                             |                                                                                              |

No `status` column. The outcome is read from the message log (`related=prospect`,
`message_type="podcast_pitch.<version>"`): queued, sent, delivered, bounced,
suppressed, as messaging records them, plus the three facts the row itself holds
(pitched, replied, signed up). The dashboard serializer composes the status.

Register `podcast_pitch.a`, `.b`, `.c` with the messaging registry so the
Messages page labels them.

Add a Tier 3 row to [`pii_inventory.md`](pii_inventory.md): podcast hosts' names
and contact addresses, scraped from public RSS feeds, kept indefinitely with the
opener written about their show.

## Stage 2 — Scrape and write, locally

**Command** `outreach/management/commands/scrape_podcasts.py --batch N`. A port
of `bloomprint/marketing/utils/scraper.py` with the same filters and the same
term-by-term loop, writing to `outreach/data/podcasts.jsonl`. Changes:

- The cursor files are JSON, not Python modules loaded with `exec`.
- No `planned_emails` file. The server is the dedupe, at upload (stage 3). The
  scraper only dedupes within the local queue and the feeds already tried.
- Each entry carries `scraped_on` and an empty `opener`; no `subject`,
  `custom_intro` or `country`.

**Writing** `outreach/opener_instructions.md`, the brief Claude works to, batch
by batch, one agent at a time as Bloomprint's `spinup_instructions.md` warns.
The rules, from the pitch README: one line, true, taken from the episode title
or description, never "I listened"; blank when the description gives nothing
honest to say. `promote` is not needed: an entry is ready when it has been
looked at, and a blank opener is a valid outcome, so the upload takes the whole
file.

## Stage 3 — Upload

The splitcart shape, JSON instead of gzipped files, because the server has a
table to write into and no reason to stage files in an inbox.

**Settings** `INTERNAL_API_KEY`, `API_SERVER_URL`, `DEV_API_SERVER_URL`
(default `http://127.0.0.1:8010`, the port the frontend expects Django on), all
from the environment. `INTERNAL_API_KEY` is set on both machines.

**Command** `outreach/management/commands/upload_prospects.py [--dev] [--count N]`.
Reads `podcasts.jsonl`, posts in batches of 50 to the endpoint with the
`X-Internal-API-Key` header and a timeout, moves accepted lines to
`archive/<date>.jsonl`, leaves rejected lines in the queue and prints the
server's counts: created, already known, suppressed, invalid.

**Endpoint** `POST /api/outreach/upload/`, `outreach/views/upload.py`:

- Permission `IsInternalApiRequest`, comparing the header to the setting with
  `hmac.compare_digest`, denying when the setting is unset.
- Throttle scope `internal`, a load limit, say `120/hour`.
- A serializer with `freetheplatform.security.bounds` fields and a batch cap of
  50 entries, so the request stays inside `DATA_UPLOAD_MAX_MEMORY_SIZE`.
- Per entry: lowercase the email; skip it if a prospect with that email exists
  (`already_known`) or messaging's `is_suppressed(email)` is true
  (`suppressed`); otherwise create it, assigning `version` by rotation. Nothing
  is updated: a prospect's row belongs to the server once it exists.

Run `.\scripts\check-security.ps1` after: the route needs its scope and the
new setting must not trip a deploy check.

## Stage 4 — The hourly send

**Command** `outreach/management/commands/send_podcast_pitches.py --count 5`,
scheduled hourly on PythonAnywhere next to `send_due_messages`, which freethedesk
needs scheduled too if it is not already (owner's step, in `to_do.md`).

Each run:

1. Only between 8am and 6pm Perth time (`BUSINESS_TIME_ZONE`), weekdays. Outside
   that window it exits. Five an hour over that window is about 50 a day, which
   is a pace a fresh Mailgun domain can hold; `--count` is there to lower it in
   the first week.
2. Picks the oldest `count` prospects with `pitched_at` null, blank
   `excluded_reason`, no `affiliate`, and an address not suppressed.
3. Claims each with a conditional update,
   `filter(pk=..., pitched_at__isnull=True).update(pitched_at=now)`, and sends
   only if the update hit a row. Two overlapping runs cannot double-send, and no
   lock is held across the send, so messaging's rule about not sending inside a
   transaction holds.
4. Sends with `send(to=prospect.email, channel="email", message_type=f"podcast_pitch.{v}", subject=..., template=f"emails/podcast_pitch/{v}", context=..., related=prospect)`.
   The subject rotates through the version's three lines by prospect id. The
   context is the pitch README's table: `podcast`, `first_name`, `opener`,
   `discount` (20%), `commission_low`/`commission_high`/`free_audit_price` read
   from the site settings' tier prices (half of the cheapest and dearest tiers,
   the Plus price), `unsubscribe_url` (stage 5), `sender_name`.
5. Prints what it sent for the task log.

Version C's footer says to reply "no thanks" instead of a link; those replies
are added to the suppression list by hand, in the Django admin or with a
dashboard "Unsubscribe" action (stage 7).

## Stage 5 — Unsubscribe

Bloomprint's design, copied (`data_management/utils/florist_outreach.py`,
`views/outreach_unsubscribe_view.py`, `frontend/src/app/unsubscribe/[token]/`):

- A token from `django.core.signing.dumps({"p": prospect.pk}, salt=...)`. It
  carries the id, not the address, and never expires, because the link has to
  work a month after the send.
- `GET /api/outreach/unsubscribe/<token>/` says only whether the token is good.
  `POST` to the same path calls `suppress(email, Suppression.Reason.OPTED_OUT)`.
  Two steps because corporate mail scanners open every link before a person does.
- A page at `/unsubscribe/<token>` with one button that POSTs. Noindex, in
  `STATIC_NOINDEX_PAGES` or the dynamic families, whichever the ledger wants.
- Throttle scope `unsubscribe`, say `30/hour`.

This is the second site to build this page; the shared messaging app documents
suppression but not the link. Lifting it into `freetheplatform.messaging` is
logged in freetheplatform's `to_do.md`, not done here.

## Stage 6 — Sign-ups close the loop

The affiliate build (`affiliates/`, in progress 2026-10-25) creates an
`Affiliate` row with an `email` when a host registers at `/affiliates`. The
outreach app listens for it with a `post_save` receiver on `affiliates.Affiliate`
in `outreach/receivers.py`, so the affiliates app never imports outreach:
`PodcastProspect.objects.filter(email__iexact=affiliate.email, affiliate__isnull=True).update(affiliate=affiliate)`.
A prospect with an affiliate is never pitched (stage 4) and shows "Signed up" on
the dashboard, linking to `/dashboard/admin/affiliates/<id>`. A one-off command
flag, `link_prospects`, does the same for accounts that already exist.

## Stage 7 — The dashboard page

`/dashboard/admin/outreach`, "Outreach" in the Work group of the admin nav after
Messages, built from the `AdminList` components the Enquiries and Messages pages
use.

**API** `outreach/views/admin.py`, `IsAdminUser`, throttle scope `staff`:

| Method | Path                                   | Purpose                                                                 |
| ------ | -------------------------------------- | ----------------------------------------------------------------------- |
| GET    | `/api/outreach/admin/prospects/`       | Paginated list; filters `status`, `version`, `reply`; search name, host, email |
| GET    | `/api/outreach/admin/prospects/<pk>/`  | One prospect with its messages (`related_type`, `related_id` on the messaging log) |
| PATCH  | `/api/outreach/admin/prospects/<pk>/`  | `reply`, `excluded_reason` only                                         |
| POST   | `/api/outreach/admin/prospects/<pk>/unsubscribe/` | Suppresses the address, for the "no thanks" replies          |
| GET    | `/api/outreach/admin/summary/`         | Per version: queued, sent, delivered, bounced, replied positive, signed up |

**Page**: a summary strip of the three versions at the top (sent, positive
replies, sign-ups), then the table: podcast, host, email, version, status pill,
sent at, reply. Row actions: mark reply positive or negative, exclude,
unsubscribe. The detail page shows the episode the opener was written from, the
opener, and the messages sent, linking into `/dashboard/admin/messages/<id>`.

Status, composed on the server: `queued` (no `pitched_at`), then the latest
message's status (`sent`, `delivered`, `bounced`, `suppressed`, `failed`),
overridden by `signed_up` when `affiliate` is set and `excluded` when
`excluded_reason` is.

## Stage 8 — Owner's steps

Into `to_do.md` as they arise. Known now:

- The sending address on freethedesk.com.au with SPF and DKIM (already listed).
- `INTERNAL_API_KEY` in the PythonAnywhere environment and the local `.env`;
  `API_SERVER_URL` locally.
- Two hourly scheduled tasks: `send_due_messages` and `send_podcast_pitches`.
- The report cover image deployed before the first B send (pitch README).
- After deploy: upload one test prospect with `--dev` first, then one to
  production addressed to the owner, and read it in a mail client before the
  cron is enabled.

## Tests

- Scraper filters and RSS parsing against fixture feeds; the DNS check mocked.
- Upload: a batch creates, a repeat is `already_known`, a suppressed address is
  `suppressed`, a bad key is 403, an unset key is 403, the batch cap is enforced.
- Send: the window, the claim (a prospect claimed by one run is skipped by a
  concurrent one), the skip rules (excluded, suppressed, signed up), the context
  values, the version's subject rotation, locmem outbox assertions.
- Unsubscribe: GET validates without suppressing, POST suppresses, a bad token
  is 400, the address is never echoed.
- Sign-up linking: a matching affiliate sets `affiliate`; a non-matching one does not.
- Admin API: filters, the PATCH whitelist, the summary counts.

## Running it

Locally, from the repository root, with `INTERNAL_API_KEY` and `API_SERVER_URL`
in `.env`:

```powershell
py manage.py scrape_podcasts --batch 50        # appends to outreach/data/podcasts.jsonl
# Hand batches of ~10 entries (by email) to an agent with outreach/opener_instructions.md,
# one agent at a time; they share the file.
py manage.py upload_prospects --dev            # to the local Django server on :8010
py manage.py upload_prospects                  # to production; accepted lines move to data/archive/
```

The cursor files `outreach/data/searched_terms.json` and `searched_feeds.json`
change with every scrape and are committed; the queue and archive are not.

On the server, two hourly PythonAnywhere tasks:

```bash
python manage.py send_due_messages
python manage.py send_podcast_pitches --count 5
```

`send_podcast_pitches` sends only 8am to 6pm Perth time on weekdays and exits
otherwise; `--ignore-window` sends at once, for the owner's test. A prospect is
pitched exactly once: a failed send leaves the row claimed and the failure in
the message log, where staff resend it from the Messages page rather than the
cron pitching again. `link_prospects` points prospects at affiliate accounts
that existed before they were uploaded; sign-ups after that link themselves.

The dashboard page is `/dashboard/admin/outreach`: three version cards (queued,
reached, bounced or failed, positive replies, signed up), then the table with
status, version and reply filters. A prospect's page records the reply, excludes
them with a reason, suppresses the address for a version C "no thanks", and
shows the episode the opener was written from and every message sent.

## As built

Where the code differs from the stages above:

- **Episode descriptions are entity-decoded** (`&amp;` becomes `&`) as well
  as stripped of tags, since the opener is written from them. Bloomprint's
  scraper did not.
- **`first_name`** is taken from `host_name` only when it is one to three
  words, none of them a show or company word (podcast, media, network, team,
  the, and so on), and the first is alphabetic. Anything else sends "Hi there".
- **The sending window** reads `settings.TIME_ZONE` (Australia/Perth); there is
  no separate business time zone setting in this repository.
- **Version B's third subject** keeps the pitch README's multiplication sign.
- **The upload endpoint** has no authentication class at all; the shared
  secret, compared in constant time, is the whole credential. Fifty entries a
  request, each validated on its own so one bad line is reported and the rest
  are taken.
- **The dashboard's "unsubscribe" action** also records a negative reply when
  none was recorded, since a "no thanks" is one.
- **Actions live on the prospect's page**, not as row buttons in the table: the
  reply as three buttons, the exclusion as a textarea, the suppression behind a
  confirm.
- **`link_prospects`** is its own command rather than a flag.
- **The frontend's forms ledger** gained the unsubscribe form as Track B.
  `check:forms` also reports two affiliate-portal forms and a renamed verify
  form from the affiliate build as unledgered; that is that build's to fix.

