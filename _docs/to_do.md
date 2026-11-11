# To do

Open tasks for this repository. Append any you find; delete one once you know it's done.

## Forms ledger: `npm run check` fails on `check:forms`

Added 2026-10-26, still failing 2026-11-11. `frontend/scripts/check-forms.mjs` names `app/seo/payment/complete/VerifyEmailForm.tsx` as in the ledger but rendering no form; remove the row or point it at the file that does. Run `node frontend/scripts/check-forms.mjs` and fix whatever else it names (on 2026-11-04 it also listed `components/layout/SessionLink.tsx` as an unlisted form).
