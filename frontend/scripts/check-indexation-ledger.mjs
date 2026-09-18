#!/usr/bin/env node
/**
 * Reports every public route that carries no declared indexation policy.
 *
 * A route is accounted for if it appears in exactly one of: `PAGES` (listed in
 * the sitemap), `REDIRECT_STUBS` (a stub that serves no content), a pattern in
 * `DYNAMIC_ROUTE_FAMILIES` (an API/content-driven route family — see that
 * registry for the four states a family can declare), or the robots.txt
 * `DISALLOWED_ROUTES` (never crawled). Everything else is a route nobody has
 * made an indexation decision about, which is the gap that let
 * `/used-stock/unsubscribe/[token]` ship with zero policy on the allbikes side
 * — see its own check-indexation-ledger.mjs and the 2026-09-17 entry in
 * seo-standardisation.md.
 *
 * Build-failing as of 2026-09-17, matching allbikes: the report-only period
 * found only the one robots.txt bug (bare /dashboard, /portal, /seo-portal),
 * already fixed, so there is no backlog left for a red build to punish.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(root, 'src/app');

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

function stringArrayFrom(source, name) {
  const start = source.indexOf(`const ${name}`);
  if (start === -1) return [];
  const close = source.indexOf('];', start);
  const body = source.slice(start, close === -1 ? undefined : close);
  return [...body.matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

const pagesSource = readFileSync(join(root, 'src/lib/pages.ts'), 'utf8');
const robotsSource = readFileSync(join(root, 'src/app/robots.txt/route.ts'), 'utf8');

// PAGES is an object keyed by route, not an array — pull its top-level keys.
const pagesBlockStart = pagesSource.indexOf('export const PAGES');
const pagesBlockEnd = pagesSource.indexOf('} as const satisfies', pagesBlockStart);
const pagesBlock = pagesSource.slice(
  pagesBlockStart,
  pagesBlockEnd === -1 ? undefined : pagesBlockEnd,
);
const listed = [...pagesBlock.matchAll(/^\s*'([^']+)':\s*\{/gm)].map((m) => m[1]);

const redirects = stringArrayFrom(pagesSource, 'REDIRECT_STUBS');
const disallowed = stringArrayFrom(robotsSource, 'DISALLOWED_ROUTES');

const dynamicFamiliesBlock = pagesSource.slice(
  pagesSource.indexOf('export const DYNAMIC_ROUTE_FAMILIES'),
);
const dynamicFamilies = [...dynamicFamiliesBlock.matchAll(/pattern:\s*'([^']+)'/g)].map(
  (m) => m[1],
);

function isDisallowed(route) {
  return disallowed.some((entry) => {
    const trimmed = entry.replace(/\/$/, '');
    return route === trimmed || route.startsWith(entry);
  });
}

const routes = routeFiles();
const undeclared = [];
for (const route of routes.keys()) {
  if (listed.includes(route)) continue;
  if (redirects.includes(route)) continue;
  if (dynamicFamilies.includes(route)) continue;
  if (isDisallowed(route)) continue;
  undeclared.push(route);
}

if (undeclared.length) {
  console.error(
    [
      `check-indexation-ledger: ${undeclared.length} route(s) with no declared indexation policy:`,
      ...undeclared.map((route) => `  ${route}`),
      '',
      'Declare each one in PAGES, REDIRECT_STUBS or DYNAMIC_ROUTE_FAMILIES (src/lib/pages.ts),',
      'or add it to DISALLOWED_ROUTES (src/app/robots.txt/route.ts).',
    ].join('\n'),
  );
  process.exit(1);
} else {
  console.log(
    `check-indexation-ledger: all ${routes.size} routes have a declared indexation policy.`,
  );
}
