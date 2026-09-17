/**
 * The authenticated app shell's chrome. Kept beside `PortalShell` rather than
 * inside it because `/login` renders the loading state too and must not have to
 * import a client component to do it.
 */

/**
 * The hairline that separates blocks inside the tinted sidebar. Not
 * `--border-default`: on `--surface-tint-strong` that grey reads as a hard
 * rule, and these are meant to be felt rather than seen. A tint of the same
 * near-black the chrome is built from.
 */
export const chromeHairlineClassName = 'border-tint-rule';

/** The full-screen "Loading…" placeholder shown before auth resolves. */
export const adminLoadingClassName =
  'flex min-h-screen items-center justify-center bg-surface-tint text-body text-text-muted';
