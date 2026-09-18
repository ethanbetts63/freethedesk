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
| `--text-caption-xs` … `--text-body-sm` (the five shared fixed interface sizes) | Identical values; allbikes' comment states this explicitly ("mirror freethedesk exactly"). Both sides renamed off the old nano/tiny/label/micro/meta/ui/small ladder in the same pass: every name is now a role or a role plus an explicit step. `--text-body` and `--text-lead` exist in both but are **not** shared values — see the open item below. |
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

**Done: the fluid heading scale now uses role names, except its bottom two
rungs.** `text-step-2`/`text-step-3` became `text-title-sm`/`text-title`
(identical clamps to allbikes, so the names transfer outright), and
`text-display-1..6` became
`text-display-sm`/`text-display`/`text-display-md`/`text-display-lg`/`text-hero`/`text-hero-lg`.
The clamps behind the display rungs are *not* allbikes' — freethedesk's
ladder starts lower (1.75rem vs 2.25rem) and runs two rungs higher — and
they deliberately stay that way. A desk UI and a marketing site share a
vocabulary, not a scale. `text-step-0` and `text-step-1` are the exception,
for the reason below.

**Open: `text-step-0` and `text-step-1` have no free role name, because
`--text-body` means two different sizes across the two repos.** allbikes'
`--text-body` **is** `--step-0` — the fluid marketing paragraph size,
~16–17px. freethedesk's `--text-body` is a fixed 0.84rem (13.44px), the
dense desk-UI default, and its `--text-lead` is a fixed 0.92rem. So the two
names allbikes would hand to `step-0` and `step-1` are already spent here on
rungs 25% smaller. That is the last naming inconsistency between the repos,
and it is worse than the ordinals were: a shared vocabulary where the
most-used word means two things.

Three ways out, none of them free:

1. **Rename freethedesk's fluid rungs.** `text-step-0` → `text-prose`,
   `text-step-1` → `text-prose-lg`. 42 call sites, no visual change, and
   the two repos still disagree about what `body` means.
2. **Rename freethedesk's fixed rungs.** The dense ladder shifts down a name
   (`body` → something like `text-dense`), `step-0` takes `body`, and the
   repos finally agree. Touches far more call sites and needs a name for the
   dense default that isn't a magnitude word.
3. **Accept the divergence** and document `--text-body` as per-repo. Cheapest
   now, and it quietly contradicts the point of a shared vocabulary.

Option 1 is the recommendation: it is the small move, it makes freethedesk
internally consistent, and it leaves the harder `body` question to be settled
once rather than half-settled twice.

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
