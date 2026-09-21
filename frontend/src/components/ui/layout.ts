/**
 * The page furniture every signed-in-or-not app route opens with: the rail, the
 * kicker, the back link, the wordmark.
 *
 * In `components/ui` rather than `components/dashboard` because the customer's
 * own sale pages render these, and a member of the public with no account
 * should not be looking at something the codebase calls admin furniture. What
 * stayed behind in `dashboard/adminLayout.ts` is the handful of blocks that
 * genuinely belong to one staff screen — the compose form, the enquiry config
 * panel, the related-messages list.
 *
 * Page headers are a component rather than a constant — see `PageHeader`. They
 * were the only block with a fixed internal structure, and a structure is
 * better expressed as markup than as a set of descendant selectors reproduced
 * in arbitrary variants.
 */

/**
 * Every app route's outer rail. 1500px is wide for reading but these are tables
 * of accounts and messages, where the columns are what needs room.
 */
export const pageClassName = 'mx-auto w-full max-w-[1500px] px-m py-l lg:p-xl';

/** The small tracked label above a page title. */
export const kickerClassName =
  'm-0 mb-s text-caption font-black tracking-label-wide text-text-action uppercase';

export const backClassName = 'mb-l inline-block text-label font-heavy text-text-muted';

/**
 * The wordmark in the sidebar and on the sign-in screen. 1.45rem is a logotype
 * size, deliberately off the type scale.
 */
export const brandClassName =
  // eslint-disable-next-line no-restricted-syntax -- 1.45rem is the logotype size, deliberately off the type scale.
  'text-[1.45rem] font-black not-italic tracking-[-0.085em] [&>span]:text-text-action [&>i]:not-italic [&>i]:text-action-primary';
