/**
 * The two graph-paper grids the site draws, and nothing else may draw a third.
 *
 * The 42px one belongs to the transactional surfaces. Four of them drew it — the checkout panel, the post-payment
 * screen, the legal document page and the sign-in screen — each with its own
 * copy of the same two linear gradients, at 4.5%, 5% and 5.5%. The line colour
 * is now `--tint-grid`, one value, named in the token contract.
 *
 * The 64px one belongs to the marketing pages: wider, fainter, bluer, meant to
 * read as paper rather than as a transaction grid. Its line is `--tint-hero-grid`.
 * The two are deliberately separate drawings, not one drawing at two sizes.
 *
 * What is *not* shared is what each surface fades the grid out with — a radial
 * mask on the hero, a horizontal one on a case study, three edge gradients on
 * the footer. Those are part of the same `background-image` declaration as the
 * grid itself and cannot be layered on afterwards, so each surface still spells
 * its own out. The colour and the geometry are shared; the fade is not.
 *
 * The two exports are spelled out rather than derived from a shared fragment
 * because Tailwind compiles only the class strings it can read in the source.
 * A string built at runtime produces no CSS at all, silently.
 */

/**
 * For a surface that can spare a dedicated element: an `aria-hidden` div placed
 * before the content, so the grid paints underneath it without the content
 * needing a stacking context of its own.
 */
export const gridPaperClassName =
  'pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--tint-grid)_1px,transparent_1px),linear-gradient(90deg,var(--tint-grid)_1px,transparent_1px)] [background-size:42px_42px]';

/**
 * For a surface that cannot: the same layer as `::after`. It comes after the
 * content in paint order, so anything meant to sit above it needs its own
 * positioning — which on the checkout both cards already have.
 *
 * `pointer-events-none` was on the checkout panel's copy and not on the
 * confirmation screen's. It is kept: an overlay that can never intercept a
 * click is the behaviour both want.
 */
export const gridPaperAfterClassName =
  "after:pointer-events-none after:absolute after:inset-0 after:content-[''] after:[background-image:linear-gradient(var(--tint-grid)_1px,transparent_1px),linear-gradient(90deg,var(--tint-grid)_1px,transparent_1px)] after:[background-size:42px_42px]";

/**
 * The 64px marketing grid, for a surface that can spare a dedicated element.
 * Callers add their own fade — a mask, usually — on top.
 */
export const heroGridClassName =
  'pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--tint-hero-grid)_1px,transparent_1px),linear-gradient(90deg,var(--tint-hero-grid)_1px,transparent_1px)] [background-size:var(--hero-grid-size)_var(--hero-grid-size)]';

/**
 * The 42px grid as `::before`, for a surface whose content already sits in its
 * own stacking context above it.
 */
export const gridPaperBeforeClassName =
  "before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:[background-image:linear-gradient(var(--tint-grid)_1px,transparent_1px),linear-gradient(90deg,var(--tint-grid)_1px,transparent_1px)] before:[background-size:42px_42px]";
