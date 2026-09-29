/* Component registry: freetheplatform/frontend/registry/src/lib/author.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */

/**
 * The one author behind every site and article. Shared so `profileUrl` resolves one person to a crawler and the
 * name matches the visible byline. The middle name is in `additionalName` only, so it never shows in a byline or `founder`.
 * `profileUrl` is the author's own profile; replace it with an on-site author page when there is one (seo-standard.md section 3).
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
