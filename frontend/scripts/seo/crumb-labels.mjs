/**
 * Fails the build when an indexed route has no breadcrumb name. Trail and `BreadcrumbList` come from the same list,
 * so an omission does not throw: it quietly shortens both, to `Home` or to the full SEO title.
 *
 * Two shapes: allbikes and bloomprint keep a separate `lib/crumbs` table (so the Client Component band does not ship
 * every meta description; pass `crumbsPath`); freethedesk carries `label` on the page record (omit it).
 * Noindex routes, redirect stubs and disallowed routes are absent from the page registry and need no name.
 *
 * Reads source text, not imported values, keeping the check out of the app's module graph. A quoting style it misses
 * skips a route, never gives a wrong answer, and a renamed declaration is reported explicitly.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Route keys out of a `Record<string, ...>` object literal. */
function routeKeys(source, declaration) {
  const start = source.indexOf(declaration);
  if (start === -1) return null;
  return [...source.slice(start).matchAll(/^\s*'([^']+)':\s*\{/gm)].map((match) => match[1]);
}

/**
 * @param {object} options
 * @param {string} options.root         Absolute path to the repo's `frontend`.
 * @param {string} [options.pagesPath]  Repo-relative path to the page registry.
 * @param {string} [options.crumbsPath] Repo-relative path to a separate crumb
 *                                      table. Omit when the page record itself
 *                                      carries `label`.
 */
export function checkCrumbLabels({ root, pagesPath = 'src/lib/pages.ts', crumbsPath }) {
  const pagesSource = readFileSync(join(root, pagesPath), 'utf8');
  const indexed = routeKeys(pagesSource, 'export const STATIC_PAGES');

  if (!indexed?.length) {
    console.error(
      `\ncheck-crumb-labels: parsed no routes out of STATIC_PAGES in ${pagesPath}.` +
        '\n  Has that declaration been renamed?\n',
    );
    process.exit(1);
  }

  const failures = crumbsPath
    ? separateTable(root, crumbsPath, indexed)
    : labelOnEachRecord(pagesSource, indexed);

  if (failures.length) {
    console.error('\ncheck-crumb-labels failed:\n');
    for (const failure of failures) console.error(`• ${failure}\n`);
    process.exit(1);
  }

  console.log(`check-crumb-labels: all ${indexed.length - 1} indexed routes carry a crumb.`);
}

function separateTable(root, crumbsPath, indexed) {
  const crumbSource = readFileSync(join(root, crumbsPath), 'utf8');
  const crumbs = routeKeys(crumbSource, 'export const CRUMBS');

  if (!crumbs?.length) {
    console.error(
      `\ncheck-crumb-labels: parsed no routes out of CRUMBS in ${crumbsPath}.` +
        '\n  Has that declaration been renamed?\n',
    );
    process.exit(1);
  }

  const failures = [];

  const missing = indexed.filter((route) => route !== '/' && !crumbs.includes(route));
  if (missing.length) {
    failures.push(
      `These indexed routes have no crumb in ${crumbsPath}, so they render no\n` +
        `  trail and emit a one-item BreadcrumbList:\n    ${missing.join('\n    ')}`,
    );
  }

  const parents = [...crumbSource.matchAll(/parent:\s*'([^']+)'/g)].map((match) => match[1]);
  const orphans = [...new Set(parents)].filter((parent) => !crumbs.includes(parent));
  if (orphans.length) {
    failures.push(
      `These crumbs name a parent that has no crumb of its own, which silently\n` +
        `  truncates the trail at that point:\n    ${orphans.join('\n    ')}`,
    );
  }

  return failures;
}

function labelOnEachRecord(pagesSource, indexed) {
  const start = pagesSource.indexOf('export const STATIC_PAGES');
  const body = pagesSource.slice(start);
  const entries = [...body.matchAll(/^\s*'([^']+)':\s*\{/gm)];

  // Each record runs from its route key to the next, so a missing `label` is absent from that slice.
  const unlabelled = entries
    .filter((entry, index) => {
      const to = index + 1 < entries.length ? entries[index + 1].index : body.length;
      return !/^\s*label:/m.test(body.slice(entry.index, to));
    })
    .map((entry) => entry[1]);

  return unlabelled.length
    ? [
        'These routes have no `label`, so their breadcrumb falls back to the full\n' +
          `  SEO title, on the page and in the search result:\n    ${unlabelled.join('\n    ')}`,
      ]
    : [];
}
