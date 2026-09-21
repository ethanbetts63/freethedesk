#!/usr/bin/env node
/**
 * Thin entry point. The engine is shared and byte-identical across the three
 * repos — edit it in `freetheplatform/frontend/registry/tooling/seo/` and
 * re-sync, never here. Only the two values below are repo-specific, because
 * how a page declares noindex differs by how each app builds its metadata.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkIndexationLedger } from './seo/indexation-ledger.mjs';

await checkIndexationLedger({
  root: join(dirname(fileURLToPath(import.meta.url)), '..'),
  noindexIn: /noindex:\s*true|NOINDEX_METADATA/,
  noindexFix: 'Give the page `buildMetadata({ ..., noindex: true })`.',
});
