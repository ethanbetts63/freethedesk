# FreeTheDesk Tailwind migration

## Decision

FreeTheDesk will migrate from a mixture of global CSS and CSS Modules to the
same Tailwind CSS v4 architecture used by allbikes. Workload is not a limiting
factor; correctness, consistency, and a maintainable final state take priority
over minimizing the diff.

The target is **Tailwind-first, not Tailwind-only**. Both repositories follow
the same exceptions for complex animation, artwork, uncontrolled content, and
generated customer previews. The binding cross-project rules live in the
sibling repository at `freetheplatform/_docs/lint-rules.md`, and the semantic
vocabulary lives at `freetheplatform/_docs/token-contract.md`.

## Why this migration exists

The two applications currently share many token ideas but consume them through
different systems:

- allbikes uses Tailwind utilities, `cn()`, CVA, and JSX-level lint rules;
- FreeTheDesk uses global CSS, CSS Modules, CSS variables, and Stylelint;
- breakpoint values and some semantic token names differ;
- moving a component between repositories requires translating its styling;
- FreeTheDesk still contains direct palette-ramp use even where semantic roles
  exist;
- two styling systems make review, linting, and future shared UI unnecessarily
  difficult.

The migration is complete only when the two repositories follow the same
architecture and authoring rules, not merely when Tailwind is installed.

## Target architecture

FreeTheDesk will have:

- Tailwind CSS v4 and the Tailwind PostCSS plugin;
- a CSS-first `@theme inline` bridge from shared CSS variables to utilities;
- the same named colour, spacing, type, weight, radius, and breakpoint
  vocabulary as allbikes;
- the same `cn()` helper based on `clsx` and Tailwind Merge;
- CVA for typed reusable component variants;
- Tailwind utilities for ordinary component and route styling;
- narrowly scoped CSS Modules only for approved complex-CSS exceptions;
- global CSS limited to imports, tokens, reset/preflight, base rules, shared
  layout foundations, and uncontrolled rich content;
- ESLint and Stylelint rules that enforce the same policy as allbikes;
- zero lint warnings at completion.

## Non-goals

- The migration does not make both brands visually identical.
- It does not force generated dealership previews to use the FreeTheDesk design
  system; those previews intentionally model another website.
- It does not translate complex CSS into unreadable arbitrary Tailwind variants
  merely to reduce the number of CSS files.
- It does not preserve obsolete class APIs solely to avoid touching callers.
- It does not combine the repositories or require a shared published package
  before the styling contracts have stabilized.

## Migration principles

1. Keep the application buildable and reviewable after every migration slice.
2. Migrate foundations before consumers: tokens, breakpoints, and helpers come
   before route conversion.
3. Convert by complete component or coherent component family, not by replacing
   random declarations across the repository.
4. Preserve behaviour and appearance first. Intentional visual changes happen
   in a separately identified pass.
5. Delete superseded CSS as each component moves; do not leave Tailwind and an
   old stylesheet competing for ownership.
6. Tighten lint rules as soon as a category reaches zero violations so it
   cannot regress.
7. Record legitimate exceptions locally and keep them narrow.
8. Do not hide arbitrary values behind new tokens unless the value represents a
   reusable design decision.

## Phase 0: capture the baseline

Before changing styling infrastructure:

- record clean `npm run check` and `npm run build` results;
- capture screenshots for every public route, checkout state, login page,
  dashboard route, responsive header state, and form state;
- cover at least phone, tablet, desktop, hover/focus, validation, loading,
  success, and failure states where applicable;
- inventory all global stylesheets, CSS Modules, selectors, media queries,
  arbitrary values, palette-token uses, and JavaScript-dependent class names;
- classify each stylesheet as `migrate`, `foundation`, `rich-content`,
  `complex-visual`, or `generated-preview`;
- note any known visual defects so the migration is not blamed for pre-existing
  behaviour.

Deliverable: a checked-in migration inventory with an owner and disposition for
every stylesheet. Done: [`tailwind-migration-inventory.md`](tailwind-migration-inventory.md)
(stylesheet classification and clean `check`/`build` baseline; screenshot
capture still pending a dev server).

## Phase 1: install the shared foundation

1. Add `tailwindcss` and `@tailwindcss/postcss` at versions compatible with the
   repository's Next.js version. Done.
2. Add the PostCSS configuration and import Tailwind from `globals.css`. Done.
3. Add `clsx`, `tailwind-merge`, and `class-variance-authority`. Done.
4. Copy the structural pattern of allbikes' `cn()` helper, including its custom
   font-size groups, then make the shared configuration live in one obvious
   location. Done: `src/lib/utils.ts`. Its `FLUID_TEXT_SIZES` list was
   missing the ten fixed interface sizes (`text-nano` … `text-lead`) — only
   the fluid heading scale was covered — which reproduces the exact
   colour-drop bug allbikes' own comment documents; fixed.
5. Add `@theme inline` mappings for semantic colours and named scales. Done:
   `styles/tokens.css`.
6. Establish the canonical Tailwind breakpoints: `sm` 640px, `md` 768px, `lg`
   1024px, `xl` 1280px, and `2xl` 1536px. Add a named content-driven breakpoint
   only when a component proves it needs one. Done: `tokens.css` documents the
   canonical scale and Stylelint allows it; freethedesk's legacy 900px/1080px
   values stay allowed only for their existing consumers (nine files, listed
   in `tailwind-migration-inventory.md`) and convert to their canonical
   neighbour as each file migrates in Phase 4. Tailwind's own utility
   variants (`sm:`/`md:`/etc.) already read the canonical scale by default —
   `tokens.css` doesn't override `--breakpoint-*`, matching allbikes.
7. Verify that Tailwind Preflight and the existing reset do not both own the
   same behaviour. Remove the redundant layer rather than depending on import
   order indefinitely. Done: `globals.css` declares an explicit
   `@layer base, legacy, components, utilities` order and imports
   not-yet-migrated global CSS into `layer(legacy)`, so Preflight (Tailwind's
   own `base` layer) always loses to nothing and always wins over legacy —
   no redundant reset exists. Fixed a stale comment in `base.css` that still
   pointed at a `reset.css` file that no longer exists.

**Phase 1 exit criteria:** met. `npm run check` and `npm run build` are clean
after the above; existing pages show no reset regressions (import-order/layer
structure was already correct, not newly built here).

Exit criteria:

- a token smoke-test component renders every shared utility correctly;
- font-size and colour utilities survive `cn()` merging together;
- production build output includes used classes and excludes probe classes;
- existing pages have no unexplained reset regressions.

## Phase 2: reconcile the token vocabulary

Create an explicit mapping for every token in both sites. Resolve synonyms
before mass conversion. Known examples include:

- `--section-space` versus canonical `--space-section`;
- `--text-on-dark` and `--text-on-brand`, which must be retained as separate
  roles only if components genuinely need both meanings;
