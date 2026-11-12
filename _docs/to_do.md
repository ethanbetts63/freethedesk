# To do

Open tasks for this repository. Append any you find; delete one once you know it's done.

## Forms ledger: `npm run check` fails on `check:forms`

Added 2026-10-26, still failing 2026-11-11. `frontend/scripts/check-forms.mjs` names `app/seo/payment/complete/VerifyEmailForm.tsx` as in the ledger but rendering no form; remove the row or point it at the file that does. Run `node frontend/scripts/check-forms.mjs` and fix whatever else it names (on 2026-11-04 it also listed `components/layout/SessionLink.tsx` as an unlisted form).

## Pull the backend on PythonAnywhere (owner)

Added 2026-11-12. `cdf72bd` makes the prospects page's "Link opened" column sortable; the sort is the server's (`ordering=opens`), so until the next pull the column sorts by date added instead. The same pull drops the unused prospect summary endpoint (`7b9c02c`). No migration. Delete this once pulled and the column sorts by opens.
