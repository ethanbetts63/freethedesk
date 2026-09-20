#!/usr/bin/env node
/**
 * Fails the build if the customer's sale routes are ever put behind the edge
 * auth check — or dropped out of the Clarity exclusions.
 *
 * `proxy.ts` redirects anything under a protected prefix to `/login` when
 * there is no auth cookie. A customer holding a perfectly valid sale link has
 * no auth cookie and never will — they hold a capability scoped to one sale,
 * not an account — so adding `/sale` to `PROTECTED_PREFIXES` or to the matcher
 * would bounce every one of them to a login page they can never pass.
 *
 * It is a one-word change to make and produces no error anywhere: the page
 * simply becomes unreachable for exactly the people it exists for, and the
 * dealer hears about it from the customer. Hence a build check rather than a
 * convention.
 *
 * The proxy half is this repo's alone and stays here. The exclusion half is
 * the same assertion allbikes and bloomprint make, and comes from the shared
 * engine — edit that in the registry, never here.
 *
 * See `_docs/licensing/plan/05-customer-flow.md`.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { clarityExclusionFailures } from './security/clarity-exclusions.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const proxy = readFileSync(join(root, 'src/proxy.ts'), 'utf8');

const failures = [];

const prefixes = proxy.match(/PROTECTED_PREFIXES\s*=\s*\[([^\]]*)\]/s);
if (!prefixes) {
  failures.push('PROTECTED_PREFIXES could not be found in src/proxy.ts.');
} else if (/['"]\/sale/.test(prefixes[1])) {
  failures.push(
    'PROTECTED_PREFIXES includes /sale. The customer sale routes must stay out of it — ' +
      'a customer holding a valid sale link has no auth cookie and would be redirected to /login.',
  );
}

const matcher = proxy.match(/matcher:\s*\[([^\]]*)\]/s);
if (!matcher) {
  failures.push('The proxy matcher could not be found in src/proxy.ts.');
} else if (/['"]\/sale/.test(matcher[1])) {
  failures.push(
    'The proxy matcher includes /sale. Those routes must not run through the edge auth check.',
  );
}

// The flip side: the exclusion list has to *include* it. Section 7 of the
// security standard requires session recording off any customer-order page,
// and this one shows a driver's licence.
const required = [
  '/dashboard',
  '/portal',
  '/seo-portal',
  '/sale',
  '/login',
  '/licensing/payment',
  '/seo/payment',
];
failures.push(...clarityExclusionFailures({ root, required }));

if (failures.length) {
  console.error('check-customer-routes: FAILED');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `check-customer-routes: /sale is unprotected at the edge, and session recording is ` +
    `excluded from ${required.length} route trees and stops on navigation.`,
);
