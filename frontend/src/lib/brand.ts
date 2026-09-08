/**
 * The brand accent as a JavaScript literal.
 *
 * Stripe's Appearance API takes a colour string and cannot read a CSS custom
 * property, so this one value has to exist outside the stylesheet. It mirrors
 * `--brand-accent` in globals.css — change both together; nothing else in the
 * codebase should carry this hex.
 */
export const BRAND_ACCENT = "#247ec9";

/** Body text colour inside Stripe's iframe, mirroring `--text`. */
export const BRAND_INK = "#0d1c29";
