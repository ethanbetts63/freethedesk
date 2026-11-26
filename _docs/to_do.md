# To do

Open tasks for this repository. Append any you find; delete one once you know it's done.

## Forms ledger: `npm run check` fails on `check:forms`

Added 2026-10-26, still failing 2026-11-11. `frontend/scripts/check-forms.mjs` names `app/seo/payment/complete/VerifyEmailForm.tsx` as in the ledger but rendering no form; remove the row or point it at the file that does. Run `node frontend/scripts/check-forms.mjs` and fix whatever else it names (on 2026-11-04 it also listed `components/layout/SessionLink.tsx` as an unlisted form).

Still failing 2026-11-26, now also naming `app/affiliate-portal/account/page.tsx` and `components/auth/VerifyEmailCodeForm.tsx` as unlisted forms. Because `check` stops at the first failure, two later checks also fail unseen: `check:tokens` (`src/components/dashboard/DateInput.tsx` uses `w-xl`, not a role-named width) and `check:report-styles` (`src/app/seo/sample-report/_styles/report.generated.css` is stale; run `npm run sync:report-styles`).

## Pull the backend on PythonAnywhere (owner)

Added 2026-11-12. `cdf72bd` makes the prospects page's "Link opened" column sortable; the sort is the server's (`ordering=opens`), so until the next pull the column sorts by date added instead. The same pull drops the unused prospect summary endpoint (`7b9c02c`) and stops counting the owner's own visits to a report link while signed in to the dashboard. No migration. Delete this once pulled and the column sorts by opens.

## Deploy the click tracking on prospect reports (owner)

Added 2026-11-14. Links from a prospect report on to `/seo` now go through `/reports/<key>/seo`, which logs the click and sends the reader on with campaign tags. Pull, run `migrate` (0032 adds the `seo` kind to `SeoProspectOpen`; no data change), reload, and rebuild the frontend for the `/reports/:key/seo` rewrite. Until the frontend is rebuilt, a served report's links to `/seo` 404, so deploy both together. Delete this once deployed and a click from a report lands on `/seo` with `utm_source=prospect-report`.

## A way to suppress a prospect's "no thanks" reply

