#!/usr/bin/env node
/**
 * Thin entry point. The engine is shared and byte-identical across the three
 * repos — edit it in `freetheplatform/frontend/registry/tooling/seo/` and
 * re-sync, never here.
 *
 * No `crumbsPath`: this app carries the crumb name as `label` on the page
 * record itself, so the check looks for a missing property rather than a
 * missing route.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkCrumbLabels } from './seo/crumb-labels.mjs';

checkCrumbLabels({ root: join(dirname(fileURLToPath(import.meta.url)), '..') });
