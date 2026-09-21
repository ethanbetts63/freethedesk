/**
 * Fails the build if session recording is re-enabled on a page that must not
 * be recorded.
 *
 * Section 7 of freetheplatform/_docs/security-standard.md requires Clarity off
 * every signed-in portal, credential page, and payment or customer-order page.
 * Deleting a line from `CLARITY_EXCLUDED_ROUTES` produces no error anywhere:
 * the site works, the tests pass, and a third party quietly starts receiving
 * replays of staff screens and customer orders. Nobody finds that by using the
 * site, which is why it is a build check rather than a convention.
 *
 * Adding a route to the list is fine and needs no change to the caller.
 * Removing one of the required routes is the thing that has to be argued for,
 * and arguing for it means editing the caller's `required` list — a diff a
 * reviewer will see.
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

  // Anchored on the closing `] as const` rather than the first `]`, because
  // the comments inside the list name routes such as
  // /hire/book/[bookingReference].
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

  // The stop call is the half that is easy to lose in a refactor: without it
  // the tag started on a public page keeps recording straight through a
  // client-side navigation into an excluded one.
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