Added 2026-11-14. The prospect page's Unsubscribe button went with its call, reply and hold-back boxes (owner's word). Bodies 1, 3 and 5 and every follow-up promise "Reply 'no thanks' and I won't email again", and the Spam Act needs that honoured, but nothing now calls `POST /api/admin/seo/prospects/<pk>/unsubscribe/` (staff session) or sets `reply`. Pick one: a terminal command beside `outbox.py` on the internal key, or the button back. Until then, suppress such a reply in the Django admin. Once decided, delete the endpoints left unused (the detail view's PATCH and the unsubscribe view) or wire them.

## Deploy the prospect reports without a PDF (owner)

Added 2026-11-12. `09c23b9` takes the PDF out of prospect reports: the upload takes the page alone and `report_pdf` goes. Pull, run `migrate` (0031 drops the column), reload, and rebuild the frontend so `/reports/<key>/pdf` is sent on to the page. Until then `outbox.py add` fails, because the old server still requires a PDF. The old PDFs stay under `PRIVATE_MEDIA_ROOT/seo-prospects/*.pdf`; delete them by hand when you like. Delete this once deployed and an `add` goes through.

## Deploy the growth guarantee (owner)

Added 2026-11-14. The SEO Audit Terms gain section 6, a full refund if Search Console clicks don't grow in the 90 days after three ranking recommendations are made; the terms' version is now `2026-11-14`, and `/seo`, the report email (body 5), the ask under every prospect report and the cost guide all say it. Pull, reload, and rebuild the frontend; no migration. The backend and frontend must go together, or checkout records the new terms while the site still shows the old. Delete this once deployed and `/legal/seo-audit-terms` shows section 6.

## Mark which recommendations are ranking recommendations

Added 2026-11-14. The growth guarantee counts only recommendations meant to improve ranking or clicks in search, not fixes to details, page faults or conversion (terms 6.3), and promises to say which are which on request. Nothing in a report marks them yet. Have the full report label each recommendation (in `../ftp_search`), so a customer can see which three count without asking.

## New offers to match the Perth SEO competition (owner's threads, 2026-11-15)

Started from a comparison of the top Perth SEO firms on 2026-11-15. All of them sell monthly retainers with a free call or free audit as the way in. Keep every thread here until it's shipped or the owner drops it.

1. **Call-back form (the strategy piece).** Built 2026-11-15. The owner tried a timed booking the same day and dropped it. It asks for an email or phone number, plus an optional website and notes, and the owner gets back to them as soon as he can. Each request emails and texts the owner; listed under Calls in the dashboard. It replaced the project enquiry form on /contact, the home page, dealers, the portfolio case studies and the GBP page; /seo has a one-line link to it under the audits. Still to do:
   - put the call-back link in the prospect report emails and under each report
   - rewrite the /seo FAQ "Is a free SEO audit worth anything?" if it reads against the offer to look at a site for free
   - the form's copy is about SEO; the owner is to go over how website and automation work is enquired about (the dealers and portfolio pages show it too)
   - measure requests, how many are reached and how many buy, from the Calls page and its statuses
2. **Google Business Profile optimisation, fixed one-off price.** Built 2026-11-15 at `/google-business-profile-optimisation`, paid once. $650 at launch, $150 from 2026-11-26, set in the dashboard's site settings. The way in is now the call-back form at its foot, not an enquiry. What is left is in the three GBP sections below; drop this line once they are done.
3. **Done-for-you without a retainer.** Fixed bundles such as "Essentials + we make the top 5 fixes" at one price.
4. **Optional monthly tracking.** Rank tracking and a short monthly report, cancel anytime, priced well below rival retainers.
5. **Google Ads optimisation (done-for-you).** Added by the owner. The Complete audit already reads the Ads account; this would do the work. It needs the free call to scope each account. Research rivals' Ads management prices the way the GBP price was researched.
6. **Google rating on the site.** Show "5.0 on Google" (rating only, no review count) in the header and hero, linking to the Google reviews. otterair.com.au is the model. Freethedesk's rating was 5.0 from 3 reviews on 2026-11-15. The badge must stay true, so re-check the rating whenever a review arrives. Don't add AggregateRating markup for our own reviews: Google ignores self-serving review markup for a business.

7. **Industry SEO pages.** `/seo/tradies`, `/seo/builders`, `/seo/health-clinics` and `/seo/professional-services`, remade 2026-11-16 as copies of /seo: the same components in the same order (`frontend/src/app/seo/_components/SeoLandingPage.tsx`), with only the words changed for the trade. Each page's words are in `frontend/src/app/seo/_lib/industries/`; /seo's are in `_lib/copy.ts`. A change to /seo's structure changes all five. Check each page's Search Console impressions about 8 weeks after deploy, before adding more. `/seo/dealerships` was added 2026-11-16; it has no picture for its related-pages card yet (`/images/pages/seo-dealerships.webp`, made as the other four were). Half the case-study sections show Bloomprint since 2026-11-16 (`BLOOMPRINT_GROWTH` in `frontend/src/lib/caseStudies.ts`: +150%, the month to 15 November against the month before). Its counts are small, so re-read Search Console before the figure is used again. The "68% in three months" on `/portfolio/bloomprint` couldn't be reproduced from the stored series (it starts 2 August 2026); confirm or replace it.
8. **AI SEO and website migration SEO pages.** Owner's choice 2026-11-16, two of Net Search's ten SEO pages: the others are covered already, or are services freethedesk doesn't sell. What ranks in Perth, Melbourne and Sydney, and where freethedesk can differ, is in `_docs/service-page-research.md`.
   - `/website-migration-seo-perth` built 2026-11-16 on the redesign page's sections. It sells the SEO audits (before a move, and after a drop) and points to redesigns for a move we build. No rival publishes a migration price: decide whether a move with the client's own developer gets a fixed price of its own (redirect map, launch checks, 90 days of Search Console checks), and swap it in as the page's package if so.
   - `/ai-seo-perth` built 2026-11-16 the same way, with the free AI readiness check above the hero. It sells the audits and says we write an llms.txt file "at a fixed price alongside the audit's other fixes"; set that price, or make llms.txt a line of its own, when you decide how it's sold.
   - Check both pages' Search Console impressions about 8 weeks after deploy.

Smaller ideas, not started:

- audits that web designers can resell (wholesale)
- a paid walkthrough call

## Deploy the call-back form and the GBP page (owner)

Added 2026-11-15. Pull, then run `migrate`: core 0030 adds the `gbp` enquiry choice, and seo 0033 adds `SeoCallRequest`. Reload, then rebuild the frontend. The backend goes first: the form posts to `/api/seo/calls/`. The old `/api/project-enquiries/` endpoint is gone, so the old frontend's enquiry form fails until the rebuild. Deploy both together. Check that `ADMIN_NUMBER` is set on the server, because each request texts it. Delete this once deployed, a test request from /contact has emailed and texted you, and you've closed it on the Calls page.

## Deploy the Business Profile price setting (owner)

Added 2026-11-26. Pull on PythonAnywhere, run `migrate` (core 0031 adds `gbp_optimisation_price`, $150) and reload, then tell Claude to push the held frontend commit (the page rebuild). Backend first: every push to main deploys the frontend to Vercel at once, and `/seo`, the five industry SEO pages and the Business Profile page refuse to render until the API returns the field. The same reload also brings in the two sample-email wording commits (2026-11-23 and 24). Delete this once the page shows $150 and the dashboard's site settings has a Business Profile optimisation card.

## Business Profile optimisation: decide the guarantee and how it is paid (owner)

Added 2026-11-15. The page says nothing about a refund, because the SEO Audit Terms' guarantee covers audits only and no terms cover this job. Decide whether it carries one (for example, a refund if the work isn't done within a set time, never one tied to rankings), and which terms it is sold under: a section in the Web Development Terms, or terms of its own. Also decide whether the price is invoiced before or after the work, and say so on the call.

