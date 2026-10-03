/**
 * The page furniture every signed-in-or-not app route opens with: the rail, the
 * kicker, the back link.
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
