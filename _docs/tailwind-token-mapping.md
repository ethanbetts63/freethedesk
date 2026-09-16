# Tailwind migration — Phase 2 token mapping

Deliverable for `tailwind-migration.md` Phase 2. Compares
`freethedesk/frontend/src/styles/tokens.css` against
`allbikes/frontend/src/styles/tokens.css`, token by token. Captured 2026-09-16.

## Already reconciled (identical name, role matches by design)

Confirmed byte-identical or intentionally-equal-by-comment in both files —
no action needed:

| Token family | Note |
|---|---|
| `--space-4xs` … `--space-3xl` | Identical values in both files |
| `--radius-2xs` … `--radius-pill`, `--radius-circle` | Identical |
| `--tap-min` | Identical (44px) |
| `--text-nano` … `--text-lead` (the ten fixed interface sizes) | Identical values; allbikes' comment states this explicitly ("mirror freethedesk exactly") |
| `--weight-control` | Identical (700) |
| `--surface-page/-tint/-tint-strong/-dark/-dark-soft/-dark-hover/-inverse` | Same names, same roles, per-brand values |
| `--text-primary/-secondary/-muted` | Same names, same roles |
| `--text-on-dark-muted` | Same name, same role, same value shape |
| `--border-default/-strong/-on-dark` | Same names, same roles |
| `--action-primary` | Same name, same role |
| `--focus-ring` | Same name, same role (freethedesk's is opacity-based, allbikes' is solid — values differ, role identical) |
| `--surface-success/-border-success/-fill-success/-text-success` | Same names, same roles |
| `--surface-warning/-border-warning/-fill-warning/-text-warning` | Same names, same roles |
| `--surface-danger/-border-danger/-fill-danger/-text-danger/-text-danger-on-dark` | Same names, same roles |
| `--space-section` | Same name; freethedesk previously called this `--section-space` before converging (see `tokens.css` comment) |

## Synonyms found — same meaning, different name

| freethedesk | allbikes | Resolution |
|---|---|---|
| `--text-on-dark` (white, paired with `bg-surface-dark`, 34 call sites) | `--text-on-brand` (white, paired with `bg-surface-dark`, 139 call sites — confirmed via grep, not just declaration) | **Same role**: readable text on an inverted/dark surface. Different name only because allbikes originally named it for brand-button text and later reused it for dark sections. Not renaming either side in this pass — 173 combined call sites is real migration weight, and Phase 2's own rule is "do not mechanically rename based on equal colour values" without confirming every call site agrees on meaning first. Recommend allbikes eventually renames `text-on-brand` → `text-on-dark` (freethedesk's name is more accurate to its current usage) as a Phase 4/5 cleanup, not blocking freethedesk's migration. |

## Roles one app has and the other doesn't

