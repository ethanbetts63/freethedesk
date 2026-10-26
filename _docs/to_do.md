# To do

Open tasks for this repository. Append any you find; delete one once you know it's done.

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

- `migrate` for `affiliates` 0001, `core` 0029 (the two affiliate percentages; the enquiry type is gone) and `seo` 0015 (complimentary audits, the signup's discount code).
- `FTP_AGREEMENTS` names the Affiliate Program Terms, version 2026-10-25, so deploy Django and the frontend together.
- `DISCOUNTS_ENABLED` is on in settings; nothing else to set. Each affiliate's Stripe coupon is created the first time their code is used.
- Then open https://www.freethedesk.com.au/affiliates, sign up with a test address, verify it with the emailed code, and check the portal shows the code. Buy a test audit on /seo with that code (Stripe test mode is not available on production, so use a real card and refund it) and check the commission appears on /dashboard/admin/affiliates.

Paying out is not built. Commissions sit as "Owed" on the affiliate's staff page; settle the first ones by bank transfer and note it there. The build is Stripe Connect Express per affiliate and a transfer per commission, as Bloomprint's `partners` app does; it needs Connect enabled on the freethedesk Stripe account first.

## Podcast outreach: owner's steps before the cron is enabled

Added 2026-10-25. The plan is `_docs/affiliate-outreach.md`; nothing is built yet. When it is:

- Set `INTERNAL_API_KEY` (32 or more random characters) in the PythonAnywhere environment and the local `.env`, and `API_SERVER_URL=https://www.freethedesk.com.au` locally. The upload command posts prospects with it.
- Add two hourly PythonAnywhere scheduled tasks: `python manage.py send_due_messages` (not yet scheduled for freethedesk as far as the docs record) and `python manage.py send_podcast_pitches --count 5`.
- Upload one test prospect addressed to yourself, read all three versions in a mail client, then enable the cron.


## Forms ledger after the affiliate program commit

Added 2026-10-26. `npm run check` fails on `check:forms` since 91e5089: `app/affiliate-portal/account/page.tsx` and `components/auth/VerifyEmailCodeForm.tsx` render a form and are not in `frontend/scripts/check-forms.mjs`, and `app/seo/payment/complete/VerifyEmailForm.tsx` is in the ledger but no longer renders one. Add the two rows with their track and repoint or drop the third.

## The schema check in conftest reads the dev database when a run has no database tests

Added 2026-10-26. `_complete_test_schema` depends on `django_db_setup`, but pytest-django only creates the test database for runs that contain a `django_db` test. A run of pure unit tests (for example `outreach/tests/util_tests/test_scraper.py` alone) therefore introspects the development database instead, and exits with "The test database is missing 1 table(s)" whenever a new app's migration has not been applied there yet. `py manage.py migrate` clears it; the fixture should skip its check when no database was set up.

## Podcast outreach: try one `--dev` upload

Added 2026-10-26. The scraper has run for real (terms aa and ab, five shows queued in `outreach/data/podcasts.jsonl`). The upload has only been exercised through the test client: `upload_prospects --dev` needs `INTERNAL_API_KEY` in `.env` and the Django server on :8010 restarted to read it, then `py manage.py upload_prospects --dev` should answer five created and the five appear at /dashboard/admin/outreach.

