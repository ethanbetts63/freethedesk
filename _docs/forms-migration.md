# Forms migration

**Type:** what is outstanding against
[forms-standard.md](../../freetheplatform/_docs/forms-standard.md), and why.
Delete this file when the table below is empty.

This file is only ever a list of what is _not_ done. An earlier version carried
the completed rows too, which is what made it look finished when it was not: it
was deleted on 2026-09-16 in `8ea99bf` while `app/login/page.tsx` still read
"Deferred, not done", against its own instruction to delete it once every row
was done. Two days later the forgot/change-password work added three more
hand-rolled forms, and nothing was left to notice.

It also recorded two forms as "B1 -- done, via `submitSignup`" when
`submitSignup` had no schema at all, so half of Track B had been skipped on the
product's own signup path. A row that says done should mean done.

## Outstanding

| File                                 | Track | Why not yet                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/sale/_components/SaleLogin.tsx` | B     | Uses `useActionState` with an inline closure rather than a Server Action, and validates nothing beyond "not blank". Untouched here because it is uncommitted work in progress belonging to the sales feature; editing another session's files to satisfy a standard is not a trade worth making. Convert it with the rest of that feature. |

## Excluded, with the argument

Not "not yet" -- these are decided. Re-opening one means disagreeing with the
reason, not noticing the gap.

| File                                                                         | Why                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/portal/setup/_components/SpecialConditions.tsx`                         | Track A on `useFieldArray`, and deliberately without a Zod schema. The rule it implements, from `_docs/licensing/open-questions.md` Q2, is that a dealer's own added clauses are never reviewed, validated or commented on. There is no validation to express; entries left blank are dropped rather than rejected. |
| `components/checkout/CheckoutShell.tsx`                                      | Stripe. Payment code is compatibility-sensitive and excluded by the standard without separate sign-off.                                                                                                                                                                                                             |
| `components/dashboard/AdminList.tsx` (`AdminFilterBar`)                      | Filter/search, no network write.                                                                                                                                                                                                                                                                                    |
| `app/dealership-website-builder/_components/previews/ContactPage.tsx`        | Configurator preview of a generated customer site. Submits nowhere.                                                                                                                                                                                                                                                 |
| `app/dealership-website-builder/_components/previews/HirePage.tsx`           | Configurator preview. Submits nowhere.                                                                                                                                                                                                                                                                              |
| `app/dealership-website-builder/_components/previews/InventoryPage.tsx`      | Configurator preview. Submits nowhere.                                                                                                                                                                                                                                                                              |
| `app/dealership-website-builder/_components/previews/VehicleDetailsPage.tsx` | Configurator preview. Submits nowhere.                                                                                                                                                                                                                                                                              |
| `app/dealership-website-builder/_components/previews/shared.tsx`             | Configurator preview building blocks. Submits nowhere.                                                                                                                                                                                                                                                              |
| `components/forms/SelectionFormPanel.tsx`                                    | A presentational `{chooser, children, onSubmit}` wrapper with no fields and no rules. It holds the `<form>` for `SignupPlansPanel` and `SeoSignupPanel`, whose schemas and actions live beside those panels.                                                                                                        |