| Token | Only in | Verdict |
|---|---|---|
| `--surface-info/-border-info/-text-info/-fill-info` | allbikes only | Gap, not noise: allbikes has 4 feedback roles (success/warning/danger/**info**), freethedesk has 3. freethedesk has no neutral/informational banner role today — add it only when a real "info" banner ships, don't pre-build it. |
| `--surface-navy`, `--text-control`, `--text-subtle`, `--text-on-dark-subtle`, `--text-action`, `--line-strong`, `--border-subtle`, `--border-on-dark-strong`, `--accent`, `--accent-on-dark`, `--accent-on-dark-soft`, `--section-number`, `--section-number-on-dark` | freethedesk only | Genuine freethedesk product needs (a second dark surface tone, dense-form control text, decorative sky accents, numbered section markers). No allbikes equivalent to converge onto — document as freethedesk-only, matching the migration doc's own rule for this case. |
| `--space-section-compact`, `--space-section-tight` | allbikes only | Two additional vertical-rhythm rungs for dense bands. freethedesk doesn't need these today (no equivalent dense-band pattern outside the dashboard, which uses its own admin.css rhythm). Add only if a real freethedesk section needs one — not speculatively. |
| `--link`/`--link-hover` | allbikes only | freethedesk has no dedicated link-color token; inline link styling goes through `--text-action` instead. Different shape, same job — not a gap requiring action, just a naming difference to know about before writing shared link components. |
| `--category-1`, `--category-2`, `--surface-category-1[-hover]` | allbikes only | allbikes' pattern for genuinely categorical (non-feedback) color coding. See below — freethedesk has the same need, solved differently. |

## Needs a decision before Phase 3/4 touches it

**freethedesk's fluid heading scale is exposed under raw `step-*`/`display-*`
names, not semantic ones.** `tokens.css`'s own comment already flags this:
"exposed under its existing step/display names rather than renamed to
allbikes' title/display-sm/hero vocabulary — that mapping needs a per-usage
check this pass didn't do." That per-usage check is real work: every
`text-step-0`/`text-step-1`/`text-step-2`/`text-step-3`/`text-display-1..6`
call site needs to be read for what it's actually being used for (a lead
paragraph? a section title? a hero?) before it can take a semantic name like
allbikes' `text-lead`/`text-title`/`text-display`/`text-hero`. Not done in
this pass — no visual baseline exists yet to safely verify a rename didn't
shift anything (Phase 0's screenshot capture is still pending), and it's
naturally the kind of decision that happens *while* converting typography
primitives in Phase 3, one call site at a time, not as a bulk rename ahead of
it.

**freethedesk's fixed `--text-body` (0.84rem, dense-UI scale) and its fluid
`--step-0` are two different things that could collide under allbikes'
naming.** allbikes' `--text-body` **is** `--step-0` (the fluid marketing
paragraph size, ~16–17px) — a completely different value and purpose from
freethedesk's fixed 13.44px dense-UI body text. If freethedesk's `step-0`
later takes the semantic name `text-body` (following allbikes), it collides
with the existing fixed `--text-body` token. Whoever does the Phase 3 rename
needs to pick a different semantic name for one of the two (freethedesk's
existing marketing pages are sparse enough — mostly the public site, not the
dense desk UI — that renaming the *fluid* one to something like `text-prose`
or keeping the dense-UI `text-body` as-is and giving the fluid scale
allbikes-style names for everything except `body` is the likely shape, but
this needs the same per-usage read as the step/display renaming above).

**Status enum colours are already correctly reconciled, just not in
allbikes' naming pattern.** freethedesk's CRM lead statuses
(`--status-new/-contacted/-qualified/-won/-closed/-spam/-suspended`) already
follow the same principle as allbikes' `--category-1/-2`: `new`/`won`/`spam`
borrow feedback colours because they genuinely are feedback states (warning/
success/danger), while `contacted`/`qualified`/`closed`/`suspended` get their
own non-feedback colours because they're categorical, not good/bad — this is
stated directly in `tokens.css`'s own comment. The only gap versus allbikes
is stylistic: allbikes names its categorical colours `--category-1`/
`--category-2` with a matching `--surface-category-1[-hover]` family;
freethedesk's categorical status colours are inline literals/ramp
references with no matching surface tint. Not a correctness issue, just a
naming-convention gap — worth adopting the `--category-N` pattern if/when a
categorical status gets its own badge surface, not urgent today.

## Direct palette-ramp consumption (`var(--slate-*)`, `var(--blue-*)`, `var(--sky-*)`)

21 files still reference the raw palette directly instead of a semantic
alias — every one of them is a file already scheduled for Phase 4 conversion
or already excluded as `generated-preview` (see
`tailwind-migration-inventory.md`). This resolves naturally as each file
converts to Tailwind utilities in Phase 4 (a converted component reaches for
`bg-surface-tint`, not `var(--slate-50)`) — no separate remediation pass
needed.

One was resolved earlier than that, in Phase 3.3: the dashboard secondary
button's hover border was `var(--slate-400)`, one step darker than its
`--border-strong` resting state. Converting that button to Tailwind would
have carried the raw ramp into a new component, so the step became a named
role, `--border-strong-hover`, following the existing `--surface-dark` /
`--surface-dark-hover` pattern.

Phase 3.4 resolved a second one the same way. The portal form controls drew
their focus border from `var(--blue-600)`, and so did both inputs on the login
page. That value is not a new colour — it is exactly `--action-primary`, the
interactive colour — so it became `--border-focus: var(--action-primary)`: a
role naming what the border *means*, sitting beside `--focus-ring`, which is
the halo drawn outside it. Three raw-ramp call sites went with it. The
remaining 18 files still resolve during Phase 4.

## Phase 2 exit criteria

| Criterion | Status |
|---|---|
| Both token files expose the same cross-site semantic and scale vocabulary | Mostly — see synonym and gap tables above. `text-on-dark`/`text-on-brand` and the step/display naming are the two real open items, both deferred to Phase 3/4 for the reasons stated. |
| Site-only tokens are documented as genuine product needs | Done — see "Roles one app has and the other doesn't" |
| Application components no longer consume raw palette ramps | Not yet — tracked, resolves per-file during Phase 4, not a Phase 2 blocker |
| The token contract accurately describes the implementation rather than an intended future state | This document + `tokens.css`'s own inline comments now do |
