import type { CSSProperties } from 'react';

import {
  StatusChip,
  statusLabel as chipLabel,
  statusTone as chipTone,
  type StatusMap,
} from '@/components/common/status-chip';

/**
 * This app's status vocabulary, and the chip bound to it.
 *
 * An adapter over the shared `StatusChip`, which owns the shape, the two
 * colour mixes and the unmapped-status fallback. What stays here is what is
 * ours: the labels, the tones, and the four status lists — four unrelated
 * vocabularies that happen to be drawn the same way.
 *
 * Tones are a *categorical* scale rather than success/warning/danger, because
 * these are pipeline stages: `contacted` is not worse than `qualified`, it is
 * earlier. Replaces the `[data-status='…'] { --admin-status-color: … }` block
 * that used to live in `admin.css` and had no way to know when a new status
 * shipped — `queued`, `delivered`, `bounced` and `cancelled` were added to
 * `messageStatuses` and never to the CSS, so `color-mix()` got an undefined
 * value, the whole declaration was invalid, and those four pills rendered with
 * no background and no colour at all beside perfectly normal `sent` ones.
 *
 * `Awaiting identity review` and `Signed by customer` are shortened here
 * because they sit in a table column, not because the API's labels are wrong.
 */
const STATUS: StatusMap = {
  new: { label: 'New', tone: 'var(--status-new)' },
  contacted: { label: 'Contacted', tone: 'var(--status-contacted)' },
  qualified: { label: 'Qualified', tone: 'var(--status-qualified)' },
  won: { label: 'Won', tone: 'var(--status-won)' },
  closed: { label: 'Closed', tone: 'var(--status-closed)' },
  spam: { label: 'Spam', tone: 'var(--status-spam)' },

  pending: { label: 'Pending', tone: 'var(--status-new)' },
  active: { label: 'Active', tone: 'var(--status-won)' },
  suspended: { label: 'Suspended', tone: 'var(--status-suspended)' },
  denied: { label: 'Denied', tone: 'var(--status-spam)' },

  queued: { label: 'Queued', tone: 'var(--status-new)' },
  sent: { label: 'Sent', tone: 'var(--status-won)' },
  delivered: { label: 'Delivered', tone: 'var(--status-won)' },
  failed: { label: 'Failed', tone: 'var(--status-spam)' },
  bounced: { label: 'Bounced', tone: 'var(--status-spam)' },
  cancelled: { label: 'Cancelled', tone: 'var(--status-closed)' },
  suppressed: { label: 'Suppressed', tone: 'var(--status-closed)' },

  // Sale statuses, coloured by who the sale is waiting on rather than by how
  // far through it is: amber where the dealer has something to do, blue where
  // the customer does, purple once it is binding, green when it is finished.
  //
  // `signed` takes the suspended orange on its own, and that is the point. It
  // is the only urgent state — the offer lapses at close of business the next
  // business day — so it must not look like the two blue states either side of
  // it. See `_docs/licensing/plan/04-dealer-portal.md`.
  draft: { label: 'Draft', tone: 'var(--status-new)' },
  awaiting_customer: { label: 'Awaiting customer', tone: 'var(--status-contacted)' },
  awaiting_identity_review: { label: 'Identity review', tone: 'var(--status-new)' },
  ready_to_sign: { label: 'Ready to sign', tone: 'var(--status-contacted)' },
  signed: { label: 'Signed', tone: 'var(--status-suspended)' },
  accepted: { label: 'Accepted', tone: 'var(--status-qualified)' },
  awaiting_payment: { label: 'Awaiting payment', tone: 'var(--status-contacted)' },
  payment_confirmed: { label: 'Payment confirmed', tone: 'var(--status-qualified)' },
  completed: { label: 'Completed', tone: 'var(--status-won)' },

  // SEO setup steps. Marked done is waiting on us to confirm the access, so it
  // takes the colour of the other "waiting on someone" states.
  not_started: { label: 'Not started', tone: 'var(--status-closed)' },
  marked_done: { label: 'Marked done', tone: 'var(--status-contacted)' },
  confirmed: { label: 'Confirmed', tone: 'var(--status-won)' },
};

export function statusLabel(status: string): string {
  return chipLabel(STATUS, status);
}

/** Spread onto any element that draws itself from a status colour. */
export function statusTone(status: string): CSSProperties {
  return chipTone(STATUS, status);
}

export function StatusPill({ status }: { status: string }) {
  return <StatusChip map={STATUS} status={status} />;
}

export const enquiryStatuses = ['new', 'contacted', 'qualified', 'won', 'closed', 'spam'] as const;
export const dealerStatuses = ['pending', 'active', 'suspended', 'denied'] as const;
export const saleStatuses = [
  'draft',
  'awaiting_customer',
  'awaiting_identity_review',
  'ready_to_sign',
  'signed',
  'accepted',
  'awaiting_payment',
  'payment_confirmed',
  'completed',
  'cancelled',
] as const;
export const messageStatuses = [
  'queued',
  'sent',
  'delivered',
  'failed',
  'bounced',
  'cancelled',
  'suppressed',
] as const;