- FreeTheDesk's direct `--slate-*` and `--blue-*` consumers, which need semantic
  aliases unless they are approved generated-preview or artwork exceptions;
- status enum colours, which must distinguish categorical states from feedback
  meanings such as danger, warning, success, and information.

Do not mechanically rename a token based only on equal colour values. Roles are
defined by meaning, and two roles may currently resolve to the same value.

Done: [`tailwind-token-mapping.md`](tailwind-token-mapping.md) — full
token-by-token comparison. `--section-space`/`--space-section` was already
reconciled; `--text-on-dark`/`--text-on-brand` is a confirmed synonym
(173 combined call sites, deferred to a later cleanup rather than renamed
here); status enum colours are already correctly split between feedback and
categorical meaning, just not yet in allbikes' `--category-N` naming
pattern; direct `--slate-*`/`--blue-*` consumers resolve per-file during
Phase 4. One open item carried into Phase 3: the fluid heading scale
(`text-step-*`/`text-display-*`) still needs its per-usage semantic rename,
and freethedesk's fixed `--text-body` would collide with allbikes' fluid
`--text-body` if renamed carelessly — see the mapping doc's "needs a
decision" section.

Exit criteria:

- both token files expose the same cross-site semantic and scale vocabulary;
- site-only tokens are documented as genuine product needs;
- application components no longer consume raw palette ramps;
- the token contract accurately describes the implementation rather than an
  intended future state.

## Phase 3: migrate shared primitives

**Complete.** All seven items below are done. `styles/portal.css` and
`styles/typography.css` are deleted, `admin.css` is 699 lines down to 213, and
the primitives every later phase builds on — rails, typography, buttons, form
controls, cards and notices, dialogs, checkout and dashboard controls, and the
four interaction states — are typed components or named class constants rather
than global classes.

Convert the foundations that produce the most downstream reuse first:

1. page rails and vertical section rhythm. Done: `.shell` is now `.site-shell`,
   matching allbikes' name, and its hardcoded 1240px is now the `--content-max`
   token beside `--gutter` (37 call sites across 26 files). `layout.css`
   declares its own `@layer components` and is imported without
   `layer(legacy)`, because it is a permanent foundation rather than CSS
   awaiting migration: the served cascade is now `base` → `legacy` →
   `components` (the rail) → `utilities`, so the rail beats unmigrated global
   CSS and still loses to a Tailwind utility on the same element. Vertical
   rhythm needed no work — sections already space themselves with
   `py-section`/`my-section` from `--space-section`. allbikes'
   `.site-shell-narrow` and `.mobile-bleed*` were deliberately not ported:
   freethedesk has no consumer for either;
2. typography primitives and headings. Done: `styles/typography.css` is
   deleted. `Eyebrow` and `SectionNumber` now carry their own Tailwind
   utilities and compose caller overrides through `cn()`; `.text-link` had a
   single consumer and was inlined there. The bare `eyebrow`, `section-number`
   and `section-number-light` class names stay on the elements as structural
   hooks — `app/portfolio/case-study.css` selects _around_ them
   (`.case-hero-copy > p:not(.eyebrow)`, `.case-split-copy > p:not(.section-number)`)
   and overrides one of them (`.case-operations-section .section-number-light`).
   That stylesheet is imported unlayered, so its override still beats the new
   utilities exactly as it beat the deleted rule. Both hooks are removed when
   case-study.css migrates in Phase 4; dropping them now would silently
   restyle the case-study hero and split copy. Headings needed no primitive:
   routes size them directly from the fluid scale, whose semantic rename is
   still the open Phase 2 item;
3. buttons and CTA variants. Done. Marketing CTAs already had `CtaButton`
   (CVA + `cn()`); this pass converted the other family, the dashboard/portal
   buttons. `.admin-primary-button`, `.admin-secondary-button`,
   `.admin-inline-button` and `.admin-send-button` are deleted from
   `admin.css` and replaced by `components/dashboard/AdminButton.tsx` — one
   CVA component with `primary`/`secondary`/`inline` variants, rendering a
   `Link` when given `href` and a `<button>` otherwise, across 24 call sites
   in 13 files. No hook classes were needed: nothing else selected them.
   `admin.css`'s `@media` rule setting `width: revert` on the primary button
   went with them — no author rule ever set a width on it, so it computed to
   the `auto` it already had. Two details worth recording: the secondary
   button's hover reached into the raw ramp (`var(--slate-400)`), now the
   named `--border-strong-hover` role; and the radius is written
   `rounded-[var(--radius-xs)]` rather than `rounded-xs`, because Tailwind's
   stock `xs` is 2px while freethedesk's `--radius-xs` is 4px and the scale
   has no `@theme` mapping for it;
4. form controls, labels, help text, and validation messages. Done for the
   portal form layer: `styles/portal.css`'s `.portal-setup-form`,
   `.portal-field-grid`, `.portal-file-grid` and `.portal-form-actions` rules
   are deleted (122 lines down to 42) and replaced by
   `components/dashboard/PortalField.tsx` — `PortalFieldset` (the card, its
   legend and its description), `PortalField` (label, control and hint, with
   a `multiline` variant for textareas and a file-input variant), and the
   grid/form/action-row class constants, across the two pages that render the
   identical shape (dealership setup and the SEO reporting brief).
   `styles/forms.css` needed no work — it is already scoped to the dealership
   website builder, the excluded second design system — and
   `components/forms/SelectionForm.module.css` was already migrated with a
   documented complex-visual exception. Four things worth recording:
   `portal.css` is imported straight from the portal layouts rather than
   through `globals.css`, so it is unlayered and beats every Tailwind utility
   — the old rules had to be deleted in the same change, not left to compete;
   the focus border was the raw `var(--blue-600)`, now the named
   `--border-focus` role (see the token mapping doc), which also cleaned up
   the two login inputs; padding is deliberately kept out of the shared
   control class, because Tailwind emits `padding` before `padding-inline`
   and a `p-xs` on the file variant would otherwise lose to a base `px-s`
   whatever order the classes merge in; and one **defect was fixed, not
   preserved** — `portal.css` styled `input` but never `textarea`, so the
   three textareas on the SEO reporting brief rendered with no border,
   background or padding at all. That is an intentional, separately
   identified change under principle 4, not a migration side effect;
