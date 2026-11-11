# To do

Open tasks for this repository. Append any you find; delete one once you know it's done.

## Delete the Arena Joondalup Physiotherapy prospect from the server

Added 2026-11-11. Owner's step. The owner withdrew this report (slug `arenajoondalupphysio`, link `/reports/arena-joondalup-physiotherapy-ksa2jg9tuw`) and deleted its project; it was uploaded and held, never emailed. There is no delete route, and a `SeoProspect` row's files stay in the private report storage when the row goes, so in a Django shell on the server delete the three files, then the row:

```
p = SeoProspect.objects.get(slug="arenajoondalupphysio")
for f in (p.report_pdf, p.report_html, p.report_cover):
    if f: f.delete(save=False)
p.delete()
```

Until then the link still answers and the dashboard still lists the row under "Awaiting approval".

## Deploy the report link's preview picture

Added 2026-11-07. Owner's step. A report link pasted into a chat or a text now shows a card: the page carries Open Graph tags, and the row keeps a cover picture (`seo` 0028, `report_cover`), served at `/reports/<business>-<token>/cover.jpg` through a new rewrite. Deploy Django with `migrate` for `seo` 0028, and the frontend for the rewrite and the fallback picture (`public/og-images/seo-report.jpg`). Until the deploy, `outbox.py add` and `html` send the picture and the old server ignores the field (it says `cover_replaced` only once deployed). After it, `render --pdf` each held report once more (it writes `preview.jpg` beside the PDF) and run `outbox.py html <slug>` so each link gets its own cover; a row without one shows the site's picture. The apps cache a link's card, so test with a link not pasted before.

## Deploy the report link with the business's name in it

Added 2026-11-06. Owner's step. The report link is now `/r/<business>-<token>` (`/r/bedford-chiropractic-clinic-xufxp7pjfd`); a bare `/r/<token>` link, which every report sent before this deploy carries, is sent on to the named address. Deploy Django and the frontend (the rewrite's parameter was renamed, nothing else). No migration. After it, the outbox still holds the bare links: run `outbox.py html <slug>` for every row (ftp_search/_search/tools/prospecting), which the PDF step below needs anyway; its answer carries the named link and the outbox keeps it. Until then `todo` and the call brief print the bare links, which still land.

## Deploy the held upload: reports go up when done, emailed only on approval

Added 2026-11-05. Owner's step. Deploy Django and the frontend, and run `migrate` for `seo` 0027 (`approved_at` on the prospect; every existing row is marked approved when it was created, so nothing queued is held back). Until this deploy, `outbox.py add` lists a report but refuses to upload it (the old server would email it at once); after it, run `add` again for anything listed without a link, and `approve` on the owner's word sends. The dashboard gains the "Awaiting approval" status and count.

## Redeploy: the report link without the text button

