/**
 * The 42px graph-paper grid. Three surfaces drew it — the checkout panel, the
 * post-payment screen and the legal document page — each with its own copy of
 * the same two linear gradients, and the legal page's copy sat at 4.5% where
 * the checkout's sat at 5.5%. They are one value now: 5.5%. The difference was
 * one percent of alpha on a rule already at the edge of visibility, and two
 * answers to "how faint is the grid" is the kind of drift this phase exists to
 * remove.
 *
 * `--blue-950` is a raw ramp value rather than a semantic token on purpose.
 * The role here is "a barely-visible rule on a tinted surface", and the token
 * contract has no line colour for that: `--line-strong` is the near-black used
 * for real dividers, and `--surface-dark` is the same ramp step named for a
 * background, which would be a lie about what this paints. It stays raw until
 * the contract grows a name for it.
 *
 * The hero and footer draw a different grid — `--hero-grid-size`, 64px, a
 * bluer line — and are deliberately not folded in here. That one belongs to the
 * marketing pages' sense of scale; this one to the transactional surfaces.
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
  'pointer-events-none absolute inset-0 [background-image:linear-gradient(color-mix(in_srgb,var(--blue-950)_5.5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--blue-950)_5.5%,transparent)_1px,transparent_1px)] [background-size:42px_42px]';

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
  "after:pointer-events-none after:absolute after:inset-0 after:content-[''] after:[background-image:linear-gradient(color-mix(in_srgb,var(--blue-950)_5.5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--blue-950)_5.5%,transparent)_1px,transparent_1px)] after:[background-size:42px_42px]";