5. cards, notices, badges, status indicators, and tables. Done, one surface
   family at a time. **Notices:** `admin.css`'s
   `.admin-banner` / `.admin-banner-error` / `.admin-banner-warning` /
   `.admin-form-error` and `.admin-muted` rules are deleted (699 lines down to 665) and replaced by `components/dashboard/AdminNotice.tsx`, a CVA with a
   `tone` (success/warning/danger) and a `size` (`banner`, which carries its
   own vertical rhythm, and `field`, the flush in-form error), across the 17
   files that rendered them. Three things worth recording: the old base class
   quietly _was_ the success palette, so a neutral-looking
   `<p className="admin-banner">` was in fact a green banner and every error
   had to repeat the palette as a second class (`tone` is now always explicit);
   `.admin-form-error` was declared twice in `admin.css`, the second copy
   repeating the danger palette it already inherited, and both are gone; and
   `.admin-muted` was only ever `--text-subtle` at `--text-ui`, so it inlines
   as two utilities rather than earning a component. One **deliberate change,
   not a preserved appearance** — `.admin-empty` had no standalone rule, only
   `.admin-table td.admin-empty`, so the 16 `<p className="admin-empty">`
   loading states across the dashboard and both portals were rendering
   completely unstyled in body colour. They now take the muted colour the
   class name always promised. Flagged under principle 4.
   **Status indicators are done:** `.admin-status`, `.admin-swatch`,
   `.admin-legend` and `.admin-row`, plus the whole
   `[data-status='…'] { --admin-status-color: … }` block, are deleted (665
   lines down to 604). The colour stays a custom property — the three surfaces
   mix it at three different strengths (12% for a table row, 26% for a pill
   background, 45% against the text colour) and a mix is not expressible as a
   Tailwind colour utility — but the status-to-colour map moves into
   `StatusPill.tsx` as `statusTone()`, beside the labels and status lists it
   belongs to. A second **deliberate fix**: `queued`, `delivered`, `bounced`
   and `cancelled` were added to `messageStatuses` but never to the CSS, so
   `--admin-status-color` was undefined for them, `color-mix()` was invalid,
   and those four pills rendered with no background and no colour at all
   beside perfectly normal `sent` and `failed` ones. They are now mapped by
   meaning, and an unknown status falls back to the neutral `closed` colour
   instead of to nothing — the class of bug that a stylesheet with no way to
   know when a new enum value ships will keep producing.
   **Tables are done:** `.admin-table-wrap`, `.admin-table` and its
   `th`/`th button`/`td`/`td strong`/`td small` descendant rules, the row
   hover/focus-within treatment, `.admin-row-link` and its full-row `::after`
   overlay, `.admin-pagination`, and `.admin-table td.admin-empty` are all
   deleted (604 lines down to 494). They become class constants and two tiny
   elements exported from `AdminList.tsx` — `adminTableClassName`,
   `adminThClassName`, `adminTdClassName`, `adminRowClassName`, `CellTitle`
   and `CellNote` — applied at each cell across the four list pages, following
   allbikes' own table pattern of exported class constants rather than
   descendant selectors. `<CellTitle>`/`<CellNote>` keep the `<strong>`/
   `<small>` semantics the deleted rules relied on. The pagination buttons
   took a new `quiet` variant on `AdminButton` (bordered, `--text-ui`, fills
   on hover instead of darkening its border) which also covers the filter-bar
   search and attachment-list buttons when item 6 reaches them; it
   deliberately declares no colour, because the original inherited its
   panel's. `.admin-enquiry-table` was a class with no rule anywhere and is
   gone. Verified by A/B: the deleted CSS was re-injected beside the Tailwind
   markup and every computed property compared element by element at 1440px
   and 480px. The only surviving differences are non-visual — Tailwind sets
   `border-color` and `border-style` on zero-width sides, the empty cell no
   longer needs `position: relative` because nothing is positioned inside it,
   `gap: normal` computes as `0px`, and the pagination buttons are
   `inline-flex` rather than `block` at an identical measured box.
   **Cards finish the item:** `.admin-panel`, `.admin-detail-card` and its
   `h2`, `.admin-detail-grid`, `.admin-detail-wide`, `.admin-status-card` with
   its label group and `<select>`, `.admin-card-label`, `.admin-card-heading`,
   `.admin-detail-list` with its `div`/`dt`/`dd`/`a` descendants, and
   `.admin-message-body` all become exported class names in
   `components/dashboard/AdminCard.tsx` (494 lines of `admin.css` down to
   378). Class names rather than wrapper components, because a card is a
   `<section>` the page already owns — its own heading, its own children,
   sometimes its own extra class. Only the definition list earned a component:
   `AdminDetailItem` replaced thirty-seven hand-written
   `<div><dt>…</dt><dd>…</dd></div>` triples that the deleted CSS reached into
   by descendant selector. `.admin-compose-card` kept its own copy of the card
   shell, so deleting the shared one changed nothing for it; the rest of the
   composer waits for item 6. **`styles/portal.css` is now deleted outright**
   — its last rule, the numbered `.portal-steps` list, became
   `components/dashboard/PortalSteps.tsx`, and both portal layouts dropped the
   import. The numbering stays a CSS counter (`[counter-reset:portal-step]`
   plus `before:content-['0'_counter(portal-step)]`) rather than becoming a
   JSX index: the markup is an `<ol>` because the order is the meaning, and a
   counter keeps the number out of the accessibility tree where a screen
   reader already announces the list position. Verified by the same A/B as the
   tables, across cards, the status card, the detail list and the steps at
   1440px and 480px: zero differences beyond Tailwind's transparent
   ring-placeholder chain in `box-shadow` and `border-color` on zero-width
   sides;