## Business Profile optimisation: buy online

Added 2026-11-15. Once the terms exist, sell it the way the website packages are sold: a `PackageOrder.Package` code, `quote_package`, `PackageOrderDialog` and `/order/payment`, priced from `SiteSettings.gbp_optimisation_price` (the admin's, since 2026-11-26). Then the card on the page opens the order dialog instead of scrolling to the call-back form.

## Website sample emails: three held for your word (owner)

Added 2026-11-19 ([`sample-outreach.md`](sample-outreach.md)). Deployed (seo 0035 migrated, app reloaded). Emby
Cabinets (Scott), Sankey Tax and Accounting (Karen) and JSR Massage (Greg, named "Owner" on the site's therapists
page, not in facts.md: check the name) are held; each is emailed only after you approve it in chat
(`../ftp_search/_samples/tools/outreach/outreach.py approve <project>`). BennoAir is not held: no owner or contact
name anywhere the pipeline holds; hold it with `--name` and `--source` once one is found. The read API's account
cannot see `seo.SeoSampleReport` (nor `seo.SeoProspect`) until `python manage.py readapi grant-view --username
<the read account>` is run on PythonAnywhere. Delete this once the three are decided.

## Website pages: the three packages (owner)

Added 2026-11-21, updated 2026-11-22.

Since 2026-11-22 a website is sold as three packages (Basic $1,500, Growth $3,000, Complete $4,500) by what the
site does, each card leading to the call-back form, not a checkout: on `/website-development`,
`/web-design-subiaco` and `/wordpress-web-design-perth`, which `/website-redesign-perth` now redirects to. The
homepage, the dealer and case study pages, the guide boxes and the two cost guides quote the same figures. Left
to do:

- Bring `frontend/content/legal/web-development-terms.md` into line: sections 2 and 4 describe per-page packages
  bought online, and no page sells those now.
- Move the three prices to `SiteSettings`. They are typed as `WEBSITE_PACKAGE_PRICES` in
  `frontend/src/lib/servicePricing.ts`.
- Decide what becomes of the per-page website packages nothing sells: the backend's `PackageOrderSerializer`
  still takes an order for one, the admin's site settings still hold their page counts and prices, and
  `purchasePackages` keeps them so the payment page can show an order already placed. The web application
  package went with them; `/automation` still sells discovery.
- After the deploy, ask Search Console to index `/wordpress-web-design-perth`, and watch the old address drop
  out. Remove the redirect in `next.config.ts` only once Search Console no longer has it.
- Google Ads (702-260-4011) sells websites since 2026-11-22: the Websites ad group is on and the SEO one
  paused. The ad says "Perth Websites From $1,500" and "Three fixed-price packages from $1,500", so change
  it whenever the Basic price changes. Perth web design clicks cost A$14 to A$32 at the top of the page
  against a A$10 a day budget: read the search terms after the first week and decide whether to raise the
  budget or add a WordPress ad group for `/wordpress-web-design-perth`, whose searches had no bids on them.
- `/web-design-subiaco` took the website page's words with its own heading, opening line and two local
  questions, unread by the owner before it went out. Read it.

## Three website guides, unread before they went out (owner)

Added 2026-11-22. `/small-business-seo-perth`, `/how-to-choose-a-web-designer-perth` and
`/website-builder-vs-web-designer-perth` were written from published sources and fact-checked against every
cited page, then published on the owner's word without a read. Read them. Two things date:

- The builder guide quotes Wix, Squarespace and Shopify prices as their Australian pricing pages showed them on
  2026-11-22 (Squarespace's cards also carried a "50% off" badge with no terms, left out), HTTP Archive's
  October 2026 Core Web Vitals pass rates and W3Techs' WordPress share. Reread them when the guide is next
  touched.
- The web designer guide states auDA's licensing rules (approved 2026-06-22) and the ACCC's pages on consumer
  guarantees and unfair contract terms as read on 2026-11-22.

Delete this once read.

## Mail moved to Google Workspace: test it, then point the sample emails at it (owner)

Added 2026-11-23. `freethedesk.com.au` mail now arrives in a Google Workspace mailbox, `ethan@freethedesk.com.au`
(Business Starter, 14-day trial from 2026-11-22), in place of Cloudflare Email Routing, which is switched off and
its four forwarding rules deleted. `hello@` and `admin@` are aliases on that user; a Gmail routing rule
("Catch-all: unknown addresses to ethan@") delivers every other address, `analytics@` included, to the same
inbox. DNS: MX `smtp.google.com` (priority 1), SPF `include:_spf.google.com`, DKIM at `google._domainkey`.
Mailgun on `mail.freethedesk.com.au` is unchanged and still sends receipts, sign-in codes and the outreach emails.

- Send one email from a personal account to `ethan@`, `hello@`, `admin@` and `analytics@` and check all four
  arrive. `analytics@` is the one to watch: it is a personal Google account's address and must never be created
  as a Workspace user or alias, and its sign-in codes and Ads notices now arrive through the catch-all.
- Send the same sample email to a Gmail and an Outlook inbox that have never had mail from freethedesk, once
  through the pipeline (Mailgun) and once by hand from `ethan@`, and compare where each lands.
- If the mailbox lands in the inbox, change the sample emails to send through it instead of Mailgun (the approve
  step and message log stay).
- Choose the plan before the trial ends: the pricing page defaulted to the yearly commitment (A$9.90 a user a
  month); the flexible plan is A$11.80.
- Google's daily DMARC reports to `hello@` now land in the inbox; filter them or point `rua` at another address.

## Two core tests fail locally, not from the open log (found 2026-11-23)

- `core/tests/test_serializer_bounds.py::test_no_writable_string_field_is_unbounded`: five serializer fields with
  no ceiling (`SeoMessageSendSerializer.to`, `SeoProspectUploadSerializer.email`, `SampleHoldSerializer.project` and
  `.email`, `SampleUploadSerializer.project`).
- `core/tests/view_tests/test_package_order_view.py::test_a_website_order_records_the_admin_price_and_half_due_now`:
  expects the staff alert at `staff@example.com` and gets the address in the local `.env`.
