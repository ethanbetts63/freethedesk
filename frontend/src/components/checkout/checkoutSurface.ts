/**
 * The 42px graph-paper grid drawn over `SignalFlow` on the checkout panel and
 * on the post-payment screen. Both files carried their own copy of the same
 * three arbitrary utilities; this is that copy, once.
 *
 * `--blue-950` is a raw ramp value rather than a semantic token on purpose.
 * The role here is "a barely-visible rule on a tinted surface", and the token
 * contract has no line colour for that: `--line-strong` is the near-black used
 * for real dividers, and `--surface-dark` is the same ramp step named for a
 * background, which would be a lie about what this paints. It stays raw until
 * the contract grows a name for it.
 *
 * `pointer-events-none` was on the checkout panel's copy and not on the
 * confirmation screen's. It is kept: the confirmation card already sits in its
 * own stacking context above this layer, so nothing changes there today, and an
 * overlay that can never intercept a click is the behaviour both want.
 */
export const checkoutGridClassName = [
  "after:absolute after:inset-0 after:pointer-events-none after:content-['']",
  'after:[background-image:linear-gradient(color-mix(in_srgb,var(--blue-950)_5.5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--blue-950)_5.5%,transparent)_1px,transparent_1px)]',
  'after:[background-size:42px_42px]',
].join(' ');