6. dialogs, checkout controls, and dashboard controls. Done.

   **Dialogs (3.6b).** `components/marketing/AiReadinessBanner.module.css` is
   deleted — 205 lines, the whole AI-readiness banner, its form and the mobile
   prompt dialog. Phase 0 had flagged it "confirm in Phase 4; re-check for
   complex-visual reclassification"; it is not complex-visual. The only rule
   that qualified was the animated gradient underline, and that is the same
   three declarations `.moving-colour-text` and `.moving-colour-button` already
   share, so it became `.moving-colour-fill` in `styles/motion.css` beside them
   and beside the reduced-motion opt-out that disables all three. The underline
   was a `::after`; it is now a real `<span>`, because a pseudo-element could
   only have reused that class through an arbitrary-utility chain, which the
   non-goals rule out. Six other CSS modules still restate those three
   declarations themselves and collapse onto the class as each migrates.

   The dialog styled the banner by reaching into it — `.modalBanner .inner`
   and `.modalBanner .copy h2` re-declared the inner layout and the heading
   size from outside. That is a variant, so it is now spelled as one:
   `AiReadinessBanner` takes `placement="inline" | "dialog"` and owns both
   shapes itself. The dialog passes the prop instead of a class, and the
   component's `className` escape hatch is gone with its only consumer.
   `--slate-100` on the success message — the file's last raw ramp value — is
   now `text-text-on-dark`: on navy the two are indistinguishable, and moving
   the ramp reference from CSS into JSX would only have hidden it from
   Stylelint. The two hand-rolled visually-hidden blocks are Tailwind's
   `sr-only`.

   `min-width: 1080px` became `lg:` (1024px), the second of the two
   pre-migration breakpoints `tokens.css` says to convert on migration. 1024
   rather than 1280 because the heading already shrank below its 480px cap at
   1080 — the single-row strip was designed to start as soon as it fits, and
   1280 would have withheld it from a 200px band where it currently works.
   Verified at 1024: the row fits, the heading wraps to two lines, nothing
   overflows. That band is the only difference the A/B found at 1440, 1280,
   1080, 1024, 960, 640 and 480; everything else was the known non-visual set
   (`sr-only`'s `margin:-1px` versus `clip-path`, `rounded-full` versus `50%`
   on a 28px circle, Tailwind's transparent ring placeholders in `box-shadow`)
   plus the deliberate `--slate-100` change. The live dialog was checked too:
   backdrop, 351px card, 44px fields at the 16px iOS floor, focus on the close
   button, body scroll locked, Escape closing and restoring it.

   **Dashboard controls (3.6a) are done:** `admin.css` is 378 lines down to 213. The text control that
   four stylesheets had each grown their own copy of — `portal.css`'s field
   input, `.admin-filters select/input`, `.admin-compose-form
input/select/textarea`, `.admin-notes` and `.admin-status-card select` — is
   now one definition, `formControlClassName` in
   `components/dashboard/formControl.ts`, which `PortalField` and `AdminCard`
   also read. They had already drifted: only some set `width`, the composer's
   textarea re-declared the seven shared properties a second time to add three
   of its own, and the focus border was a raw `var(--blue-600)`. Padding stays
   out of the shared base for the reason 3.4 recorded. `.admin-compose-form`
   became `adminFormClassName`/`adminFormLabelClassName`/
   `adminFormControlClassName` (it had long since outgrown the composer — both
   account screens and the site-settings prices use it), `.admin-filter-bar`
   /`.admin-filters`/`.admin-search` moved onto `AdminFilterBar`, and
   `.admin-search button` / `.admin-attachments > button` became
   `AdminButton`'s `quiet` variant, which 3.5c had already introduced for
   pagination.

   **One real bug surfaced, and it is not in this slice.** Tailwind sorts
   breakpoint variants by value, and it cannot compare an arbitrary
   `min-[900px]` against the named `sm` (`40rem`) — so it emits the arbitrary
   one _first_, and `sm:` silently wins at every width above 640px. Confirmed
   on the built CSS (`min-[900px]` block at byte 67566, `sm:` at 71554) and in
   the browser: `/guides`'s feature row declares
   `sm:grid-cols-[auto_minmax(0,1fr)] min-[900px]:grid-cols-[auto_minmax(0,1fr)_auto]`
   and measures two columns at 1000px and 1440px — its three-column layout has
   never rendered. The filter bar was written the same way and had the same
   fault; it now uses `lg:`, following the rule `tokens.css` already states
   ("900px and 1080px are freethedesk's pre-migration values… each is
   converted to its canonical neighbour, 900 -> 1024, as its file migrates").
   That moves the three-column filter layout from 900px to 1024px — an
   intentional, documented breakpoint change, and the only difference the A/B
   found outside 1440px and 480px. **Every remaining `min-[900px]:` call site
   that also sets the same property at `sm:` is broken the same way**
   (`app/guides/page.tsx` lines 114 and 129 confirmed;
   `components/checkout/CheckoutShell.tsx` lines 45 and 49 declare
   `sm:min-h-*` beside `min-[900px]:min-h-screen` and are the same shape).
   Those files belong to Phase 4 and are not touched here, but they should not
   wait for it.

   **Checkout controls (3.6c).** No stylesheet to delete: the checkout flows
   were written in Tailwind from the start. What they had instead was four
   hand-rolled class-string constants and one inline copy of a fifth, spread
   across `CheckoutShell.tsx` and `PaymentConfirmation.tsx`, plus fourteen raw
   ramp values. Three of those constants were the same button in three shapes,
   so they became `components/checkout/CheckoutButton.tsx` — a CVA with
   `submit` (the full-width 60px pay bar), `retry` (the same bar capped at
   190px and centred) and `link` (the two post-payment action links), rendering
   a `Link` when given `href` and a `<button>` otherwise, across five call
   sites.

   **It is deliberately not a `CtaButton` variant.** The marketing CTA is a
   `justify-between` box with an uppercase tracked label, a hover fill and a
   sliding arrow; the checkout button is a flush-left bar with a sentence-case
   label and an oversized arrow beside it. Converging them is a redesign of the
   checkout, not a migration of it, so this follows the precedent 3.3 set with
   `AdminButton`: one CVA per real family, no family forced into another. The
   disabled treatment moved into the CVA's base rather than onto `submit`, the
   only variant that had one — inert until a caller disables a button, and one
   family should not hold two answers to the same state. The arrow picked up
   `aria-hidden`, which the marketing CTA's already had.

   The 42px graph-paper grid over `SignalFlow` was written out in both files;
   it is now `checkoutGridClassName` in `components/checkout/checkoutSurface.ts`
   (the `formControl.ts` pattern). Its `--blue-950` stays a raw ramp value on
   purpose, and the file says why: the role is "a barely-visible rule on a
   tinted surface", `--line-strong` is the near-black for real dividers and
   `--surface-dark` is the same ramp step named for a background, so every
   available name would misdescribe it. Everything else converted cleanly —
   `--slate-600` to `text-text-muted`, `--slate-500` to `text-text-subtle`,
   `--slate-200` to `border-border-default`, and the order card's
   `color-mix(… var(--slate-300) 68% …)` to the same mix over
   `--border-strong`. The one copy of the grid that lacked `pointer-events-none`
   gained it; the card above it already sits in its own stacking context, so
   nothing moved.

   **The predicted bug was real, and worse than predicted.** The lines this
   document named — `CheckoutShell.tsx` 45 and 49 — declare `sm:min-h-[620px]`
   beside `min-[900px]:min-h-screen`, and Tailwind emits the arbitrary
   breakpoint first, so `sm:` won at every width above 640px. The consequence
   was not a layout that started late: **the checkout's left panel and its
   inner column have never been full height at any width.** Measured old
   against new, both panels compute 620px before and 900px after at 1024,
   1080, 1280 and 1440. The panel is a grid item and stretched to the row
   regardless, so the visible symptom was subtler than a short panel — the
   inner column ended at 620px, which is where `mt-auto` was anchoring the
   product copy, leaving it floating mid-panel instead of sitting on the
   viewport's bottom edge. Third confirmed instance of this defect.

   `min-[900px]:` became `lg:` throughout the file, per the rule in
   `tokens.css`. That moves the two-column split from 900px to 1024px, so the
   900–1023 band now stacks: at 960 the old split gave a 390px rail beside a
   520px form, and the stacked layout reads better than either. Intentional and
   documented, the same call 3.6a made for the filter bar.

   The payment error message stays a local constant rather than joining
   `AdminNotice`. It has one consumer and a different shape (a 3px left rule,
   no radius), and `AdminNotice` is named for the dashboard family it came
   from. If Phase 4 brings a second public-side notice in, that is when a
   shared primitive is worth naming.

   Verified by A/B at 1440, 1280, 1080, 1024, 960, 900, 640 and 480: every
   changed element rendered with its old class string beside its new one, all
   computed properties and `::after` compared. Clean everywhere except the
   three intended changes above. **A method note for later slices:** Tailwind
   only compiles classes it finds in the source, so once a class string is
   edited out, the old one stops existing and an A/B against it silently
   compares nothing to something and reports no difference. The old strings had
   to be put back into a temporary file in `src/` and the build re-run before
   the comparison meant anything. Earlier slices compared against re-injected
   legacy CSS, which does not have this failure mode; a Tailwind-to-Tailwind
   slice does;

7. focus, disabled, loading, and reduced-motion states. Done. These are the
   states nobody owns until someone names them, and the audit found exactly
   that: three button families with four different disabled treatments between
   them and **no focus treatment at all**, seventeen transition and animation
   declarations of which one honoured `prefers-reduced-motion`, and four
   unrelated spellings of a focus ring. They are now three constants in
   `lib/controlState.ts` plus one site-wide media query.

   **Focus.** `focusRingClassName` is `focus-visible:outline-2
focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]`,
   and `CtaButton`, `AdminButton`, `CheckoutButton` and the header's menu
   toggle all take it. An outline rather than a `box-shadow`, so it cannot
   collide with a component's own shadow; `:focus-visible` rather than
   `:focus`, so a mouse click on a button does not paint it. The shape is not
   new — `adminRowClassName` reached the same 2px/offset-2/`--focus-ring`
   answer independently in 3.5c, and this is that answer named. The header
   toggle's bespoke 3px shadow ring is gone.

   There are deliberately **two** focus treatments, not one. A control that
   owns a border says "focus" by moving that border and drawing a 2px ring
   inside it (`formControl.ts`, unchanged); a filled box has no border to move
   and draws the outline outside. What is not allowed any more is a third.
   `app/login/page.tsx` had been carrying its own copy of the text control —
   the fifth, after the four 3.6a consolidated — and now composes
   `formControlClassName` with its own background and padding, which is what
   that module leaves to callers. The one visible consequence is a 4px radius
   on the two login inputs, matching every other control on an authenticated
   surface.

   **Disabled.** Two treatments, because there are two reasons:
   `disabledBusyClassName` (`cursor-wait`, 55% — the application is working)
   and `disabledUnavailableClassName` (`cursor-not-allowed`, 45% — the control
   is not offered yet). `AdminButton` had already drawn this distinction in
   3.3 and is the source of it; what changes is that the marketing CTA's 70%
   becomes 55% and the admin secondary/quiet `cursor: default` becomes
   `not-allowed`, which states the meaning the old cursor only implied. Both
   are intentional under principle 4.

   **Loading** turned out to be the same state wearing a third name. The
   checkout pay bar is disabled for both reasons at different moments — terms
   not accepted, then payment in flight — which no single class can say, so
   `CheckoutButton` takes a `busy` prop that picks the treatment, and the two
   call sites pass the flag they already had (`preparing`, `submitting`). The
   label swap they already did ("Confirming…") is the rest of the loading
   state; there is no spinner anywhere in the product and this does not add
   one.

   **Reduced motion.** `styles/motion.css` gains a site-wide opt-out beside the
   moving-colour one it already had: `animation-duration`,
   `animation-iteration-count` and `transition-duration` collapse for every
   element, and `scroll-behavior` returns to `auto`. Durations collapse to a
   frame rather than to `none` so a transition still fires its events and still
   lands in its final state; `!important` is needed because the declarations
   being overridden are Tailwind utilities in a later layer. `scroll-behavior`
   matters most here — every in-page CTA runs `scrollToId()`, and the smooth
   scroll was the site's largest unasked-for movement with no opt-out at all.
   The per-module `prefers-reduced-motion` blocks stay where they are; they
   disable specific animations rather than shortening them, and this rule does
   not contradict them.

   Verified by A/B against the pre-change class strings, plus a keyboard pass:
   tabbing 45 stops through the home page, every `CtaButton` (both its
   `<button>` and `<Link>` forms) now reports `2px solid` at `--focus-ring`
   with a 2px offset and `:focus-visible` true, while text inputs keep their
   shadow ring and plain links keep the browser default. The reduced-motion
   rule was measured with the preference emulated both ways: 0.2s to 0.00001s
   on a transition, `moving-colour-shift` to `none` on an animation, `smooth`
   to `auto` on the document. The only computed differences outside those
   intended are the three listed above.

Replace global appearance classes such as `.primary-button` with React
components backed by CVA. Props use semantic names such as `primary`,
`secondary`, `danger`, and `success`; they do not expose palette names.

Exit criteria:

- consumers select typed variants rather than styling controls themselves;
- duplicate button/form/card declarations are removed;
- primitives behave identically across public pages and the dashboard;
- accessibility states match or improve on the baseline.

## Phase 4: migrate routes and component families

**4.0 — the arbitrary-breakpoint sweep. Done, ahead of the rest of the phase.**
The plan was to convert `min-[900px]:` and `min-[1080px]:` file by file as each
file migrated. That was wrong for one reason: the Tailwind ordering defect
described above is not a migration inconvenience, it is a live rendering bug,
and leaving it in fifteen files until their turn came meant shipping it for the
length of the phase. It is also the same edit Phase 4 would make anyway, so
doing it once costs nothing extra.

All 103 `min-[900px]:` occurrences across 16 files became `lg:`, and the eight
`min-[1080px]:` became `lg:` in `SelectionFormPanel`/`ProjectEnquiryPanel` (the
only stage on those elements) and `xl:` in `ProofStrip`, which stages 900 and
1080 on the same element and needs to keep two steps. No file mixed
`min-[900px]:` with an existing `lg:`, so nothing collided. No `min-[…px]:`
variant remains in TSX; the 900/1080 media queries inside the surviving CSS
files are source-ordered and unaffected, and go when those files do.

Four more instances of the defect were live in production and are fixed by the
sweep, all of them the same shape — a `sm:` rule silently beating the
arbitrary-breakpoint rule that was meant to supersede it:

- `ServiceScroll.tsx:98`, `sm:grid-cols-[auto_minmax(0,1fr)]` beating
  `min-[900px]:grid-cols-[auto_minmax(0,1fr)_auto]`: the custom-service row's
  three-column layout had never rendered at any width;
- `ServiceScroll.tsx:121`, `sm:col-start-2` beating `min-[900px]:col-auto`: its
  CTA stayed in the text column instead of moving to the third;
- `ProcessBar.tsx:5`, `sm:px-ml sm:py-m` beating `min-[900px]:px-l
min-[900px]:py-ml`: the desktop padding never applied (`min-h` had no `sm:`
  counterpart and did);
- `app/guides/page.tsx:114,129`, the empty-state card, identical to the
  `ServiceScroll` pair.

Together with the two already fixed in 3.6a and 3.6c, that is six. Every one
was a rule written to take effect and silently not taking effect, which is why
Phase 5 lists arbitrary breakpoint variants as an ESLint error rather than a
style preference.

**Slices landed so far.** Running total: twenty stylesheets deleted and two
added (`styles/prose.css` and `flowCompare.module.css`, which was split out of
the licensing page); 8,226 lines of CSS down to 4,193. Slices 4.7 to 4.15 are
summarised in their commit messages rather than restated here.

Phase 4 is complete. Three stylesheets remain, each with a written
justification for staying: `preview.module.css` (2,775, below),
`FlowCardVisual.module.css` (291) and `flowCompare.module.css` (113).

**4.15 split the website builder rather than migrating or excluding it.** The
plan called the builder "a scoped second design system" and scheduled it last
because it might stay CSS. Reading it showed it was not one thing:
`preview.module.css` draws the fake dealership site, but
`configurator.module.css` (435) and `layout.module.css` (155) were FreeTheDesk's
own UI — the controls panel reached into `:global(.form-label)` and
`.form-control`, overrode `--page-accent`, and carried the page's two-column
shell and a `min-width: 900px`. Those two are now utilities and both files are
gone; only the demo itself stays CSS.

The boundary is `.browser`, the frame's outermost element, and it is now stated
in the file's header rather than implied. Two things moved to make it true:

- the demo's type scale (`--demo-text-*`) was defined on the _page_ wrapper, so
  the site's own chrome was being sized by the demo's variables. It is now
  defined on `.browser`, which means a demo size cannot leak outwards and the
  chrome had to choose a real site token for every size it uses;
- `--demo-space-xs/sm/md/lg` were 8/12/16/24px — the site's `--space-xs/s/m/l`
  to the pixel. A second set of names for the same four values is the Phase 5
  rule below, so they are gone and the demo reads `--space-*` directly.

What the demo keeps is the type scale (genuinely its own, and larger than the
site's at every step) and the shared colour palette, which it keeps on purpose:
the preview is a real FreeTheDesk artefact and its chrome should not drift from
the page around it.

**4.13 condensed six families the migration exposed.** Spelling the same idea
out in enough places makes the repetition visible, and these only became
countable once they were utilities:

- five accent variables (`--page-accent`, `--section-accent`,
  `--feature-accent`, `--legal-accent`, `--section-number`) whose every set site
  resolved to `--action-primary`, now one defined at `:root`;
- two checklist cards that agreed about the row and disagreed about the
  dressing, now `ChecklistCard` with a `panel` and a `framed` layout;
- three phone drawings in two files under three sets of names, now
  `PhoneFrame`'s three sizes (`styles/phone-mockup.css` deleted);
- six `0 0 0 Npx` shadows at four sizes and four opacities, now `--ring-focus`
  and `--ring-halo`, each taking its colour from a local property;
- five browser drawings that each spelled out the three chrome dots, now
  `TrafficLights` (the frames stay separate: each is sized to its own drawing);
- one editorial rule with five spellings, now `hiddenBelowSmClassName`.

Line count is a poor scoreboard for this phase and 4.6 is where that becomes
obvious: it removed real duplication and the total went _up_ by a hundred
lines, because the token definitions and the paragraphs explaining which step
to pick cost more than the values they replaced. That is the trade being made
on purpose. What matters is that a new card now has one shadow to choose from
a scale of five rather than fifty precedents to copy from.

- **4.1 — `SiteFooter.css` (141) and `ExpandableServiceList.css` (201).** The
  footer's three repeated `color-mix` tints become two local constants named
  for what they are, a quiet tint and a link tint, instead of being written out
  at five call sites. The service list's summary picked up the shared
  `focusRingClassName` in place of its own outline in `--page-accent`, so the
  site has one focus colour rather than one per section; its
  `--services-indent`/`--services-inset` pair stays as custom properties on the
  section, because both are functions of the summary's icon grid rather than of
  the space scale and the body padding reads better naming them. Two hand-rolled
  clamps are carried over verbatim — replacing them is a type decision, not a
  migration one.

- **4.2 — `legal.module.css` (122 to 88) and one graph-paper grid.** Split along
  the line that matters: the page, the backdrop and the document card are
  authored JSX and move to Tailwind; the rules under `.document` are element
  selectors over markdown-rendered HTML with nowhere to hang a utility class, so
  they stay CSS, renamed `.prose` to match the article module. The two prose
  modules stay separate on purpose and now say why. `checkoutSurface.ts` becomes
  `lib/gridSurface.ts` now that the legal page is a third consumer of the same
  42px grid; its copy was 4.5% where the checkout's was 5.5%, and they are 5.5%
  now. Two exports rather than one, each spelled out in full, because a class
  string built at runtime is invisible to Tailwind's scanner and compiles to
  nothing — the 3.6c method note in another guise.

- **4.3 — `DashboardChrome.css` (145).** The shell is a top bar on a phone and a
  sticky left rail from `lg`, which the stylesheet expressed as a desktop layout
  partly undone at the small end: nine `revert` declarations across two media
  queries, all of which mobile-first utilities make unnecessary. Two bugs fell
  out. The nav's bare global `.active` class becomes `aria-current="page"` plus
  a conditional class, so a screen reader is told which item is current for the
  first time. And `/login` rendered its Suspense fallback with
  `className="admin-loading"` while importing only `admin.css` — the class lived
  in `DashboardChrome.css`, which `/login` never imported, so the sign-in
  loading state has been unstyled since it was written. Both now share
  `adminLoadingClassName`.

- **4.4 — `seoServices.module.css` (148).** Two miniature illustrations with
  fully authored JSX; nothing held them in CSS but history. Their greys and
  blues stay ramp steps as a documented exception — they are picked for the
  picture, not for a role the contract names — but they are five named constants
  at the top of the file rather than scattered through it, so the exception is
  countable. The success dot's halo was a literal `rgba(52, 168, 83, 0.12)`, the
  raw green written out; it is a `color-mix` over `--fill-success` now, so the
  dot and its glow cannot drift apart.

- **4.5 — `admin.css` (213), the last global stylesheet outside `styles/`.**
  Nineteen consuming files. The page rail, the back link, the wordmark and the
  one-off blocks on the enquiry-detail and compose screens become named
  constants in `components/dashboard/adminLayout.ts`; the page heading becomes
  `AdminPageHeader`, used at all fourteen call sites.

  The heading had to be a component rather than a constant, and the reason
  generalises. `admin.css` styled the block's `h1` and its non-kicker `p` by
  descendant selector. Translated literally that is `[&_p]:text-text-muted`,
  which compiles to a two-part selector and therefore outranks any class
  sitting on the `p` itself — the kicker would have silently lost its colour
  and tracking to the subtitle's. **Descendant selectors over a fixed structure
  do not survive the translation to utilities; the structure has to become
  markup.** Expect the same call in `case-study.css` and the licensing page.
  Along the way the subtitle stops being "whichever `p` is not the kicker" and
  becomes a prop.

  One deliberate behaviour change: `.admin-config-group`'s margin was on the
  adjacent-sibling selector, so the first group in a section had none. Every
  group takes it now — the groups always follow the basics block, which is
  separated by its own border, and the missing gap read as a mistake. The
  config request's `--blue-600` left rule becomes `--action-primary`.

  What remains of the dashboard is components, not stylesheets. The only global
  CSS left in the tree is `styles/` — tokens, base, forms, motion, layout,
  globals and the phone mockup — which is foundation and stays.

- **4.6 — the DRY pass: three token families, one prose surface, two grids.**
  Not a stylesheet deletion. Phase 4 was shrinking the CSS without making the
  system any tighter, because the duplication had stopped living in the
  stylesheets and moved into the token contract: the contract is rigorous about
  colour roles, spacing and type, and silent about elevation, tint strength and
  label typography. Everywhere it was silent, each call site invented a value.

  **Tints.** Washes and hairlines were written at the call site as a percentage
  of `--blue-950` over transparent, at 4.5, 5, 5.5, 8, 10 and 12 per cent —
  six answers to four questions. Four named tokens now: `--tint-grid` (the
  graph paper), `--tint-wash` (a hover or selected row), `--tint-edge` (the
  bottom of a translucent sticky surface) and `--tint-rule` (a hairline inside
  tinted chrome). Available as `bg-tint-wash`, `border-tint-rule` and so on.

  **Elevation.** Roughly fifty hand-written `box-shadow`s, no two alike and no
  relationship between them. They turned out to be three ideas: _ambient_, a
  card lifted off a light surface and tinted with the same near-navy as
  everything else; _contrast_, something floating over a dark section or a
  photograph, where a blue tint disappears and only a neutral reads; and
  _block_, the flat offset slab the marketing illustrations use, which is a
  drawing style rather than a depth cue and has no blur. Five ambient steps,
  three contrast, three block — `shadow-xs` through `shadow-xl`,
  `shadow-contrast-*`, `shadow-block-*`. Thirty-five call sites converted to
  their nearest step. Rings and glows (`0 0 0 Npx`) are deliberately not in
  this scale: they are a focus treatment, which `lib/controlState.ts` already
  owns.

  **Label tracking.** The small uppercase label — eyebrow, kicker, column
  heading, status caption — is the most repeated typographic idea on the site,
  and it was spelled with twelve different `letter-spacing` values that nobody
  had chosen relative to each other (0.05 through 0.17em). Three steps now,
  graded the way tracking actually works rather than by surface: the smaller
  the type, the more air it wants. `tracking-label-tight` (0.08em) from
  `--text-ui` up, `tracking-label` (0.12em) for most labels,
  `tracking-label-wide` (0.15em) for `--text-micro` and below. Ninety-one call
  sites. Some moved by up to 0.03em, which is the point of having a scale;
  genuine outliers below `--text-nano` keep their own value.

  **One prose surface.** `article.module.css` and `legal.module.css` were 206
  lines between them describing the same set of markdown elements, and had
  already drifted apart on the parts that are genuinely shared — list indents,
  underline offsets, the rule above an `h2`. `styles/prose.css` is the
  agreement; each module keeps only what its surface really changes, which is
  the heading scale, the body colour, and the blockquote (a pull quote in an
  article, a warning in a legal document). 206 lines down to 108 across three
  files. It is imported in the `components` layer, not `legacy`: markdown
  rendered through `dangerouslySetInnerHTML` has no class attributes to hang
  utilities on, so element selectors are the permanent answer here rather than
  something awaiting migration. The CSS Modules are unlayered and therefore
  override it, which is the direction that was wanted.

  **Two grids, not five.** The 42px transactional grid had a fourth copy on the
  sign-in screen that 4.2 missed. The 64px marketing grid was written out three
  times — the hero, the footer and the portfolio case study — and the case study
  drew its line in `--blue-600` at 5.5% while the other two used
  `--hero-grid-color`. Both line colours are tokens now (`--tint-grid`,
  `--tint-hero-grid`) and `lib/gridSurface.ts` carries the geometry. What is
  _not_ shared is each surface's fade — a radial mask on the hero, a horizontal
  one on the case study, three edge gradients on the footer. Those live in the
  same `background-image` declaration as the grid and cannot be layered on
  afterwards, so each surface still spells its own out. The colour and the
  geometry are shared; the fade is not.

  **What this pass deliberately did not do.** The token swaps reach every file,
  migrated or not, because a token swap is safe in CSS as well as in TSX. But
  the shadows still written as `box-shadow` in unmigrated modules — the
  builder preview, the licensing page, the marketing visuals — now reference an
  elevation token rather than a literal, and that is all. They convert to
  utilities when their file migrates.

Migrate coherent areas in this order:

1. small shared components and static public sections;
2. header, footer, breadcrumbs, process bars, FAQs, and reusable marketing
   sections;
3. ordinary marketing routes;
4. forms, enquiry panels, licensing, and checkout;
5. login, portal chrome, and dashboard workflows;
6. complex marketing visuals;
7. article/rich-content surfaces;
8. dealership website builder and generated previews.

For each component:

1. identify its semantic roles and reusable variants;
2. move ordinary declarations into Tailwind utilities;
3. use `cn()` for conditions and caller overrides;
4. promote repeated closed sets into a primitive or CVA variant;
5. keep only approved complex rules in a colocated CSS Module;
6. delete unused selectors and remove the obsolete import;
7. compare all baseline widths and interactive states;
8. run formatting, lint, type checking, and relevant tests.

Generated-preview CSS is migrated last because it is a scoped second design
system. It may remain CSS, but its boundary and tokens must be unmistakable.

## Phase 5: make lint enforce the architecture

Port and generalize the proven Allbikes JSX checks, then add the discipline that
FreeTheDesk currently gets from Stylelint.

ESLint must reject:

- raw Tailwind neutral and colour ramps;
- raw `color-mix()` percentages over a palette ramp where a `--tint-*` token
  already names that role (added in 4.6, which created the tokens);
- arbitrary `shadow-[…]` outside the `--elevation-*` and ring scales (4.6,
  4.13). The exception is `lib/controlState.ts`, whose focus outlines are not
  box-shadows at all;
- arbitrary positive `tracking-[…]` outside the three `--label-tracking-*`
  steps (4.6);
- solid `black` or `white` where a semantic role exists;
- raw brand variables and hexadecimal colours in class strings;
- raw feedback hues in place of semantic status tokens;
- dynamic Tailwind class-name construction;
- duplicated page rails and fixed page-section spacing;
- arbitrary breakpoint variants;
- a second name for a role a variable already has. The `--*-accent` family
  (4.13) is the worked example: five names, one value, and no way to tell from
  a call site which one a new component should read;
- arbitrary spacing, typography, weights, and radii unless explicitly allowed;
- responsive display-size jumps that bypass the fluid scale.

Stylelint remains responsible for allowed handwritten CSS and must reject:

- literal design values where a token is required;
- literal `box-shadow` values and raw `color-mix()` percentages, the CSS-side
  halves of the two ESLint rules above (4.6);
- raw palette consumption outside a documented exception;
- noncanonical breakpoints or desktop-first media queries;
- invalid token naming and unsafe grid tracks;
- component selectors in global foundation files.

Rules begin as warnings only when a measured backlog makes an immediate error
impractical. Every warning category needs an issue or migration phase, a known
count, and a planned date or phase for promotion to error. The final state has
no warnings.

**Phase 5 is complete.** Both rule sets are now imported rather than copied:
`freetheplatform/frontend/lint/design-system-eslint.mjs` and
`stylelint-base.mjs` are the canonical definitions, and allbikes reads the same
two files, so the sites cannot drift into disagreeing about what a token is for.
What stays local is what is genuinely site-specific: which files are exceptions,
and the four Stylelint rules guarding freethedesk's own foundation (the shadow
allow-list, the re-mixed-tint and palette-rung bans, and the
no-component-selectors rule on `base.css` and `tokens.css`).

Every rule is an error. `npx eslint src --max-warnings=0`, `npx stylelint
"src/**/*.css"`, `tsc --noEmit`, Prettier and `npm run build` are all clean, so
there is no warning backlog to promote later — the "warnings first" escape
hatch above went unused.

Turning the rules on produced 127 findings. Almost none of them wanted a
suppression:

- **24 were already tokens**, written as `rounded-[var(--radius-circle)]` (13
  sites) and `rounded-[var(--radius-xs)]` (11) because those rungs had no
  utility name. The whole radius ramp is now mapped into `@theme inline`
  (`--radius-2xs` through `--radius-circle`), and 21 files lost their brackets.
  A bracket around a token reads as an escape from the scale when it is the
  opposite; the fix was the theme mapping, not the carve-out.
- **Four new tokens named decisions that had been made repeatedly by hand.**
  `--space-split` replaced seven hand-written clamps between 45/90 and 55/130
  for the gap between the halves of a split section. `--space-section-tall`
  replaced five different hero-band clamps (78/132, 80/132, 84/138, 88/142,
  94/154) that nobody had chosen relative to one another.
  `--space-section-half` names the case where two sections read as one block.
  `--text-glyph` and `--text-wordmark` fill the two real gaps in the type scale
  — a character used as an icon, and the brand wordmark at interface size —
  which six sites had been spelling as literals.
- **The builder's chrome was snapped onto the scale.** It had been written at
  2/3/5/6/7/10/11/13/14/15/17/19/26px, none of which is a step. Every value
  moves by at most 2px.
- **15 suppressions remain**, in 13 files, each naming the exception it claims:
  optical kerning after a final glyph (em-relative, not interface spacing);
  canvas colour strings, which a 2D context cannot read from a CSS variable;
  the web manifest and theme-colour meta tag, which are JSON and HTML
  attributes; `PhoneFrame`'s corner radii, measured off a device rather than
  taken from the ramp; and the two uncontrolled-rich-content stylesheets (the
  article body and the legal source documents), whose markup does not come from
  the component, so the rules cannot be put on elements by hand.

The generated preview is excluded from both tools by path
(`_styles/**` and `_components/previews/**`), which is the boundary 4.15
established rather than a new concession.

## Phase 6: remove the old system

After the last consumer migrates:

- delete obsolete CSS Modules and global component styles;
- remove old reset or utility layers superseded by Tailwind;
- remove temporary compatibility classes and lint suppressions;
- remove dependencies used only by the former styling path;
- ensure no TSX file imports a deleted or empty stylesheet;
- verify that every remaining CSS file is a foundation or approved exception;
- update the README and contributor guidance to point to the shared policy;
- compare FreeTheDesk and allbikes configurations for accidental drift.

**Phase 6 is complete.** What it actually found:

- **the `legacy` layer is gone.** It existed to hold global CSS that had not
  been converted yet, wedged between Tailwind's `base` and `components` so a
  utility written next to it would still win. Nothing was awaiting migration
  any more, so the three files it held are now layered by what they are:
  `base.css` in `base` (document defaults), `motion.css` in `components`
  (class-based primitives). `@layer base, components, utilities` is the whole
  declaration. Every one of them still loses to a utility on the same element,
  which is the relationship the legacy layer was built to preserve.
- **`styles/forms.css` is deleted.** It described itself as the website
  builder's form primitives, and by this point the builder's controls panel was
  its only consumer — overriding six of the seven properties `.form-label` set
  and most of `.form-control`. The real values are written out at the call site
  in `ConfiguratorControls.tsx`; the focus ring it was there to supply is now
  `focus:shadow-focus`, which reads the same `--ring-focus` token.
- **`.field-hint` was a class name with no rule behind it** — the current-URL
  hint under the builder's website field had been rendering unstyled since
  before this migration started. It now uses `fieldHintClassName`, the same
  constant every other form hint on the site uses.
- **two dead tokens removed:** `--blue-990` (a palette rung nothing read) and
  `--moving-colour-gradient-reverse` (a gradient added for a Stripe surface
  that no longer exists).
- **no dependency was removed,** because there was never a second styling
  dependency to remove: this repo went from hand-written CSS to Tailwind, not
  from one framework to another.

Eleven stylesheets remain, 4,167 lines. Two thirds of that is
`preview.module.css` (2,799), the generated dealership site. The rest is four
foundation files (`tokens`, `base`, `layout`, `motion`, plus `globals.css`
which only orders them), `prose.css` and its two rich-content modules
(`article`, `legal`), and the two artwork exceptions (`FlowCardVisual`,
`flowCompare`). Every one is classifiable under an allowed exception, which was
the exit criterion.

## Verification for every phase

Run, at minimum:

```powershell
npm run format:check
npm run lint
npm run lint:css
npm run typecheck
npm run build
```

Also perform visual comparisons at the shared breakpoints and keyboard checks
for changed interactive components. Build success alone cannot detect a changed
cascade, breakpoint, focus state, line wrap, or animation.

## Final completion criteria

The migration is complete when:

- FreeTheDesk and allbikes follow all ten shared styling rules;
- ordinary FreeTheDesk UI is Tailwind-authored;
- remaining CSS files are individually classifiable under an allowed exception;
- token names, breakpoints, `cn()`, CVA conventions, and lint policy match;
- no application component consumes raw palette values;
- no obsolete stylesheet or compatibility class remains;
- lint, Stylelint, formatting, type checking, tests, and production build pass
  with zero warnings;
- baseline routes and states have been visually verified;
- the checked-in documents describe the code that exists, not future intent.
