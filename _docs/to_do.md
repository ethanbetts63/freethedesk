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

## Google Ads: rest of rec 2 from search report r3

Added 2026-10-14. Owner's steps. Done on 14 October: Analytics links to Ads account freethedesk 702-260-4011 (the mistaken link to 420-916-5972 is deleted), and Campaign #1 targets Perth, Western Australia (city) instead of all of Australia. Still to do, in analytics@freethedesk.com.au, account 702-260-4011, Campaign #1 (Performance Max, A$5 a day):
- Campaign settings > Locations > Location options: check it says "Presence: people in or regularly in your included locations", not "Presence or interest".
- Campaign settings > Campaign URL options: final URL suffix `utm_source=google&utm_medium=cpc&utm_campaign=seo-pmax`.
- Performance Max cannot be limited to search results. To stop the in-app and display traffic, either add account-level placement exclusions (Admin > Account settings > Content suitability > Excluded placements: the apps and sites in the campaign's placement report for 7 to 13 October), or pause it and run a Search campaign on the SEO keywords instead.
- From 15 October, once the link has synced, import `generate_lead` as the Ads conversion: Goals > Conversions > New conversion > website data source "freethedesk 555139588" > category "Submit lead form" > event generate_lead. Set it as the campaign's goal in place of "Purchases".
- Complete advertiser verification before 2026-11-11, or Google pauses the ads.

## Search Console and directories

Added 2026-10-14. Owner's steps. The mistyped /sitemaps.xml submission was removed on 14 October.
- GoodFirms: "Post a project" (myaccount.goodfirms.co/users/projects/post) is the buyer side, for hiring an agency, so skip it. List the business instead with GoodFirms' "Get Listed" as a service provider: name freethedesk, phone 0423 853 830, Perth WA, https://www.freethedesk.com.au/, web development and SEO. Do the same on DesignRush, Oneflare and Bark (search report r3, card 4).
- Claim the business on Bing Places (bingplaces.com, which can import the Google Business Profile) and Apple Business Connect (businessconnect.apple.com), with exactly the Business Profile's name, phone and service area, so the three map listings agree with the site (search report r3, earn-outside-links).

## Traffic ideas parked for later (from the 14 October traffic review)

- Four more WA dealer guides from `_docs/licensing/research/` and `wa_dealer_forms/`, one a week, each ending on /licensing or /dealers. Topics: whether a WA dealer can sell without the buyer coming in (which forms need DoT's consent to e-signing, Electronic Transactions Act 2011 s9–10); the MR9B change of ownership step by step (7-day deadline, $100 infringement, consignment, how it differs from the MR9); statutory warranty Forms 5A, 5 and 6 for cars and motorcycles; the Bulk Licensing Scheme. Check each figure against the live DoT or Consumer Protection page on the day of writing, and say "not legal advice".
- MTA WA (Motor Trade Association of WA): ask about its business partner programme, an article for members, and a sundowner slot for online licensing. Separately, email WA motorcycle dealers one at a time.
- Guide: "How to redesign a website without losing your Google rankings". Cover the redirect map, keeping titles that already rank, resubmitting the sitemap and watching Search Console for six weeks. Use the site's own case: /website-development-perth drew "perth website development" showings in early September, its redirect went missing from 9 September to 2 October, and the showings haven't come back. End on the website redesign page and /seo.
