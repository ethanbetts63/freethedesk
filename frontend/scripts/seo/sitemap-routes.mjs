/**
 * Fails the build when the sitemap-listed registry drifts from the app tree.
 *
 * `indexation-ledger.mjs` guards the inward direction — a route nobody
 * declared. This is the outward direction, and it catches the half that
 * silently costs traffic:
 *
 *  - A listed route that no longer resolves to a page. `/bikes` sat in
 *    allbikes' list after it had started redirecting to `/patrol`, so the
 *    sitemap spent crawl budget advertising a 301.
 *  - A listed route whose page is only a `redirect`/`permanentRedirect` stub —
 *    it looks like a real page in the tree but is a hop to somewhere else. A
 *    sitemap should list the destination, not the hop.
 *
 * `STATIC_PAGES` is imported rather than scraped, which matters more here than
 * anywhere else: bloomprint spreads one entry per article into the registry at
 * module evaluation, so 11 of its 23 listed routes are not literal keys in the
 * source at all. A text scan could not see them, and never checked them.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { registerTsLoader } from './ts-loader.mjs';
import { discoverRoutes, resolveRoute } from './app-routes.mjs';

const REDIRECT_STUB = /\bpermanentRedirect\s*\(|\bredirect\s*\(/;

/**
 * @param {object} options
 * @param {string} options.root Absolute path to the repo's `frontend`.
 */
export async function checkSitemapRoutes({ root }) {
  const src = join(root, 'src');
  registerTsLoader(src);

  const pages = await import(pathToFileURL(join(src, 'lib/pages.ts')).href);
  const declared = Object.keys(pages.STATIC_PAGES);
  const routes = discoverRoutes(join(src, 'app'));

  const failures = [];

  if (!declared.length) {
    failures.push('STATIC_PAGES is empty — has the registry changed shape?');
  }

  const missing = declared.filter((route) => !resolveRoute(routes, route));
  if (missing.length) {
    failures.push(
      `These routes are in the sitemap but have no page in src/app:\n    ${missing.join('\n    ')}\n` +
        '  Remove them, or restore the page.',
    );
  }

  const redirects = declared.filter((route) => {
    const file = resolveRoute(routes, route);
    return file && REDIRECT_STUB.test(readFileSync(file, 'utf8'));
  });
  if (redirects.length) {
    failures.push(
      `These routes are in the sitemap but their page only redirects:\n    ${redirects.join('\n    ')}\n` +
        '  A sitemap should list the destination, not the hop.',
    );
  }

  if (failures.length) {
    console.error('\ncheck-sitemap-routes failed:\n');
    for (const failure of failures) console.error(`• ${failure}\n`);
    process.exit(1);
  }

  console.log(`check-sitemap-routes: all ${declared.length} listed routes resolve to real pages.`);
}
