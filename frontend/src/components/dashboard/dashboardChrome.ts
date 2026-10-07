/**
 * The authenticated app shell's loading state. Kept beside `PortalShell` rather
 * than inside it because `/login` renders it too and must not have to import a
 * client component to do it.
 */

/** The full-screen "Loading…" placeholder shown before auth resolves. */
export const adminLoadingClassName =
  'flex min-h-screen items-center justify-center bg-surface-tint text-body text-text-muted';
