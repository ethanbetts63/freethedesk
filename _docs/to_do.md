# To do

Open tasks for this repository. Append any you find; delete one once you know it's done.

## Forms ledger: `npm run check` fails on `check:forms`

Added 2026-10-26, still failing 2026-11-11. `frontend/scripts/check-forms.mjs` names `app/seo/payment/complete/VerifyEmailForm.tsx` as in the ledger but rendering no form; remove the row or point it at the file that does. Run `node frontend/scripts/check-forms.mjs` and fix whatever else it names (on 2026-11-04 it also listed `components/layout/SessionLink.tsx` as an unlisted form).

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
2. **Google Business Profile optimisation, fixed one-off price.** Built 2026-11-15 at `/google-business-profile-optimisation`, $650 paid once. The way in is now the call-back form at its foot, not an enquiry. What is left is in the three GBP sections below; drop this line once they are done.
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

## Business Profile optimisation: decide the guarantee and how it is paid (owner)

Added 2026-11-15. The page says nothing about a refund, because the SEO Audit Terms' guarantee covers audits only and no terms cover this job. Decide whether it carries one (for example, a refund if the work isn't done within a set time, never one tied to rankings), and which terms it is sold under: a section in the Web Development Terms, or terms of its own. Also decide whether the $650 is invoiced before or after the work, and say so on the call.

## Business Profile optimisation: buy online

Added 2026-11-15. Once the terms exist, sell it the way the website packages are sold: a `PackageOrder.Package` code, `quote_package`, `PackageOrderDialog` and `/order/payment`, with the price moved from the `GBP_OPTIMISATION_PRICE` constant (`frontend/src/lib/servicePricing.ts`) to a `SiteSettings` field (model, migration, serializer, Django admin and the dashboard's site settings page). Then the card on the page opens the order dialog instead of scrolling to the call-back form. Until it moves, three places state $650 by hand: the constant, the page's `description` in `frontend/src/lib/pages.ts` and `frontend/content/articles/business-not-showing-up-on-google.md`.

## Website sample emails: three held for your word (owner)

Added 2026-11-19 ([`sample-outreach.md`](sample-outreach.md)). Deployed (seo 0035 migrated, app reloaded). Emby
Cabinets (Scott), Sankey Tax and Accounting (Karen) and JSR Massage (Greg, named "Owner" on the site's therapists
page, not in facts.md: check the name) are held; each is emailed only after you approve it in chat
(`../ftp_search/_samples/tools/outreach/outreach.py approve <project>`). BennoAir is not held: no owner or contact
name anywhere the pipeline holds; hold it with `--name` and `--source` once one is found. The read API's account
cannot see `seo.SeoSampleReport` (nor `seo.SeoProspect`) until `python manage.py readapi grant-view --username
<the read account>` is run on PythonAnywhere. Delete this once the three are decided.
