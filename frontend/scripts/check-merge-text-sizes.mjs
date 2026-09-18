#!/usr/bin/env node
/**
 * Fails the build when `cn()`'s text-size list drifts from tokens.css.
 *
 * `tailwind-merge` is a runtime JavaScript library and the theme is CSS: it
 * never sees the stylesheet. Its whole job is knowing that `text-small` and
 * `text-step-2` are the same group (later wins, earlier is dropped) while
 * `text-text-primary` is a different one (both survive) — and it does that from
 * a hardcoded table of Tailwind's stock class names. Every custom `--text-*`
 * token generates a `text-*` utility it has never heard of, and its fallback
 * for an unrecognised `text-*` is "probably a colour". So `cn('text-glyph',
 * 'text-text-primary')` sees two colours, keeps the last, and silently drops
 * the size.
 *
 * `lib/utils.ts` therefore has to restate the names, and a restatement kept by
 * hand drifts: `--text-glyph` and `--text-wordmark` were added to tokens.css
 * and missed here, which is what this script exists to have caught. The
 * duplication is inherent to pairing a JS class merger with CSS-first config.
 * Remembering it is not.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const tokens = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8');
const utils = readFileSync(join(root, 'src/lib/utils.ts'), 'utf8');

/**
 * Only the `@theme inline` block: a `--text-*` defined on `:root` alone is a
 * value for hand-written CSS to read and generates no utility, so it is not
 * tailwind-merge's problem.
 */
const theme = tokens.match(/@theme inline\s*\{([\s\S]*?)\n\}/);
if (!theme) {
  console.error('check-merge-text-sizes: no `@theme inline` block in tokens.css.');
  process.exit(1);
}

const declared = [...theme[1].matchAll(/^\s*--text-([\w-]+)\s*:/gm)].map((m) => m[1]);

const list = utils.match(/const FLUID_TEXT_SIZES = \[([\s\S]*?)\];/);
if (!list) {
  console.error('check-merge-text-sizes: no `FLUID_TEXT_SIZES` array in lib/utils.ts.');
  process.exit(1);
}

const listed = [...list[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);

const missing = declared.filter((name) => !listed.includes(name));
const extra = listed.filter((name) => !declared.includes(name));

if (missing.length === 0 && extra.length === 0) {
  console.log(`check-merge-text-sizes: ${declared.length} text sizes, cn() knows all of them.`);
  process.exit(0);
}

if (missing.length > 0) {
  console.error(
    `\nIn tokens.css but not in FLUID_TEXT_SIZES: ${missing.join(', ')}\n` +
      '  cn() will read these as colours and drop whatever real colour they merge with.\n' +
      '  Add them to the array in src/lib/utils.ts.',
  );
}
if (extra.length > 0) {
  console.error(
    `\nIn FLUID_TEXT_SIZES but not in tokens.css: ${extra.join(', ')}\n` +
      '  These generate no utility. Remove them from src/lib/utils.ts.',
  );
}
process.exit(1);
