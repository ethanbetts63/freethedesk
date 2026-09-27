/* Component registry: freetheplatform/frontend/registry/src/components/common/eyebrow.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type EyebrowSize = 'sm' | 'md' | 'lg';
export type EyebrowTone =
  'secondary' | 'primary' | 'muted' | 'brand' | 'accent' | 'on-dark' | 'on-dark-muted';

const SIZE: Record<EyebrowSize, string> = {
  sm: 'text-label',
  md: 'text-body-sm',
  lg: 'text-body',
};

const TONE: Record<EyebrowTone, string> = {
  secondary: 'text-text-secondary',
  primary: 'text-text-primary',
  muted: 'text-text-muted',
  brand: 'text-action-primary',
  /* Sections tint this by setting `--eyebrow-accent` on an ancestor; unset, it
     falls back to the action-text role, so a site that never sets it still
     gets a sensible colour. */
  accent: 'text-[var(--eyebrow-accent,var(--text-action))]',
  'on-dark': 'text-text-on-dark',
  'on-dark-muted': 'text-text-on-dark-muted',
};

interface EyebrowProps {
  children: ReactNode;
  size?: EyebrowSize;
  tone?: EyebrowTone;
  /** The leading dot. */
  dot?: boolean;
  id?: string;
}

/**
 * The small uppercase kicker that labels a section above its heading, with a
 * single tracking value (0.18em) so changing it is one edit here rather than
 * re-tuning every section that uses it.
 */
export default function Eyebrow({
  children,
  size = 'md',
  tone = 'secondary',
  dot = false,
  id,
}: EyebrowProps) {
  return (
    <p
      id={id}
      className={cn(
        'font-bold uppercase tracking-[0.18em]',
        SIZE[size],
        TONE[tone],
        dot && 'flex items-center gap-s',
      )}
    >
      {/* 50% and a full pill round a 7x7 box identically, so this uses the
          stock utility rather than the radius scale. */}
      {dot && <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-current" />}
      {children}
    </p>
  );
}

export { Eyebrow };
