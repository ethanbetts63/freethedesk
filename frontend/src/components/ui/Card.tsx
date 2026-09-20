import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { formControlClassName, formControlPaddingClassName } from './formControl';

/**
 * The card surfaces shared by the dashboard, both portals and the settings
 * screens.
 *
 * Replaces `admin.css`'s `.admin-panel` / `.admin-detail-card` /
 * `.admin-detail-grid` / `.admin-detail-wide` / `.admin-status-card` /
 * `.admin-card-label` / `.admin-card-heading` / `.admin-detail-list` rules and
 * their `h2`, `dt`, `dd` and `a` descendants.
 *
 * These are exported class names rather than wrapper components because a card
 * is a `<section>` the page already owns — it has its own heading, its own
 * children, and sometimes its own extra class. Only the definition list earns a
 * component: `AdminDetailItem` replaced thirty-seven hand-written
 * `<div><dt>…</dt><dd>…</dd></div>` triples that the deleted CSS reached into
 * by descendant selector.
 */
const cardShellClassName =
  'overflow-hidden rounded-lg border border-border-default bg-surface-page shadow-xs';

/** A full-bleed container whose children supply their own padding (list tables). */
export const adminPanelClassName = cardShellClassName;

/** The padded card used by every detail and settings screen. */
export const adminCardClassName = cn(cardShellClassName, 'p-l');

/** Two columns from `sm` up, one below. */
export const adminDetailGridClassName = 'grid grid-cols-[minmax(0,1fr)] gap-ml sm:grid-cols-2';

/** A card that spans both grid columns from `sm` up. */
export const adminCardWideClassName = 'col-auto sm:col-[1/-1]';

/** `<h2>` inside a card. */
export const adminCardTitleClassName = 'm-0 mb-ml text-lead';

/** A card's one-line label, where a heading would be too loud. */
export const adminCardLabelClassName = 'm-0 text-label font-heavy';

/** A card heading row: title on the left, an action on the right. */
export const adminCardHeadingClassName = 'flex items-center justify-between';

/** Links inside a card heading or a detail list. */
export const adminCardLinkClassName =
  'font-heavy text-text-action underline underline-offset-[3px]';

/** Preformatted free text — an enquiry message, a portal explainer. */
export const adminMessageBodyClassName = 'm-0 text-body leading-[1.75] whitespace-pre-wrap';

/**
 * The status card: a label and its pill on one side, the control that changes
 * it on the other. Stacks below `sm` and always spans the full grid.
 */
export const adminStatusCardClassName = cn(
  adminCardClassName,
  adminCardWideClassName,
  'flex flex-col items-start justify-between sm:flex-row sm:items-center',
);

/** The label-and-pill pair inside a status card. */
export const adminStatusCardLabelGroupClassName = 'flex items-center gap-s';

/** The `<select>` inside a status card. */
export const adminStatusCardSelectClassName = cn(
  formControlClassName,
  formControlPaddingClassName,
  'max-w-none sm:max-w-[210px]',
);

export const adminDetailListClassName = cn('m-0', adminDetailGridClassName);

/** One term/description pair in an `AdminDetailList`. */
export function AdminDetailItem({ term, children }: { term: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="mb-2xs text-label font-heavy tracking-label-tight text-text-subtle uppercase">
        {term}
      </dt>
      <dd className="m-0 text-body-sm leading-[1.5] [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}
