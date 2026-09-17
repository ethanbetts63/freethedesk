import type { CSSProperties } from 'react';

const labels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  won: 'Won',
  closed: 'Closed',
  spam: 'Spam',
  pending: 'Pending',
  queued: 'Queued',
  sent: 'Sent',
  delivered: 'Delivered',
  failed: 'Failed',
  bounced: 'Bounced',
  cancelled: 'Cancelled',
  active: 'Active',
  suspended: 'Suspended',
  denied: 'Denied',
};

export function statusLabel(status: string): string {
  return labels[status] ?? status[0].toUpperCase() + status.slice(1);
}

/**
 * Status enum to the categorical colour it is drawn in.
 *
 * Replaces the `[data-status='…'] { --admin-status-color: … }` block from
 * `admin.css`. The colour is still a custom property, because the three
 * surfaces that use it mix it at three different strengths (12% for a table
 * row, 26% for a pill background, 45% against the text colour) and a mix
 * cannot be expressed as a Tailwind colour utility. What changes is where the
 * mapping lives: beside the labels and the status lists it belongs to, instead
 * of in a stylesheet that had no way to know when a new status shipped.
 *
 * Which is exactly what went wrong. `queued`, `delivered`, `bounced` and
 * `cancelled` were added to `messageStatuses` but never to the CSS, so
 * `--admin-status-color` was undefined for them, `color-mix()` was invalid,
 * and those four pills rendered with no background and no colour at all next
 * to perfectly normal `sent` and `failed` ones. They are mapped here by
 * meaning, and an unrecognised status falls back to the neutral `closed`
 * colour rather than to nothing.
 */
const tones: Record<string, string> = {
  new: 'var(--status-new)',
  pending: 'var(--status-new)',
  queued: 'var(--status-new)',
  contacted: 'var(--status-contacted)',
  qualified: 'var(--status-qualified)',
  won: 'var(--status-won)',
  sent: 'var(--status-won)',
  active: 'var(--status-won)',
  delivered: 'var(--status-won)',
  closed: 'var(--status-closed)',
  cancelled: 'var(--status-closed)',
  spam: 'var(--status-spam)',
  failed: 'var(--status-spam)',
  denied: 'var(--status-spam)',
  bounced: 'var(--status-spam)',
  suspended: 'var(--status-suspended)',
};

/** Spread onto any element that draws itself from a status colour. */
export function statusTone(status: string): CSSProperties {
  return { '--status-tone': tones[status] ?? tones.closed } as CSSProperties;
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className="inline-flex rounded-[var(--radius-pill)] bg-[color-mix(in_srgb,var(--status-tone)_26%,var(--surface-page))] px-xs py-3xs text-micro font-heavy text-[color-mix(in_srgb,var(--status-tone)_45%,var(--text-primary))]"
      style={statusTone(status)}
    >
      {statusLabel(status)}
    </span>
  );
}

export const enquiryStatuses = ['new', 'contacted', 'qualified', 'won', 'closed', 'spam'] as const;
export const dealerStatuses = ['pending', 'active', 'suspended', 'denied'] as const;
export const messageStatuses = [
  'queued',
  'sent',
  'delivered',
  'failed',
  'bounced',
  'cancelled',
] as const;
