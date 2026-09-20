/* Component registry: freetheplatform/frontend/registry/src/lib/author.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */

/**
 * The one person behind all three sites and their articles, declared once.
 *
 * This is in the registry because it is a *fact* whose whole value is that the
 * three copies agree: the shared `profileUrl` is what makes a crawler resolve
 * one person rather than three similarly-named ones, and the name has to match
 * the visible byline exactly or the schema corroborates nothing. Three
 * hand-kept copies of a constant that only works while they are identical is
 * the failure the registry exists to prevent.
 *
 * The middle name lives in `additionalName` so the full legal name is
 * available to a machine without "Daniel" appearing under an article or on the
 * Organization node's `founder`. `profileUrl` points at the author's own
 * profile, not any one business's; replace it with an on-site author page when
 * there is one. See seo-standard.md section 3.
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
