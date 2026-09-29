/**
 * Fails the build if session recording is re-enabled on a page that must not be recorded.
 * security-standard.md section 7 requires Clarity off every portal, credential, payment and customer-order page; deleting a
 * line from `CLARITY_EXCLUDED_ROUTES` raises no error anywhere. Adding a route needs no caller change; removing a required
 * one means editing the caller's `required` list, a diff a reviewer sees.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * @param {object} options
 * @param {string} options.root        Absolute path to the repo's `frontend`.
 * @param {string[]} options.required  Route prefixes that must stay excluded.
 * @param {string} [options.listPath]  Where the list is declared.
 * @param {string} [options.componentPath] The Clarity component to check for
 *                                     its `stop` call. Pass `null` to skip.
 * @returns {string[]} Failures, for the caller to report alongside its own.
 */
export function clarityExclusionFailures({
  root,
  required,
  listPath = 'src/lib/clarityRoutes.ts',
  componentPath = 'src/components/analytics/ClarityAnalytics.tsx',
}) {
  const failures = [];
  const source = readFileSync(join(root, listPath), 'utf8');

  // Anchored on `] as const`, not the first `]`: comments in the list name routes like /hire/book/[bookingReference].
  const excluded = source.match(/CLARITY_EXCLUDED_ROUTES\s*=\s*\[(.*?)\]\s*as const/s);

  if (!excluded) {
    failures.push(`CLARITY_EXCLUDED_ROUTES could not be found in ${listPath}.`);
  } else {
    for (const route of required) {
      if (!new RegExp(`['"]${route}['"]`).test(excluded[1])) {
        failures.push(`CLARITY_EXCLUDED_ROUTES is missing ${route}.`);
      }
    }
  }

  // Without the stop call a recording started on a public page follows navigation into an excluded route.
  if (componentPath) {
    const component = readFileSync(join(root, componentPath), 'utf8');
    if (!/clarity\?\.\('stop'\)/.test(component)) {
      failures.push(
        "ClarityAnalytics no longer calls clarity('stop'). Not starting the tag is not " +
          'enough — a recording already running follows a client-side navigation into an ' +
          'excluded route.',
      );
    }
  }

  return failures;
}

/** The whole check, for a repo that has nothing else to assert. */
export function checkClarityExclusions(options) {
  const failures = clarityExclusionFailures(options);

  if (failures.length) {
    console.error('check-customer-routes: FAILED');
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }

  console.log(
    `check-customer-routes: session recording is excluded from ${options.required.length} ` +
      'route trees and stops on navigation.',
  );
}
