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
   hooks — `app/portfolio/case-study.css` selects *around* them
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
5. cards, notices, badges, status indicators, and tables. In progress, one
   surface family at a time. **Notices are done:** `admin.css`'s
   `.admin-banner` / `.admin-banner-error` / `.admin-banner-warning` /
   `.admin-form-error` and `.admin-muted` rules are deleted (699 lines down to
   665) and replaced by `components/dashboard/AdminNotice.tsx`, a CVA with a
   `tone` (success/warning/danger) and a `size` (`banner`, which carries its
   own vertical rhythm, and `field`, the flush in-form error), across the 17
   files that rendered them. Three things worth recording: the old base class
   quietly *was* the success palette, so a neutral-looking
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
6. dialogs, checkout controls, and dashboard controls;
7. focus, disabled, loading, and reduced-motion states.

Replace global appearance classes such as `.primary-button` with React
components backed by CVA. Props use semantic names such as `primary`,
`secondary`, `danger`, and `success`; they do not expose palette names.

Exit criteria:

- consumers select typed variants rather than styling controls themselves;
- duplicate button/form/card declarations are removed;
- primitives behave identically across public pages and the dashboard;
- accessibility states match or improve on the baseline.

## Phase 4: migrate routes and component families

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
- solid `black` or `white` where a semantic role exists;
- raw brand variables and hexadecimal colours in class strings;
- raw feedback hues in place of semantic status tokens;
- dynamic Tailwind class-name construction;
- duplicated page rails and fixed page-section spacing;
- arbitrary breakpoint variants;
- arbitrary spacing, typography, weights, and radii unless explicitly allowed;
- responsive display-size jumps that bypass the fluid scale.

Stylelint remains responsible for allowed handwritten CSS and must reject:

- literal design values where a token is required;
- raw palette consumption outside a documented exception;
- noncanonical breakpoints or desktop-first media queries;
- invalid token naming and unsafe grid tracks;
- component selectors in global foundation files.

Rules begin as warnings only when a measured backlog makes an immediate error
impractical. Every warning category needs an issue or migration phase, a known
count, and a planned date or phase for promotion to error. The final state has
no warnings.

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
