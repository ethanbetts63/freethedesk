#!/usr/bin/env node
/**
 * Thin entry point. The engine is shared and byte-identical across the three
 * repos — edit it in `freetheplatform/frontend/registry/tooling/seo/` and
 * re-sync, never here. Only the file list is repo-specific.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkOgImages } from './seo/og-images.mjs';

checkOgImages({
  root: join(dirname(fileURLToPath(import.meta.url)), '..'),
  sources: ['src/lib/pages.ts', 'src/lib/seo.ts', 'src/lib/siteConfig.ts', 'src/lib/articles.ts'],
});
