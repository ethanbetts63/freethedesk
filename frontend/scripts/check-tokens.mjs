#!/usr/bin/env node
/**
 * Fails the build when the design-token declarations drift apart.
 *
 * The invariants and the reasons for them live in freetheplatform's shared
 * lint directory, beside the ESLint and Stylelint configs that enforce the
 * same token contract. This file only says where FreeTheDesk keeps its files.
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tokenDrift } from '../../../freetheplatform/frontend/lint/token-drift.mjs';

const { failures } = tokenDrift({
  root: join(dirname(fileURLToPath(import.meta.url)), '..'),
  tokensPath: 'src/styles/tokens.css',
});

if (failures.length) {
  console.error('\ncheck-tokens failed:\n');
  for (const f of failures) console.error(`• ${f}\n`);
  process.exit(1);
}
console.log('check-tokens: token declarations agree.');
