# Forms migration

**Type:** labelled migration plan, freethedesk only. Standard being migrated
to: [forms-standard.md](../../freetheplatform/_docs/forms-standard.md). Delete
this file once every row below is done.

Every file with a `<form>` element, surveyed 2026-09-16, classified by track.
Filter/search bars that only narrow a list (no network write) are out of
scope for this standard entirely. The `dealership-website-builder/_components/previews/**`
tree is excluded too — those render a mocked customer site inside the
configurator canvas; they are not forms that submit anywhere.

No Track A (react-hook-form + Zod resolver) candidates were found — freethedesk
has no repeatable/nested-field forms today. Do not add `react-hook-form` /
`@hookform/resolvers` as dependencies until one is confirmed; Track B needs
nothing beyond `zod`, which is already installed.

## Tier 0 — infrastructure (done)

- `zod` added as a dependency.
- `src/lib/serverApi.ts` — `serverApiFetch()`, the shared authenticated
  Server Action helper (forwards cookies + `X-CSRFToken` to Django), added
  alongside the existing `getSiteSettingsServer()`.
- `src/lib/serverCookies.ts` — `relaySetCookies()`, added during Tier 2. Copies
  every `Set-Cookie` header from an upstream Django response onto the Next
  response, parsed generically (name/value/attributes) rather than
  hard-coded — needed anywhere a Server Action itself establishes a session
  (signup, login), since it has no incoming cookie to forward and instead has
  to relay the one Django just issued.
- `src/lib/signup.actions.ts` — `submitSignup(config, prevState, formData)`,
  shared by every "create an account" form. Takes the endpoint plus whether
  that endpoint sets the session itself (`sessionFromSignup`) or needs a
  separate `/api/token/` login call after; either way it returns
  `{status: 'success'}` rather than redirecting itself, because the caller
  still has to set the `hasSession` localStorage flag and navigate — both
  browser-only, so they run in the component's own effect after the action
  resolves, not in the action.

## Tier 1 — reference conversions (done)

| File                                                          | Track |
| ---------------------------------------------------------------- | ----- |
| `components/marketing/AiReadinessForm.tsx`                        | B1 (unauthenticated) |
| `app/dashboard/messages/compose/page.tsx`                         | B2 (authenticated) |

## Tier 2 — remaining Track B forms

| File                                                              | Auth |
| ---------------------------------------------------------------------- | ---- |
| `app/dealership-website-builder/_components/ConfiguratorControls.tsx`   | B1 — done. Live configurator selections (brand, modules, custom request) aren't native inputs of this form — they're props from a parent — so they're carried to the action as hidden fields computed fresh each render, not read from the DOM. |
| `app/licensing/_components/SignupPlansPanel.tsx`                        | B1 — done, via `submitSignup` |
| `components/marketing/ProjectEnquiryPanel.tsx`                          | B1 — done |
| `components/forms/SelectionFormPanel.tsx`                               | No changes needed — a presentational `{chooser, children, onSubmit}` wrapper with no fields or rules of its own |
| `app/seo/_components/SeoSignupPanel.tsx`                                | B1 — done, via `submitSignup` with `sessionFromSignup: true` (no password field; the signup endpoint itself starts the session) |
| `app/login/page.tsx`                                                    | Deferred, not done. Its redirect is driven by a `useEffect` watching `AuthContext`'s `user`, which `login()` sets synchronously from the `Principal` the login response returns in its body — a Server Action can relay the session cookies but has no way to hand that `Principal` back into React context the same way. Converting it needs `AuthContext` to grow a way to accept a result from outside `login()` (e.g. a refetch method), which is a shared-auth-plumbing change, not a per-form one. |
| `app/portal/setup/page.tsx`                                             | B2 |
| `app/portal/account/page.tsx`                                           | B2 |
| `app/dashboard/settings/site/page.tsx`                                  | B2 |
| `app/seo-portal/connect/page.tsx`                                       | B2 |
| `app/seo-portal/account/page.tsx`                                       | B2 |

## Tier 3 — checkout-adjacent (convert last, extra care)

Collects customer/shipping details, not card data, but touches the checkout
flow — re-run the full checkout path manually afterward, not just
`npm run check`/build.

| File                                       |
| ----------------------------------------------- |
| `components/checkout/CheckoutShell.tsx`          |

## Excluded — not migrated by this standard

| File                                                                          | Why |
| ---------------------------------------------------------------------------------- | --- |
| `components/dashboard/AdminList.tsx` (`AdminFilterBar`)                             | Filter/search, no network write |
| `app/dealership-website-builder/_components/previews/InventoryPage.tsx`             | Configurator preview, not a real form |
| `app/dealership-website-builder/_components/previews/HirePage.tsx`                  | Configurator preview, not a real form |
| `app/dealership-website-builder/_components/previews/ContactPage.tsx`               | Configurator preview, not a real form |
| `app/dealership-website-builder/_components/previews/VehicleDetailsPage.tsx`        | Configurator preview, not a real form |
| `app/dealership-website-builder/_components/previews/shared.tsx`                    | Configurator preview building blocks, not a real form |
