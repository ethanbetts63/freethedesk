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
