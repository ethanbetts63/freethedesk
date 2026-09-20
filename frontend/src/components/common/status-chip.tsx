/* Component registry: freetheplatform/frontend/registry/src/components/common/status-chip.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

/**
 * A status as a tinted chip, coloured from a per-domain map.
 *
 * The rendering is shared and the vocabularies are not, and that boundary is
 * the whole design. Hire statuses, parts-order statuses and dealer statuses
 * are unrelated lists that happen to be drawn the same way; a shared component
 * that knew any of them would have to know all of them, and one app had
 * exactly that — a single file holding labels for twenty-four statuses from
 * four different domains, plus the component, plus the four vocabularies.
 *
 * The tone is a CSS colour rather than a class because the chip mixes it at
 * two strengths, and a table row that carries the same tone mixes it at a
 * third. A `color-mix` cannot be written as a Tailwind colour utility, so the
 * value travels as a custom property and the mixing lives here, once.
 *
 * An unrecognised status still draws. It gets the neutral tone and a
 * title-cased version of its own name, because the alternative — a chip with
 * no background and no colour — is what happens when a status ships without
 * being added to a map, and it is invisible in review.
 */

export interface StatusStyle {
  /** Defaults to the status with underscores replaced and the first letter up. */
  label?: string;
  /** Any CSS colour: a `var(--token)`, or a literal where no token fits. */
  tone: string;
}

export type StatusMap = Record<string, StatusStyle>;

/**
 * The tone for a status nobody mapped. `--text-secondary` rather than a
 * neutral *fill*, because it is the one grey every repo on this contract
 * declares, and because the chip mixes its tone rather than using it flat.
 * Deliberately not alarming: an unmapped status is a gap in a table, not an
 * error in the record.
 */
const FALLBACK_TONE = 'var(--text-secondary)';

export function statusLabel(map: StatusMap, status: string): string {
  const label = map[status]?.label;
  if (label) return label;
  const words = status.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Spread onto any element that draws itself from a status colour — a table
 * row, a legend swatch, the chip below.
 */
export function statusTone(map: StatusMap, status: string): CSSProperties {
  return { '--status-tone': map[status]?.tone ?? FALLBACK_TONE } as CSSProperties;
}

export function StatusChip({
  map,
  status,
  className,
}: {
  map: StatusMap;
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'rounded-pill px-xs py-3xs text-label font-heavy inline-flex',
        'bg-[color-mix(in_srgb,var(--status-tone)_26%,var(--surface-page))]',
        'text-[color-mix(in_srgb,var(--status-tone)_45%,var(--text-primary))]',
        className,
      )}
      style={statusTone(map, status)}
    >
      {statusLabel(map, status)}
    </span>
  );
}
