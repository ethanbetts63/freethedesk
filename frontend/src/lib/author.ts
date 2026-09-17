/**
 * The one person behind freethedesk and its guides, declared once.
 *
 * Spelled identically here and in allbikes' `lib/author.ts` — the same
 * `profileUrl` is what ties both sites' references to one person rather than
 * two similarly-named ones. The middle name lives in `additionalName` so the
 * full legal name is available to a machine without "Daniel" appearing under
 * an article or on the Organization node's `founder`.
 */
export const AUTHOR = {
  name: 'Ethan Betts-Ingram',
  givenName: 'Ethan',
  additionalName: 'Daniel',
  familyName: 'Betts-Ingram',
  profileUrl: 'https://www.instagram.com/ethan.betts.ingram/',
} as const;

/** The byline, for article metadata and anywhere it is rendered. */
export const AUTHOR_NAME = AUTHOR.name;
