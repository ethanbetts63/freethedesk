#!/usr/bin/env node
/**
 * Fails the build when the sitemap-listed half of PAGES drifts from the app.
 *
 * Ported from allbikes' script of the same name. FTD's `PAGES` (lib/pages.ts)
 * is one object per route rather than a flat `STATIC_PAGES` map, and only
 * entries carrying a `sitemap` field are actually listed — so "declared" here
 * means "has a `sitemap:` field", not "is a PAGES key".
 *
 * Catches two directions of drift:
 *
 *  - A listed route that no longer resolves to a page.
 *  - A listed route that resolves only to a `redirect`/`permanentRedirect`
 *    stub — looks like a real page in the tree but is a hop to somewhere
 *    else. `/blog` and `/blog/[slug]` are stubs of this shape and are
 *    correctly absent from PAGES entirely.
 *
 * It does NOT check the other direction — a new public route nobody added to
 * any bucket. That's `check-indexation-ledger.mjs`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(root, 'src/app');

/** Every `page.tsx` in the app tree, as a route: groups stripped, `/` for the root. */
function routeFiles(dir = appDir, segments = []) {
  const found = new Map();
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      const next = /^\(.*\)$/.test(entry) ? segments : [...segments, entry];
      for (const [route, file] of routeFiles(full, next)) found.set(route, file);
    } else if (entry === 'page.tsx') {
      found.set(`/${segments.join('/')}`.replace(/\/$/, '') || '/', full);
    }
  }
  return found;
}

const routes = routeFiles();

const pagesSource = readFileSync(join(root, 'src/lib/pages.ts'), 'utf8');
const pagesBlockStart = pagesSource.indexOf('export const PAGES');
const pagesBlockEnd = pagesSource.indexOf('} as const satisfies', pagesBlockStart);
const pagesBlock = pagesSource.slice(pagesBlockStart, pagesBlockEnd === -1 ? undefined : pagesBlockEnd);

const keyMatches = [...pagesBlock.matchAll(/^\s*'([^']+)':\s*\{/gm)];
const declared = keyMatches
  .map((match, index) => {
    const start = match.index;
    const end = keyMatches[index + 1]?.index ?? pagesBlock.length;
    const entry = pagesBlock.slice(start, end);
    return { route: match[1], listed: /\bsitemap:\s*\{/.test(entry) };
  })
  .filter((page) => page.listed)
  .map((page) => page.route);

const failures = [];

if (!declared.length) {
  failures.push('No sitemap-listed routes parsed out of PAGES — has the registry changed shape?');
}

const missing = declared.filter((route) => !routes.has(route));
if (missing.length) {
  failures.push(
    `These routes are in the sitemap but have no page in src/app:\n    ${missing.join('\n    ')}\n` +
      `  Remove them, or restore the page.`,
  );
}

const redirects = declared.filter((route) => {
  const file = routes.get(route);
  return file && /\bpermanentRedirect\s*\(|\bredirect\s*\(/.test(readFileSync(file, 'utf8'));
});
if (redirects.length) {
  failures.push(
    `These routes are in the sitemap but their page only redirects:\n    ${redirects.join('\n    ')}\n` +
      `  A sitemap should list the destination, not the hop.`,
  );
}

if (failures.length) {
  console.error('\ncheck-sitemap-routes failed:\n');
  for (const f of failures) console.error(`• ${f}\n`);
  process.exit(1);
}
console.log(`check-sitemap-routes: all ${declared.length} sitemap-listed routes resolve to real pages.`);
