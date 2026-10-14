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

## Google Ads: rec 2 of search report r3, and the Analytics link

Added 2026-10-14. Owner's steps; the agent's browser changes to the live campaign were blocked. All in analytics@freethedesk.com.au, Ads account freethedesk 702-260-4011, campaign "Campaign #1" (Performance Max, A$5 a day):
- Locations: replace Australia (country) with "Perth, Western Australia, Australia (city)", reach 2.71 million. Under Location options choose "Presence: people in or regularly in your included locations".
- Campaign URL options: final URL suffix `utm_source=google&utm_medium=cpc&utm_campaign=seo-pmax`.
- Performance Max cannot be limited to search results. To stop the in-app and display traffic, either add account-level placement exclusions (Admin > Account settings > Content suitability > Excluded placements: the apps and sites in the campaign's placement report for 7 to 13 October), or pause it and run a Search campaign on the SEO keywords instead.
- Analytics > Admin > Product links > Google Ads links: a link to 702-260-4011 was set up and is waiting at "Review and submit"; press Submit. Then delete the link to 420-916-5972 (Ethan Betts, the Scooter Shop account), which was created by mistake on 14 October.
- After the link has synced (up to a day), import `generate_lead` as the Ads conversion: Goals > Conversions > New conversion > website data source "freethedesk 555139588" > category "Submit lead form" > event generate_lead. Set it as the campaign's goal in place of "Purchases".
- Complete advertiser verification before 2026-11-11, or Google pauses the ads.

## Search Console and directories

Added 2026-10-14. Owner's steps. The mistyped /sitemaps.xml submission was removed on 14 October.
- GoodFirms: "Post a project" (myaccount.goodfirms.co/users/projects/post) is the buyer side, for hiring an agency, so skip it. List the business instead with GoodFirms' "Get Listed" as a service provider: name freethedesk, phone 0423 853 830, Perth WA, https://www.freethedesk.com.au/, web development and SEO. Do the same on DesignRush, Oneflare and Bark (search report r3, card 4).
