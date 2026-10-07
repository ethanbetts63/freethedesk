/**
 * The one-off blocks on the staff dashboard's enquiry detail, message and
 * compose screens. Everything here came out of `admin.css`, the last global
 * stylesheet outside `styles/`.
 *
 * The furniture these used to sit beside — the page rail, the kicker, the back
 * link — moved to `components/ui/layout.ts`, because the
 * customer's own sale pages render it and it is not admin anything. What is
 * left is genuinely one screen each.
 */

/** The compose screen is a form, so it takes a measure rather than the rail. */
export const adminComposePageClassName = 'max-w-[1020px]';

export const adminComposeCardClassName =
  'overflow-hidden rounded-lg border border-border-default bg-surface-page p-ml shadow-xs sm:p-xl';

export const adminComposeBadgeClassName =
  'rounded-xs bg-surface-tint-strong px-xs py-2xs text-caption font-heavy text-text-muted';

/**
 * The list of messages sent about one enquiry. Stacks on a phone; from `sm`
 * the channel, subject and timestamp take fixed outer columns so the dates
 * line up down the right edge.
 */
export const adminRelatedMessagesClassName = [
  'border-t border-border-default',
  '[&>a]:grid [&>a]:grid-cols-[minmax(0,1fr)] [&>a]:items-start [&>a]:gap-m [&>a]:border-b [&>a]:border-border-default [&>a]:px-3xs [&>a]:py-s',
  'sm:[&>a]:grid-cols-[120px_minmax(0,1fr)_170px] sm:[&>a]:items-center',
  '[&_span]:text-caption [&_span]:text-text-subtle',
  '[&_strong]:text-label',
  '[&_small]:text-caption [&_small]:text-text-subtle sm:[&_small]:text-right',
].join(' ');

/** A delivered message body, shown verbatim. */
export const adminMessagePreClassName =
  'm-0 overflow-x-auto rounded-xs border border-border-default bg-surface-tint p-m font-mono text-label leading-relaxed whitespace-pre-wrap';
