# To do

Open tasks for this repository. Append any you find; delete one once you know it's done.

## Deploy invoicing and package checkout

Added 2026-10-09. Owner's step. Everything up to f3d3853 was pushed on 2026-10-08: invoicing, the package order checkout and the Web Development Terms. On deploy:
- pip installs freetheplatform v0.35.0.
- Run `migrate` for `ftp_invoicing` 0001–0003 and `core` 0017–0023, Django before the frontend.
- Confirm `FTP_PROXY_SECRET` is set in production on both Django and the frontend.
- Order emails and SMS need `NOTIFICATIONS_ENABLED` plus Mailgun and Twilio configured.
- Set the legal entity at /dashboard/admin/settings/invoicing. Bank details are already model defaults (core 0021).

## Privacy policy: the subprocessor promise

Added 2026-10-14. Owner's decision. Section 7 of `frontend/content/legal/privacy-policy.md` still says "Before production launch we will publish a current subprocessor list or update this section". The site is live, so either publish the list (Stripe, hosting, Mailgun, Twilio and the countries they process in) or reword the sentence. Bump the "Last updated" line and `/legal/privacy` in `frontend/src/lib/pages.ts` with it.

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
- Complete advertiser verification before 2026-11-11, or Google pauses the ads (the "Get started" banner in Ads).
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

## Push and check search report r4 recs 2, 12 and 13

Added 2026-10-22. Owner's step. Commits 7909610, 2076f6e and e6e4418 are approved to push but not pushed: `git push origin e6e4418:main`, which leaves 15459f0 (the contact page) local. Analytics event retention is 14 months since 21 October. Once deployed, send one test enquiry from https://www.freethedesk.com.au/contact. Check that the staff email arrives, that `generate_lead` shows in Analytics (Reports > Realtime), and that within a day it appears under the "freethedesk (web) generate_lead" conversion in Ads.

## Deploy the contact page changes, then have Google read it

Added 2026-10-19. Owner's step. Search report r4, rec 9 (contact-page-call-and-content). /contact now has an "Or call 0423 853 830" button under its opening line and an "SEO audit" choice in "What do you need?", which sends no budget, and the phone field is labelled optional. On the Django deploy, run `migrate` for `core` 0025 (the enquiry "SEO audit" type). Deploy Django before the frontend: the old API refuses an SEO enquiry. Once it is live, in Search Console (analytics@freethedesk.com.au) run URL inspection on https://www.freethedesk.com.au/contact and click "Request indexing", once. Google lists the page as found but has never read it.

## The read API test fails when the whole suite runs

Added 2026-10-22. `core/tests/test_read_api.py::test_every_dealers_sales_are_read_and_their_credentials_are_not` passes on its own and fails with `KeyError: 'models'` when run after `sales seo payments core identity dealers`: `/api/read/models/` answers something other than the model list, most likely a throttle or cache left over from an earlier test. It fails the same way without the 2026-10-22 shared-code change, so it predates it.