Added 2026-11-04. Owner's step. The report link went live on 2026-11-04 (seo 0026, the `/r/:token` rewrite, every sent report's page attached and the three hand-sent reports registered). The owner then dropped the dashboard's "Text the link": they text it by hand from the call brief. Deploy Django and the frontend once more to take the button and its SMS endpoint down. The same deploy changes the page's strip: the number and the address as taps in place of "Call Ethan", and the ask closer under the credits on a phone. On 2026-11-05 the report took the site's guide layout on a desktop (the cover full width, then the contents as a sticky menu beside one column); the strip and the ask join that grid through the same file (`seo/utils/prospect_links.py`), so until this deploy the strip sits in the report's column on a desktop rather than across the page. Later on 2026-11-05 the same file gained two more changes waiting on this deploy: the ask under the report takes the report's column on a desktop rather than the page's centre, and the site's footer closes the page. On 2026-11-06 the ask became a band the page's width under the report (the words beside a guide's picture), and the strip's "written for" line gave way to a button to the SEO page, in the same file, also waiting on this deploy. The pages themselves were re-attached and need no deploy. Also on 2026-11-05, `POST /api/seo/prospects/html/` learned to take the PDF with the page (`report_pdf`, optional) and replace the row's: every sent report was re-rendered and re-attached with its new PDF, but until this deploy the server ignores the PDF, so each link's PDF is still the one first sent. After the deploy, run `outbox.py html` for every sent row once more (ftp_search/_search/tools/prospecting) to send the PDFs; it prints "PDF replaced" per row.

## Web Development Terms 2026-11-04: deploy, and name the package's audit tier

Added 2026-11-04. Owner's step. Web Development Terms 5.4 now names the SEO Audit Terms in place of the SEO Subscription Terms, so `FTP_AGREEMENTS` names `webdev.services` version 2026-11-04 (effective 4 November 2026). Deploy Django and the frontend together so the new terms and their version arrive at once; a package checkout against new text under the old version is refused. No migration.

Owner's decision: which audit the 10-page website includes. Its card says "An SEO audit at three months" and 5.4 names no tier, and nothing in the code says Essentials, Plus or Complete. Once decided, name it on the card (`includes` of `website_large` in `frontend/src/lib/servicePricing.ts`) and in 5.4, and bump the terms' version again (search report r6, rec 7, step 5).

## Deploy the prospect follow-up

Added 2026-11-04. Owner's step. Deploy Django and run `migrate` for `seo` 0024 and 0025 (the follow-up fields, then its own subject and body). Until then `outbox.py follow-up` gets a 404 from `/api/seo/prospects/follow-up/` and nothing is queued; the outreach agent says so at startup. No frontend change: the dashboard API now also returns `follow_up_queued_at`, `followed_up_at`, `follow_up_subject_version` and `follow_up_body_version`. Waiting on it: the 13 reports sent on 30 October, which the owner asked to follow up early.

## Deploy invoicing and package checkout

Added 2026-10-09. Owner's step. Everything up to f3d3853 was pushed on 2026-10-08: invoicing, the package order checkout and the Web Development Terms. On deploy:

- pip installs freetheplatform v0.35.0.
- Run `migrate` for `ftp_invoicing` 0001–0003 and `core` 0017–0023, Django before the frontend.
- Confirm `FTP_PROXY_SECRET` is set in production on both Django and the frontend.
- Order emails and SMS need `NOTIFICATIONS_ENABLED` plus Mailgun and Twilio configured.
- Set the legal entity at /dashboard/admin/settings/invoicing. Bank details are already model defaults (core 0021).

## Deploy the 24 October site changes

Added 2026-10-24. Owner's step. On the Django deploy, run `migrate` for `core` 0026 (the one-page website package, $750 by default). The dealer and SEO terms now say "freethedesk", so `FTP_AGREEMENTS` names version 2026-10-24 for both; deploy Django and the frontend together so the new terms and their version arrive at once. The dealer page, the sample report and every guide now render per request and read their prices from the site settings. The AI-check pop-up is gone; the inline AI-check strip stays on wide screens.

SEO is now one audit paid once, in three tiers (Essentials $550, Plus $850, Complete $1,400 by default; set them at /dashboard/admin/settings/site). The same Django deploy runs `core` 0027 (the one-off price becomes Essentials; the subscription prices go) and `seo` 0014. The SEO terms are now the SEO Audit Terms at /legal/seo-audit-terms, and the old address redirects. Before deploying, look in Stripe for any active SEO subscription: they keep renewing under the old terms and the webhook still handles them. If there are none, say so, and the subscription callbacks in `payments/fulfilment.py` can be deleted.

Once it is live, change the Business Profile's Website design, Website development and Website redesign services from "From $3,000" to "From $750" (Edit services, in Google Search signed in as nahte12321). They quote the live site's $3,000 until the one-page package ships.

## Deploy the 14 October site changes

Added 2026-10-14. Owner's step. On the Django deploy, run `migrate` for `core` 0024 (the enquiry "ignored" status). The dealer and SEO terms changed text, so `FTP_AGREEMENTS` now names version 2026-10-14 for both; deploy Django and the frontend together so the new terms and their version arrive at once. The homepage now renders per request and reads its prices from the site settings.

## Google Ads: what is left after search report r4 rec 1

Added 2026-10-14, rewritten 2026-10-22. Account freethedesk 702-260-4011, signed in as analytics@freethedesk.com.au.

Done on 22 October:

- Campaign #1 (Performance Max) is paused. Before pausing, it was set to Presence only, and the account got 157 excluded placements (140 app categories and 17 sites).
- New campaign "Search – Perth services" is live at A$5 a day. It runs on Google Search only, in Perth (city, Presence only), in English, on Maximise clicks with a A$4 max CPC. Its URL suffix is `utm_source=google&utm_medium=cpc&utm_campaign=search-perth`, and AI Max and broad match are off.
- Ad group "SEO" is enabled and sends ads to /seo with 6 phrase-match keywords.
- Ad group "Websites" is built but paused. It sends ads to /website-development with 5 phrase-match keywords.
- Nine campaign negative keywords: course, training, beginner, tutorial, free, jobs, salary, "how to", "screaming frog".

Still to do:

- The account is paused until a payment is made ("make a payment which will be added to your account balance"). Nothing serves until then.
- Advertiser verification was submitted on 2026-10-24 and is pending; until it clears both ads stay "limited by policy".
- Once `generate_lead` records real enquiries in Ads, switch the Search campaign's bidding to Maximise conversions with "Submit lead forms" as its only goal. It now uses the account defaults, Purchases and Submit lead forms (search report r4, rec 2).
- Turn on the Websites ad group when it should run. That splits the A$5, so raise the budget at the same time.
- About a week after launch, read the search terms report and add negatives for searches that don't fit.

## Search Console and directories

Added 2026-10-14. Owner's steps. The mistyped /sitemaps.xml submission was removed on 14 October.

- GoodFirms: "Post a project" (myaccount.goodfirms.co/users/projects/post) is the buyer side, for hiring an agency, so skip it. List the business instead with GoodFirms' "Get Listed" as a service provider: name freethedesk, phone 0423 853 830, Perth WA, https://www.freethedesk.com.au/, web development and SEO. Do the same on DesignRush, Oneflare and Bark (search report r3, card 4).
- Claim the business on Bing Places (bingplaces.com, which can import the Google Business Profile) and Apple Business Connect (businessconnect.apple.com), with exactly the Business Profile's name, phone and service area, so the three map listings agree with the site (search report r3, earn-outside-links).

## Traffic ideas parked for later (from the 14 October traffic review)

- Four more WA dealer guides from `_docs/licensing/research/` and `wa_dealer_forms/`, one a week, each ending on /licensing or /dealers. Topics: whether a WA dealer can sell without the buyer coming in (which forms need DoT's consent to e-signing, Electronic Transactions Act 2011 s9–10); the MR9B change of ownership step by step (7-day deadline, $100 infringement, consignment, how it differs from the MR9); statutory warranty Forms 5A, 5 and 6 for cars and motorcycles; the Bulk Licensing Scheme. Check each figure against the live DoT or Consumer Protection page on the day of writing, and say "not legal advice".
- MTA WA (Motor Trade Association of WA): ask about its business partner programme, an article for members, and a sundowner slot for online licensing. Separately, email WA motorcycle dealers one at a time.
- Guide: "How to redesign a website without losing your Google rankings". Cover the redirect map, keeping titles that already rank, resubmitting the sitemap and watching Search Console for six weeks. Use the site's own case: /website-development-perth drew "perth website development" showings in early September, its redirect went missing from 9 September to 2 October, and the showings haven't come back. End on the website redesign page and /seo.

## Deploy Django for everything pushed on 22 October, then test an enquiry

Added 2026-10-22. Owner's step. Everything up to 73466ad was pushed on 22 October, so the frontend is live ahead of Django. On the Django deploy: `python -m piptools sync requirements.txt` (freetheplatform v0.37.1, which now issues the emailed sign-in codes) and `migrate` for `core` 0025. Until then, choosing "SEO audit" on /contact is refused; the other enquiry types work. Analytics event retention is 14 months since 21 October. Once Django is deployed, send one test enquiry from https://www.freethedesk.com.au/contact. Check that the staff email arrives, that `generate_lead` shows in Analytics (Reports > Realtime), and that within a day it appears under the "freethedesk (web) generate_lead" conversion in Ads.

## Deploy the contact page changes, then have Google read it

Added 2026-10-19. Owner's step. Search report r4, rec 9 (contact-page-call-and-content). /contact now has an "Or call 0423 853 830" button under its opening line and an "SEO audit" choice in "What do you need?", which sends no budget, and the phone field is labelled optional. The frontend went live on 22 October; the Django deploy above brings `core` 0025 (the enquiry "SEO audit" type). Once that is done, in Search Console (analytics@freethedesk.com.au) run URL inspection on https://www.freethedesk.com.au/contact and click "Request indexing", once. Google lists the page as found but has never read it.

## The read API test fails when the whole suite runs

Added 2026-10-22. `core/tests/test_read_api.py::test_every_dealers_sales_are_read_and_their_credentials_are_not` passes on its own and fails with `KeyError: 'models'` when run after `sales seo payments core identity dealers`: `/api/read/models/` answers something other than the model list, most likely a throttle or cache left over from an earlier test. It fails the same way without the 2026-10-22 shared-code change, so it predates it.

## A marketing email address for the podcast affiliate outreach

Added 2026-10-24. Owner's step. The podcast affiliate pitch templates (`core/templates/emails/podcast_pitch/`, explained in `_docs/affiliate-pitch/README.md`) need a dedicated sending address on the freethedesk.com.au domain, not the Gmail account Bloomprint's outreach used, with SPF and DKIM set up so cold email lands in inboxes. Neither footer carries a postal address, which US spam law (CAN-SPAM) asks for; cut on 2026-10-24, the owner's call. The listener discount is decided: 20%, passed to the templates as `discount`. The commission needs no decision: audits are bought once, so half of each sale is paid once.

## Deploy the affiliate program, then pay the first commission by hand

Added 2026-10-24, rewritten 2026-10-25. Owner's steps. The program is built and documented in `_docs/affiliate-program.md`: sign-up opens the account, the code and the free audit; a code at the SEO checkout earns a commission when the audit is paid. On deploy:

- `migrate` for `affiliates` 0001, `core` 0029 (the two affiliate percentages; the enquiry type is gone) and `seo` 0015 (complimentary audits, the signup's discount code) and 0017 (the order form asks for no name, so `contact_name` may be blank).
- `FTP_AGREEMENTS` names the Affiliate Program Terms, version 2026-10-25, so deploy Django and the frontend together.
- `python -m piptools sync requirements.txt` installs freetheplatform v0.41.0, then `migrate` for `ftp_messaging` 0004 (a message now records the names and sizes of the files it went out with; the message detail page lists them). The composer and the podcast pitches (A and C; B is paused) now send plain text with no HTML part, so a note to one person is not filed under Promotions.
- `DISCOUNTS_ENABLED` is on in settings; nothing else to set. Each affiliate's Stripe coupon is created the first time their code is used.
- Then open https://www.freethedesk.com.au/affiliates, sign up with a test address, verify it with the emailed code, and check the portal shows the code. Buy a test audit on /seo with that code (Stripe test mode is not available on production, so use a real card and refund it) and check the commission appears on /dashboard/admin/affiliates.

Paying out is not built. Commissions sit as "Owed" on the affiliate's staff page; settle the first ones by bank transfer and note it there. The build is Stripe Connect Express per affiliate and a transfer per commission, as Bloomprint's `partners` app does; it needs Connect enabled on the freethedesk Stripe account first.

## Deploy the high-fit-only pitch rule

Added 2026-10-30. Owner's step. After pulling, the first hourly run of
`send_affiliate_outreach` sets aside every queued prospect rated medium or low
(about 171 of the 194 queued on 2026-10-30) with an `excluded_reason` saying so;
they show as "Excluded" on /dashboard/admin/outreach, reversible on each one's
page. Only the 23 queued high-fit rows, and high-fit uploads after them, are ever
pitched, under the one subject line "Affiliate commission offer for {podcast}".
The pitches themselves stay paused until the task passes `--count`. No migration.

## Podcast outreach: owner's steps before the cron is enabled

Added 2026-10-25, updated 2026-10-26. The first 302 prospects were uploaded on
2026-10-26 with `INTERNAL_API_KEY` set on both ends; they show at
/dashboard/admin/outreach. Nothing sends until the scheduled task exists. If the
server was not deployed past commit 7cf6d22 before that upload, the relevance
ratings were dropped on the way in; a redeploy does not restore them. Left:

- Before enabling it: upload one test prospect addressed to yourself and read all
  three versions in a mail client. The report cover image and `/affiliates` must be
  live first (pitch README).
- The queue is empty (2026-10-30): 69 high-fit prospects were uploaded that day
  and 212 medium and low entries archived unsent in `affiliates/data/archive/`.
  The next run of `affiliates/outreach_instructions.md` scrapes by `--terms`.

## Forms ledger after the affiliate program commit

Added 2026-10-26. `npm run check` fails on `check:forms` since 91e5089: `app/affiliate-portal/account/page.tsx` and `components/auth/VerifyEmailCodeForm.tsx` render a form and are not in `frontend/scripts/check-forms.mjs`, and `app/seo/payment/complete/VerifyEmailForm.tsx` is in the ledger but no longer renders one. Add the two rows with their track and repoint or drop the third. Still failing on 2026-11-04, and `components/layout/SessionLink.tsx` now renders an unlisted form too.

## The schema check in conftest reads the dev database when a run has no database tests

Added 2026-10-26. `_complete_test_schema` depends on `django_db_setup`, but pytest-django only creates the test database for runs that contain a `django_db` test. A run of pure unit tests (for example `affiliates/tests/util_tests/test_scraper.py` alone) therefore introspects the development database instead, and exits with "The test database is missing 1 table(s)" whenever a new app's migration has not been applied there yet. `py manage.py migrate` clears it; the fixture should skip its check when no database was set up.

## Podcast outreach: the outreach subdomain on a second Mailgun account

Added 2026-10-26; rewritten 2026-10-30 after the owner chose the way: **a second, free Mailgun account for a subdomain, `outreach.freethedesk.com.au`** (option B; the Foundation plan at USD 35 a month was the alternative). Why: 3 spam complaints in 108 pitches (2.8%, against Gmail's 0.3% line) went against `freethedesk.com.au`, the domain the sign-in codes, receipts and prospect report emails use. The pitches stay paused until this is done; nothing cold goes from the main domain again. In Cloudflare, `mail.freethedesk.com.au` already has its Mailgun MX records and `_dmarc.freethedesk.com.au` reports to hello@; SPF and DKIM for the current domain are done.

Build first (agent, freetheplatform): the Mailgun webhook (`api/views/webhooks.py`) verifies one signing key, `MAILGUN.WEBHOOK_SIGNING_KEY`. A second account has its own key, so its delivered, failed and complained events would be rejected and complaints on the outreach domain would go unrecorded. Let a named sender carry `WEBHOOK_SIGNING_KEY` and have the webhook accept any configured key; tests, release note, bump. Then in freethedesk read it from `OUTREACH_MAILGUN_WEBHOOK_SIGNING_KEY`.

Owner's steps, after that is deployed:

1. Open a second Mailgun account (Free plan: 100 a day, one custom domain) under a different login, for example outreach@ or ethan@. Check Mailgun's terms allow two accounts for one business; if not, upgrade the main account to Foundation instead and add the domain there (the steps are the same from 2).
2. In it add `outreach.freethedesk.com.au` (Send, Domains, Add new domain, US region, 2048-bit DKIM, no Red Sift DMARC), then in Cloudflare add the SPF TXT, the `pic._domainkey` DKIM TXT and the two MX records it lists, all DNS only, plus `_dmarc.outreach.freethedesk.com.au` `v=DMARC1; p=none; rua=mailto:hello@freethedesk.com.au`.
3. Make a sending key for the domain and a delivery webhook (delivered, permanent failure, complained, unsubscribed) pointed at `https://www.freethedesk.com.au/api/webhooks/messaging/mailgun/`; copy that account's webhook signing key.
4. Set on PythonAnywhere: `OUTREACH_FROM_EMAIL="Ethan Betts <ethan@outreach.freethedesk.com.au>"`, `OUTREACH_MAILGUN_DOMAIN=outreach.freethedesk.com.au`, `OUTREACH_MAILGUN_API_KEY=<the sending key>`, `OUTREACH_MAILGUN_WEBHOOK_SIGNING_KEY=<that key>`. Reload. Replies to ethan@outreach... need a route or forward in Mailgun (Receiving, Routes: match recipient, forward to hello@), or the host's reply is lost.
5. Add `outreach.freethedesk.com.au` to Google Postmaster Tools.
6. Warm up: `--count 1` on the hourly task for the first two weeks (about 10 a day), then `--count 3`. Stop if Postmaster shows complaints above 0.3%.

## Deploy the composed report emails

Added 2026-10-30. Owner's step. On the Django deploy run `migrate` for `seo` 0019 to 0023 (the body version and the metric word on each prospect, the hours column goes; then `purpose` and the third body; then the fourth and fifth bodies and subjects 6 and 7). Deploy the frontend with it: the prospects page reads the body tallies from the summary. From then on the server composes every report email from the row (the pipeline writes none): a client report gets body 5, the fixes list (1, 2 and 4 are paused), an affiliate report gets body 3; subjects 3, 6 and 7 rotate (3 only with a paid search); the rows released before the deploy still carry and send the analyst's email. Release no report from `outbox.py` between pulling ftp_search and deploying this: the new outbox sends no `body`, which the old server refuses. See [`seo-prospect-outreach.md`](seo-prospect-outreach.md).

## Deploy the paused podcast pitches

Added 2026-10-30. Owner's step. `send_affiliate_outreach` now sends no podcast pitch by default (`--count` is 0); it still sends the queued prospect report emails every hour. Deploy Django, then check the hourly scheduled task on PythonAnywhere runs the command with no `--count`: one that passes `--count 3` keeps pitching. To resume the pitches later, put `--count 3` on the task. Queued podcast prospects are untouched meanwhile, so nothing is lost.

## SEO prospect outreach: deploy, then send yourself a test

Added 2026-10-28. Owner's step. Built: the automated prospect report email and the calls list at /dashboard/admin/prospects ([`seo-prospect-outreach.md`](seo-prospect-outreach.md)). On deploy:

- Run `migrate` for `seo` 0018, Django before the frontend. The hourly `send_affiliate_outreach` task now sends queued report emails too, so no new scheduled task.
- `private-media/seo-prospects/` holds the queued PDFs; it sits under the existing `private-media/`.
- Added 2026-10-29, same deploy, no migration: `POST /api/seo/messages/`, the note after a call sent from the terminal (`outbox.py send <slug>`). Until it is deployed the compose page is the way to resend a report.
- Before the first real one, send a test to yourself from `../ftp_search`, on a published prospect report not yet sent: `python _search/tools/prospecting/outbox.py add -p <slug> --to <your address>`, then `approve <slug>` and `release <slug>`. Read it in a mail client after the next hourly run. Its row on /dashboard/admin/prospects then holds that slug and address, so delete it in the Django admin before the real one is added.

## Affiliate share from 50% to 20%

Added 2026-10-28. Owner's decision, in conversation: 50% devalues the audit, and the trade associations ([`trade-associations.md`](trade-associations.md)) will be offered 20%. Change together: `affiliate_share_percent` at /dashboard/admin/settings/site (the default in code too), the "$220 to $560 an audit" copy in `frontend/src/lib/pages.ts` and the affiliate page, and the pitch emails in `_docs/affiliate-pitch/`. Decide whether affiliates already signed keep 50% for a fixed period, and put the date in the association agreement.

## Guides: the author's photo and bio

Added 2026-11-04. Owner's step. The guide layout's byline and author box show an "E" on a blue disc until there is a photo; send a square headshot and it replaces the disc in the registry's `components/guides/GuideAuthor.tsx` (freetheplatform, synced to every site with guides, so one photo serves Scooter Shop's and Bloomprint's guides too). The bio is in `frontend/src/lib/guideSite.ts` and is a draft ("writes freethedesk's SEO audits and builds its websites in Perth, including Scooter Shop's…"); replace it with your own two or three lines. There is no LinkedIn, so the box links nowhere.

## Business Profile: your photo and the holiday hours

Added 2026-11-04. Owner's step. The r6 rec "profile-sells-audit" is in (three audit services, the description's SEO sentence, an update linking /seo, three sample-report photos, online service hours removed). Two parts are yours: upload a photo of yourself to the profile (Photos, as nahte12321), and set Christmas and New Year hours before December. The update and the three photos were pending Google's review on 4 November.
