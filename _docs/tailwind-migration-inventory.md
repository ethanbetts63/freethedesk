# Tailwind migration inventory — Phase 0 baseline

Deliverable for `tailwind-migration.md` Phase 0. Captured 2026-09-16.

## Clean baseline (reproduce with `npm run check` / `npm run build` from `frontend/`)

- `npm run check` (format:check + lint + lint:css + typecheck): clean, zero warnings.
- `npm run build`: clean production build, 38 static/SSG/dynamic routes, no errors.

## Stylesheet classification

31 CSS files, 9,075 lines total: 17 CSS Modules, 14 global/foundation files.

| File | Lines | Disposition | Why |
|---|---|---|---|
| `styles/tokens.css` | 378 | foundation | `@theme inline` bridge, token scales |
| `app/globals.css` | 29 | foundation | imports only |
| `styles/base.css` | 40 | foundation | reset/base layer |
| `styles/layout.css` | 10 | foundation | shared layout primitives — **Phase 3.1**: `.shell` renamed `.site-shell`, now declares its own `@layer components` |
| `styles/typography.css` | 53 | foundation | base type rules — **deleted in Phase 3.2**; rules moved into `Eyebrow`/`SectionNumber`, `.text-link` inlined at its one consumer |
| `styles/motion.css` | 45 | foundation | reduced-motion, base transitions |
| `styles/forms.css` | 39 | foundation | base form element resets |
| `styles/portal.css` | 122 | migrate | portal shell layout, no visual-effect properties — ordinary Phase 4.5 conversion |
| `components/SiteFooter.css` | 141 | migrate | shared component (Phase 4.2) |
| `components/ExpandableServiceList.css` | 201 | migrate | shared component |
| `components/dashboard/DashboardChrome.css` | 145 | migrate | dashboard chrome (Phase 4.5) |
| `components/dashboard/admin.css` | 754 | migrate | dashboard workflows (Phase 4.5); largest single file, budget extra time |
| `components/forms/SelectionForm.module.css` | 108 | migrate | form control |
| `app/[slug]/article.module.css` | 114 | rich-content | article body typography |
| `components/legal/legal.module.css` | 122 | rich-content | legal page prose, low visual-effect density |
| `app/_components/AutomationFeature.module.css` | 224 | migrate | marketing section |
| `app/_components/WebsiteDevelopmentFeature.module.css` | 222 | migrate | marketing section |
| `app/licensing/page.module.css` | 312 | migrate | route (Phase 4.4, licensing/checkout) |
| `app/seo/_components/GoogleBusinessProfileAudit.module.css` | 180 | migrate | marketing/product section |
| `app/seo/_components/seoServices.module.css` | 148 | migrate | marketing section |
| `components/marketing/FlagshipCheckout.module.css` | 177 | migrate | checkout (Phase 4.4) |
| `components/marketing/AiReadinessBanner.module.css` | 205 | migrate — confirm in Phase 4 | some animation/gradient use; re-check for complex-visual reclassification when converted |
| `components/marketing/WebsiteProductVisual.module.css` | 236 | complex-visual | heavy transform/gradient/animation, artwork-style component |
| `components/visuals/FlowCardVisual.module.css` | 291 | complex-visual | animation-heavy visual |
| `components/visuals/ReportCardVisual.module.css` | 172 | complex-visual | animation-heavy visual |
| `components/visuals/StatusPanelVisual.module.css` | 155 | complex-visual | animation-heavy visual |
| `styles/phone-mockup.css` | 140 | complex-visual | device-mockup artwork |
| `app/portfolio/case-study.css` | 947 | complex-visual | case-study showcase pages, heaviest visual-effect density in the repo |
| `app/dealership-website-builder/_styles/configurator.module.css` | 435 | generated-preview | already excluded from Stylelint token rules |
| `app/dealership-website-builder/_styles/layout.module.css` | 155 | generated-preview | already excluded from Stylelint token rules |
| `app/dealership-website-builder/_styles/preview.module.css` | 2,775 | generated-preview | already excluded from Stylelint token rules; migrated last per the plan |

Totals by disposition: foundation 7 files / 595 lines · migrate 14 files / 3,143 lines · rich-content 2 files / 236 lines · complex-visual 6 files / 1,941 lines · generated-preview 3 files / 3,365 lines.

## Routes requiring visual baseline (from `npm run build` route list)

Public: `/`, `/[slug]`, `/automation`, `/blog`, `/blog/[slug]`, `/contact`, `/dealers`, `/guides`, `/legal/*` (3), `/licensing`, `/licensing/payment`, `/licensing/payment/complete`, `/login`, `/portfolio/bloomprint`, `/portfolio/scooter-shop`, `/seo`, `/seo/payment`, `/seo/payment/complete`, `/website-development`, `/dealership-website-builder`.

Dashboard shell: `/dashboard`, `/dashboard/dealers[/[dealerId]]`, `/dashboard/enquiries[/[enquiryId]]`, `/dashboard/messages[/[messageId], /compose]`, `/dashboard/seo[/[subscriberId]]`, `/dashboard/settings/site`.

Portal shell: `/portal`, `/portal/account`, `/portal/overview`, `/portal/setup`.

SEO portal shell: `/seo-portal`, `/seo-portal/account`, `/seo-portal/connect`, `/seo-portal/overview`.

**Screenshot capture is not done.** It needs a running dev server, which per current session instructions is not started without asking first. Say the word and I'll bring one up and capture phone/tablet/desktop + hover/focus/validation/loading states across the list above; otherwise this step is on hold until requested.

## Known pre-existing defects

None identified during this pass — `npm run check` and `npm run build` are both already clean, so there's no pre-existing lint/type/build noise to distinguish from migration-caused regressions. Visual defects, if any, will only surface once baseline screenshots are captured.
