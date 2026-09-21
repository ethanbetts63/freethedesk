#!/usr/bin/env node
/**
 * The frontend baseline, held by a script instead of a table in a document.
 *
 * Shared engine — edit it in `freetheplatform/frontend/registry/tooling/` and
 * re-sync, never in a product. It is deliberately self-contained: the pinned
 * list is family policy, not a repo fact, so changing it is a registry edit
 * that lands everywhere in one sync.
 *
 * frontend-baseline.md's rule is that the three products run one baseline —
 * the registry ships components by byte-copy, so a version skew means the
 * copy is not the thing that was tested. This script holds the part of that
 * rule that is already true:
 *
 * - PINNED packages must be declared identically in all three repos. Fail.
 * - BASELINE packages should be, but the family has not leveled them yet —
 *   the sequence is in _docs/frontend-baseline-outstanding.md. Warn, count.
 *   When a leveling step lands, move its packages into PINNED in the same
 *   change; that is the step becoming permanent.
 *
 * Run from any repo in the family. When the sibling repos are not present
 * (Vercel, CI, a lone clone) there is nothing to compare, so it says so and
 * exits 0 — the check is about the family, and only means something where
 * the family is.
 *
 *   node scripts/baseline/baseline-drift.mjs            enforce
 *   node scripts/baseline/baseline-drift.mjs --report   full table of skews
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONSUMERS = ['allbikes', 'bloomprint', 'freethedesk'];

/** Declared identically today. Drifting one of these is a failure. */
const PINNED = [
  '@freetheplatform/web-security',
  '@vercel/analytics',
  'class-variance-authority',
  'clsx',
  'stylelint',
  'stylelint-config-standard',
  'stylelint-declaration-strict-value',
  'typescript',
  'zod',
];

/**
 * The rest of the baseline: not yet leveled. Warned about, never silently
 * fine. The leveling order and its risk notes are
 * freetheplatform/_docs/frontend-baseline-outstanding.md.
 */
const BASELINE = [
  '@hookform/resolvers',
  '@stripe/react-stripe-js',
  '@stripe/stripe-js',
  '@tailwindcss/postcss',
  '@types/node',
  '@types/react',
  '@types/react-dom',
  'eslint',
  'eslint-config-next',
  'isomorphic-dompurify',
  'next',
  'prettier',
  'react',
  'react-dom',
  'react-hook-form',
  'tailwind-merge',
  'tailwindcss',
];

// Walk up from this file to the directory that holds the family checkout.
let workspace = dirname(fileURLToPath(import.meta.url));
while (
  workspace !== dirname(workspace) &&
  !CONSUMERS.every((repo) => existsSync(join(workspace, repo)))
) {
  workspace = dirname(workspace);
}

const present = CONSUMERS.filter((repo) =>
  existsSync(join(workspace, repo, 'frontend', 'package.json')),
);
if (present.length < CONSUMERS.length) {
  console.log(
    `baseline-drift: family checkout not present (found ${present.length}/${CONSUMERS.length} repos) — nothing to compare here.`,
  );
  process.exit(0);
}

const declared = new Map(
  CONSUMERS.map((repo) => {
    const manifest = JSON.parse(
      readFileSync(join(workspace, repo, 'frontend', 'package.json'), 'utf8'),
    );
    return [repo, { ...manifest.dependencies, ...manifest.devDependencies }];
  }),
);

const versionsOf = (name) => CONSUMERS.map((repo) => declared.get(repo)[name] ?? '—');
const agrees = (versions) => new Set(versions).size === 1 && !versions.includes('—');

if (process.argv.includes('--report')) {
  const shared = [...new Set(CONSUMERS.flatMap((repo) => Object.keys(declared.get(repo))))]
    .filter((name) => CONSUMERS.every((repo) => name in declared.get(repo)))
    .sort();
  console.log(`baseline-drift: ${resolve(workspace)}\n`);
  console.log(['package'.padEnd(36), ...CONSUMERS.map((repo) => repo.padEnd(14))].join(''));
  for (const name of shared) {
    const versions = versionsOf(name);
    const mark = PINNED.includes(name) ? 'pin ' : BASELINE.includes(name) ? 'base' : '    ';
    const state = agrees(versions) ? ' ' : '!';
    console.log(
      [`${state} ${mark} ${name}`.padEnd(42), ...versions.map((v) => v.padEnd(14))].join(''),
    );
  }
  process.exit(0);
}

const failures = PINNED.map((name) => [name, versionsOf(name)]).filter(([, v]) => !agrees(v));
const drifting = BASELINE.map((name) => [name, versionsOf(name)]).filter(([, v]) => !agrees(v));

if (failures.length) {
  console.error('baseline-drift: pinned packages disagree.\n');
  for (const [name, versions] of failures) {
    console.error(`  ${name}`);
    CONSUMERS.forEach((repo, i) => console.error(`      ${repo.padEnd(12)} ${versions[i]}`));
  }
  console.error(
    '\nThe rule is one baseline (freetheplatform/_docs/frontend-baseline.md).\n' +
      'Level these in every repo in one change — or, if the family is moving\n' +
      'together, finish the move.',
  );
  process.exit(1);
}

console.log(
  `baseline-drift: ${PINNED.length} pinned packages agree across ${CONSUMERS.length} repos` +
    (drifting.length
      ? `; ${drifting.length} baseline packages still drift (run with --report; the sequence is _docs/frontend-baseline-outstanding.md).`
      : '; the whole baseline agrees.'),
);
