# To do

Open tasks for this repository. Append any you find; delete one once you know it's done.

## Deploy the link-only report email and the second follow-up

Added 2026-11-11. Owner's step. Deploy Django (no migration, no frontend change). After it: no prospect email carries the pdf; the client body is the owner's words of 2026-11-11 (every title, the report's link); the follow-up opens "Just following up on my previous email"; `outbox.py follow-up --again` queues a second follow-up; and `outbox.py html` brings each report's titles and count with its page. Then, from ftp_search: `outbox.py html` for the 24 uncalled sent reports and the 8 held clients (their titles predate the cut), queue the 24 with `follow-up` (`--again` for the 30 October ones; West Coast Trades already had it by hand at 10:27), and approve the 8 held clients again. Until the deploy, the server would send any approved client email with the old body and the pdf, so they stay held.

## Name the audit tier the 10-page website includes

Added 2026-11-04. Owner's decision. The Web Development Terms of 2026-11-04 are live. The 10-page website's card says "An SEO audit at three months" and terms 5.4 names no tier, and nothing in the code says Essentials, Plus or Complete. Once decided, name it on the card (`includes` of `website_large` in `frontend/src/lib/servicePricing.ts`) and in 5.4, and bump the terms' version again (search report r6, rec 7, step 5).

## Invoicing: the legal entity and the notification settings

Added 2026-10-09. Owner's step. Invoicing and the package checkout are deployed. Left: set the legal entity at /dashboard/admin/settings/invoicing (bank details are model defaults, core 0021), and confirm `NOTIFICATIONS_ENABLED` plus Mailgun and Twilio are configured in production, which the order emails and SMS need.

## After the 24 October pricing: the Business Profile's website prices, and old SEO subscriptions

Added 2026-10-24. Owner's steps. The one-page website package ($750) and the three SEO audit tiers are live. Left: change the Business Profile's Website design, Website development and Website redesign services from "From $3,000" to "From $750" (Edit services, in Google Search signed in as nahte12321). And look in Stripe for any active SEO subscription: they keep renewing under the old terms and the webhook still handles them. If there are none, say so, and the subscription callbacks in `payments/fulfilment.py` can be deleted.

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

## Test an enquiry end to end, then have Google read the contact page

Added 2026-10-22 and 2026-10-19, merged 2026-11-11. Owner's steps. The contact page changes (the call button, the "SEO audit" choice, the optional phone) and `core` 0025 are live. Left: send one test enquiry from https://www.freethedesk.com.au/contact and check that the staff email arrives, that `generate_lead` shows in Analytics (Reports > Realtime), and that within a day it appears under the "freethedesk (web) generate_lead" conversion in Ads. Then in Search Console (analytics@freethedesk.com.au) run URL inspection on https://www.freethedesk.com.au/contact and click "Request indexing", once: Google lists the page as found but has never read it (search report r4, rec 9).

## The read API test fails when the whole suite runs

Added 2026-10-22. `core/tests/test_read_api.py::test_every_dealers_sales_are_read_and_their_credentials_are_not` passes on its own and fails with `KeyError: 'models'` when run after `sales seo payments core identity dealers`: `/api/read/models/` answers something other than the model list, most likely a throttle or cache left over from an earlier test. It fails the same way without the 2026-10-22 shared-code change, so it predates it.

## Affiliate program: test a purchase, then pay the first commission by hand

Added 2026-10-24, rewritten 2026-10-25, trimmed 2026-11-11. Owner's steps. The program is deployed and documented in `_docs/affiliate-program.md`: sign-up opens the account, the code and the free audit; a code at the SEO checkout earns a commission when the audit is paid. Left: open https://www.freethedesk.com.au/affiliates, sign up with a test address, verify it with the emailed code, and check the portal shows the code. Buy a test audit on /seo with that code (Stripe test mode is not available on production, so use a real card and refund it) and check the commission appears on /dashboard/admin/affiliates.

Paying out is not built. Commissions sit as "Owed" on the affiliate's staff page; settle the first ones by bank transfer and note it there. The build is Stripe Connect Express per affiliate and a transfer per commission, as Bloomprint's `partners` app does; it needs Connect enabled on the freethedesk Stripe account first.

## Podcast outreach: owner's steps before the pitches resume

Added 2026-10-25, updated 2026-10-26 and 2026-11-11. The pitches are paused: `send_affiliate_outreach` sends none unless the hourly task on PythonAnywhere passes `--count`, and only high-fit prospects are ever pitched. Check that task runs the command with no `--count`. Before resuming (with `--count 3` on the task): upload one test prospect addressed to yourself and read all three versions in a mail client; the report cover image and `/affiliates` are live. The queue is empty (2026-10-30): 69 high-fit prospects were uploaded that day and 212 medium and low entries archived unsent in `affiliates/data/archive/`. The next run of `affiliates/outreach_instructions.md` scrapes by `--terms`. Nothing cold goes from the main domain again: the outreach subdomain below comes first.

## Forms ledger: `npm run check` fails on `check:forms`

Added 2026-10-26, still failing 2026-11-11. `frontend/scripts/check-forms.mjs` names `app/seo/payment/complete/VerifyEmailForm.tsx` as in the ledger but rendering no form; remove the row or point it at the file that does. Run `node frontend/scripts/check-forms.mjs` and fix whatever else it names (on 2026-11-04 it also listed `components/layout/SessionLink.tsx` as an unlisted form).

## The schema check in conftest reads the dev database when a run has no database tests

Added 2026-10-26. `_complete_test_schema` depends on `django_db_setup`, but pytest-django only creates the test database for runs that contain a `django_db` test. A run of pure unit tests (for example `affiliates/tests/util_tests/test_scraper.py` alone) therefore introspects the development database instead, and exits with "The test database is missing 1 table(s)" whenever a new app's migration has not been applied there yet. `py manage.py migrate` clears it; the fixture should skip its check when no database was set up.

## Podcast outreach: the outreach subdomain on a second Mailgun account

Added 2026-10-26; rewritten 2026-10-30 after the owner chose the way: **a second, free Mailgun account for a subdomain, `outreach.freethedesk.com.au`** (option B; the Foundation plan at USD 35 a month was the alternative). Why: 3 spam complaints in 108 pitches (2.8%, against Gmail's 0.3% line) went against `freethedesk.com.au`, the domain the sign-in codes, receipts and prospect report emails use. The pitches stay paused until this is done; nothing cold goes from the main domain again. In Cloudflare, `mail.freethedesk.com.au` already has its Mailgun MX records and `_dmarc.freethedesk.com.au` reports to hello@; SPF and DKIM for the current domain are done. This is also the dedicated sending address the podcast pitch templates (`core/templates/emails/podcast_pitch/`, `_docs/affiliate-pitch/README.md`) were waiting on.

Build first (agent, freetheplatform): the Mailgun webhook (`api/views/webhooks.py`) verifies one signing key, `MAILGUN.WEBHOOK_SIGNING_KEY`. A second account has its own key, so its delivered, failed and complained events would be rejected and complaints on the outreach domain would go unrecorded. Let a named sender carry `WEBHOOK_SIGNING_KEY` and have the webhook accept any configured key; tests, release note, bump. Then in freethedesk read it from `OUTREACH_MAILGUN_WEBHOOK_SIGNING_KEY`.

Owner's steps, after that is deployed:

1. Open a second Mailgun account (Free plan: 100 a day, one custom domain) under a different login, for example outreach@ or ethan@. Check Mailgun's terms allow two accounts for one business; if not, upgrade the main account to Foundation instead and add the domain there (the steps are the same from 2).
2. In it add `outreach.freethedesk.com.au` (Send, Domains, Add new domain, US region, 2048-bit DKIM, no Red Sift DMARC), then in Cloudflare add the SPF TXT, the `pic._domainkey` DKIM TXT and the two MX records it lists, all DNS only, plus `_dmarc.outreach.freethedesk.com.au` `v=DMARC1; p=none; rua=mailto:hello@freethedesk.com.au`.
3. Make a sending key for the domain and a delivery webhook (delivered, permanent failure, complained, unsubscribed) pointed at `https://www.freethedesk.com.au/api/webhooks/messaging/mailgun/`; copy that account's webhook signing key.
4. Set on PythonAnywhere: `OUTREACH_FROM_EMAIL="Ethan Betts <ethan@outreach.freethedesk.com.au>"`, `OUTREACH_MAILGUN_DOMAIN=outreach.freethedesk.com.au`, `OUTREACH_MAILGUN_API_KEY=<the sending key>`, `OUTREACH_MAILGUN_WEBHOOK_SIGNING_KEY=<that key>`. Reload. Replies to ethan@outreach... need a route or forward in Mailgun (Receiving, Routes: match recipient, forward to hello@), or the host's reply is lost.
5. Add `outreach.freethedesk.com.au` to Google Postmaster Tools.
6. Warm up: `--count 1` on the hourly task for the first two weeks (about 10 a day), then `--count 3`. Stop if Postmaster shows complaints above 0.3%.

## Affiliate share from 50% to 20%

Added 2026-10-28. Owner's decision, in conversation: 50% devalues the audit, and the trade associations ([`trade-associations.md`](trade-associations.md)) will be offered 20%. Change together: `affiliate_share_percent` at /dashboard/admin/settings/site (the default in code too), the "$220 to $560 an audit" copy in `frontend/src/lib/pages.ts` and the affiliate page, and the pitch emails in `_docs/affiliate-pitch/`. Decide whether affiliates already signed keep 50% for a fixed period, and put the date in the association agreement.

## Guides: the author's photo and bio

Added 2026-11-04. Owner's step. The guide layout's byline and author box show an "E" on a blue disc until there is a photo; send a square headshot and it replaces the disc in the registry's `components/guides/GuideAuthor.tsx` (freetheplatform, synced to every site with guides, so one photo serves Scooter Shop's and Bloomprint's guides too). The bio is in `frontend/src/lib/guideSite.ts` and is a draft ("writes freethedesk's SEO audits and builds its websites in Perth, including Scooter Shop's…"); replace it with your own two or three lines. There is no LinkedIn, so the box links nowhere.

## Business Profile: your photo and the holiday hours

Added 2026-11-04. Owner's step. The r6 rec "profile-sells-audit" is in (three audit services, the description's SEO sentence, an update linking /seo, three sample-report photos, online service hours removed). Two parts are yours: upload a photo of yourself to the profile (Photos, as nahte12321), and set Christmas and New Year hours before December. The update and the three photos were pending Google's review on 4 November.
