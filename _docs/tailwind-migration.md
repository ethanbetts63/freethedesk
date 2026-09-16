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
4. form controls, labels, help text, and validation messages;
5. cards, notices, badges, status indicators, and tables;
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
