/* Component registry: freetheplatform/frontend/registry/src/components/common/status-chip.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

/**
 * A status as a tinted chip, coloured from a per-domain map. Rendering is shared; vocabularies stay with each domain.
 *
 * The tone is a CSS colour, not a class: `color-mix` cannot be a Tailwind utility, so it travels as a custom property.
 * An unmapped status still draws, neutral and title-cased, rather than as an invisible bare chip.
 */

export interface StatusStyle {
  /** Defaults to the status with underscores replaced and the first letter up. */
  label?: string;
  /** Any CSS colour: a `var(--token)`, or a literal where no token fits. */
  tone: string;
}

export type StatusMap = Record<string, StatusStyle>;
export type StatusChipSize = 'default' | 'readable' | 'prominent';

const SIZE: Record<StatusChipSize, string> = {
  default: 'px-xs py-3xs text-label',
  /* Dense notification lists. */
  readable: 'px-xs py-3xs text-body-sm',
  /* A detail header, where status is a primary fact. */
  prominent: 'px-m py-2xs text-body',
};

/** Tone for an unmapped status: `--text-secondary`, the one grey every repo declares; deliberately not alarming. */
const FALLBACK_TONE = 'var(--text-secondary)';

export function statusLabel(map: StatusMap, status: string): string {
  const label = map[status]?.label;
  if (label) return label;
  const words = status.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Spread onto any element drawn from a status colour: a table row, a swatch, the chip. */
export function statusTone(map: StatusMap, status: string): CSSProperties {
  return { '--status-tone': map[status]?.tone ?? FALLBACK_TONE } as CSSProperties;
}

export function StatusChip({
  map,
  status,
  size = 'default',
}: {
  map: StatusMap;
  status: string;
  size?: StatusChipSize;
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-pill font-heavy',
        SIZE[size],
        'bg-[color-mix(in_srgb,var(--status-tone)_26%,var(--surface-page))]',
        'text-[color-mix(in_srgb,var(--status-tone)_45%,var(--text-primary))]',
      )}
      style={statusTone(map, status)}
    >
      {statusLabel(map, status)}
    </span>
  );
}
