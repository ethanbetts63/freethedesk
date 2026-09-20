#!/usr/bin/env node
/**
 * Asserts that every route in the page registry carries a breadcrumb `label`.
 *
 * `breadcrumbItemsFor` falls back to `title` when a label is missing, and the
 * same list feeds the visible trail and the `BreadcrumbList` schema. So an
 * omission does not throw — it quietly puts "Fire your admin | Online
 * Licensing & Digital Dealerships Australia, Perth" in a breadcrumb, on the
 * page and in the SERP line under the URL. That is the failure a ledger is
 * for: silent, and invisible until someone reads the search result.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'src/lib/pages.ts'), 'utf8');

const start = source.indexOf('export const STATIC_PAGES');
if (start === -1) {
  console.error('\ncheck-crumb-labels: no STATIC_PAGES declaration. Has it been renamed?\n');
  process.exit(1);
}

// Each record runs from its route key to the next one, so a missing `label`
// is a property absent from that slice rather than from the file as a whole.
const body = source.slice(start);
const entries = [...body.matchAll(/^\s*'([^']+)':\s*\{/gm)];

if (!entries.length) {
  console.error('\ncheck-crumb-labels: parsed no routes out of STATIC_PAGES.\n');
  process.exit(1);
}

const unlabelled = entries
  .filter((entry, index) => {
    const from = entry.index;
    const to = index + 1 < entries.length ? entries[index + 1].index : body.length;
    return !/^\s*label:/m.test(body.slice(from, to));
  })
  .map((entry) => entry[1]);

if (unlabelled.length) {
  console.error(
    '\ncheck-crumb-labels failed:\n\n' +
      '• These routes have no `label`, so their breadcrumb falls back to the full\n' +
      `  SEO title, on the page and in the search result:\n    ${unlabelled.join('\n    ')}\n`,
  );
  process.exit(1);
}

console.log(`check-crumb-labels: all ${entries.length} routes carry a breadcrumb label.`);
