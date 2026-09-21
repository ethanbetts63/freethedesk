#!/usr/bin/env node
/**
 * Thin entry point. The engine is shared and byte-identical across the three
 * repos — edit it in `freetheplatform/frontend/registry/tooling/seo/` and
 * re-sync, never here.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSitemapRoutes } from './seo/sitemap-routes.mjs';

await checkSitemapRoutes({ root: join(dirname(fileURLToPath(import.meta.url)), '..') });
