# Podcast outreach: scrape, write, upload

You are running the podcast affiliate outreach pipeline for freethedesk, start
to finish, in this one session. Run every command from
`C:\Users\ethan\coding\freethedesk`. Set `PYTHONIOENCODING=utf-8` first:
podcast titles and descriptions carry non-ASCII characters and the default
Windows codepage crashes on them.

Three phases, in order. Do not use subagents; the file is edited by hand, by
you. Nothing you do here sends an email: the server's hourly cron does that
from what you upload.

Target: **50 new prospects** uploaded, unless the user named a different number.
If the user named a number, that is the upload target, not a scrape target.

---

## Phase 1 — Scrape

The queue is `affiliates/data/podcasts.jsonl`, one JSON object per line. Count
the entries already in it and scrape the shortfall:

```powershell
py manage.py scrape_podcasts --batch <shortfall>
```

`--batch` is the number of qualifying entries to write, not a number of search
terms. The command walks the iTunes AU store term by term (`aa` to `zz`), keeps
small shows with a recent episode and a published contact address, and keeps
going until it has written that many. The AU store is only a proxy for
Australian shows; foreign hosts are fine, there is no country step.

Re-run it if it stops short. Stop and tell the user if it prints
`5 consecutive terms returned nothing` repeatedly, or `All 676 terms have been
searched`.

The scrape moves the cursor files `affiliates/data/searched_terms.json` and
`searched_feeds.json`; those are committed with the run (Phase 3).

## Phase 2 — Write the openers and rate the fit

Every entry with `"opener": ""` needs one, and every entry with
`"relevance": ""` needs a rating. Entries that have both are done; leave them.

The opener is the second paragraph of the pitch email, straight after
"Hi {first name}," and before "I'm Ethan. I run freethedesk in Perth". The
reader is the host. There is no subject to write; the subjects are set.

It's a bit formulaic. Always start with "I just listened to..." then name the
episode. But don't copy and paste the title. Only write the episode name in a
way that is natural, for example:

- "Peter M. Step 8-9: Step Series at the 12 Step House - 2/24/2026" you would
  just write "the step series at the 12 step house episode"
- "Episode 59: Love is Dead at Mayday Hills: A Beechworth Collab to Keep Living
  For… 👻" you would write "the love is dead episode"
- "Spring Practice Preview: Running Backs + Tight Ends" you would write "the
  spring practice preview episode"

Then react to it. This is where you use `latest_episode_description` and
`latest_episode_title`. Pick one thing from the description and say something a
person would say about it, for example:

- I just listened to the chris barnes episode. Definitely learnt a lot. I think
  I'm going to get my sauna pass back. Great stuff.
- I just listened to ep 28. Great ep. I'm with you guys, I always want the
  weird thing on the menu.
- I just listened to the muscat grape love episode. I never knew that you could
  use grapes for making beer. Super interesting.

Keep it short. Notice these only ever hit one thing from the description. You
aren't rewriting the description. Make the language natural and casual.
Emphasis on the casual: it stops you sounding like AI. No exclamation marks, no
flattery about the show as a whole, no "as a Perth business owner myself".

While you are on the entry, set `relevance` to `"high"`, `"medium"` or `"low"`:
how relevant you would expect a pitch for a free SEO audit (for the listener's
own business website) to be to this show's audience. A show for tradies, small
business owners, marketers or founders is high; a general-interest show whose
listeners might run a business is medium; true crime, fiction, sport fandom,
kids and the like are low. Rate the audience, not the host.

Do not write it programmatically. Write to the file one entry at a time and do
it by hand, keeping each line valid JSON. If an entry's description is too thin
to react to, still name the episode and react to the title. If even that is
impossible, leave the opener blank; the email then goes out without a second
paragraph, which is fine.

While you are in the file, drop any entry that plainly cannot become an
affiliate: a national broadcaster, a network's or a corporation's shared
address, a show that has clearly ended. Delete the line and say so in your
report. Fewer, better entries beat the target.

## Phase 3 — Check and upload

Before uploading, read the whole queue back and check every line:

- Valid JSON, one object per line.
- Every opener either starts with "I just listened to" or is blank.
- Every `relevance` is `high`, `medium` or `low`.
- No placeholder or template text, no two entries for the same show.

**Upload is the last reversible step.** Once an entry reaches the server it is
queued for a real cold email on the next business hour. Then:

```powershell
py manage.py upload_prospects
```

(`--dev` targets the local Django server instead, when the user says so.)
Accepted lines move to `affiliates/data/archive/`; lines the server refused stay
in the queue and the command prints why. Fix those by hand and upload again, or
report them.

Commit the two cursor files, nothing else:

```powershell
git add affiliates/data/searched_terms.json affiliates/data/searched_feeds.json
git commit -m "Outreach: scrape cursor after <N> prospects uploaded"
```

Do not push.

## Report

Tell the user: how many were scraped, how many dropped and why, how many
uploaded as created / already known / suppressed / invalid, and any opener you
left blank. The uploaded prospects appear at
https://www.freethedesk.com.au/dashboard/admin/outreach, where each one shows its
version and, once the cron has run, what became of it.
