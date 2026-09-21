/**
 * The one-off blocks on the staff dashboard's enquiry detail, message and
 * compose screens. Everything here came out of `admin.css`, the last global
 * stylesheet outside `styles/`.
 *
 * The furniture these used to sit beside — the page rail, the kicker, the back
 * link, the wordmark — moved to `components/ui/layout.ts`, because the
 * customer's own sale pages render it and it is not admin anything. What is
 * left is genuinely one screen each.
 */

/** The compose screen is a form, so it takes a measure rather than the rail. */
export const adminComposePageClassName = 'max-w-[1020px]';

export const adminComposeCardClassName =
  'overflow-hidden rounded-lg border border-border-default bg-surface-page p-ml shadow-xs sm:p-xl';

export const adminComposeBadgeClassName =
  'rounded-xs bg-surface-tint-strong px-xs py-2xs text-caption font-heavy text-text-muted';

export const adminConfigLabelClassName =
  'rounded-pill bg-surface-tint-strong px-xs py-2xs text-caption font-control text-text-muted';

/** The dl of brand/URL/version above the capability groups. */
export const adminConfigBasicsClassName = 'mb-ml border-b border-border-default pb-ml';

/**
 * A labelled row of capability pills. The margin is on every group rather than
 * only on the ones that follow another, which is what the adjacent-sibling
 * selector said: the groups are always preceded by the basics block, which is
 * separated by its own border, so the first group wants the gap too.
 */
export const adminConfigGroupClassName = [
  'mt-ml',
  '[&>strong]:mb-xs [&>strong]:block [&>strong]:text-caption [&>strong]:tracking-label-tight [&>strong]:text-text-subtle [&>strong]:uppercase',
  '[&>div]:flex [&>div]:flex-wrap [&>div]:gap-2xs',
  '[&_span]:rounded-pill [&_span]:border [&_span]:border-border-default [&_span]:bg-surface-tint-strong [&_span]:px-xs [&_span]:py-2xs [&_span]:text-label [&_span]:font-strong',
  '[&_em]:text-label [&_em]:not-italic [&_em]:text-text-subtle',
].join(' ');

/** Free text the customer typed, quoted back with a rule beside it. */
export const adminConfigRequestClassName = [
  'mt-ml border-l-[3px] border-l-action-primary bg-surface-tint px-m py-s',
  '[&>strong]:mb-xs [&>strong]:block [&>strong]:text-caption [&>strong]:tracking-label-tight [&>strong]:text-text-subtle [&>strong]:uppercase',
  '[&>p]:m-0 [&>p]:text-body-sm [&>p]:leading-[1.65] [&>p]:whitespace-pre-wrap',
].join(' ');

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
  'm-0 overflow-x-auto rounded-xs border border-border-default bg-surface-tint p-m font-mono text-label leading-[1.65] whitespace-pre-wrap';
