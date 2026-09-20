/* Component registry: freetheplatform/frontend/registry/src/components/common/eyebrow.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type EyebrowSize = 'sm' | 'md' | 'lg';
export type EyebrowTone = 'secondary' | 'primary' | 'muted' | 'brand' | 'on-dark' | 'on-dark-muted';

const SIZE: Record<EyebrowSize, string> = {
  sm: 'text-caption-sm',
  md: 'text-body-sm',
  lg: 'text-body',
};

const TONE: Record<EyebrowTone, string> = {
  secondary: 'text-text-secondary',
  primary: 'text-text-primary',
  muted: 'text-text-muted',
  brand: 'text-action-primary',
  'on-dark': 'text-text-on-dark',
  'on-dark-muted': 'text-text-on-dark-muted',
};

interface EyebrowProps {
  children: ReactNode;
  size?: EyebrowSize;
  tone?: EyebrowTone;
  /** Spacing and alignment stay with the caller; the type does not. */
  className?: string;
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
  className,
  id,
}: EyebrowProps) {
  return (
    <p
      id={id}
      className={cn('font-bold uppercase tracking-[0.18em]', SIZE[size], TONE[tone], className)}
    >
      {children}
    </p>
  );
}
