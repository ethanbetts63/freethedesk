/* Component registry: freetheplatform/frontend/registry/src/components/common/status-banner.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import type { ComponentType, HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type StatusTone = 'danger' | 'warning' | 'success' | 'info';
export type StatusSize = 'default' | 'compact';

const TONE: Record<StatusTone, string> = {
  danger: 'border-border-danger bg-surface-danger text-text-danger',
  warning: 'border-border-warning bg-surface-warning text-text-warning',
  success: 'border-border-success bg-surface-success text-text-success',
  info: 'border-border-info bg-surface-info text-text-info',
};

const SIZE: Record<StatusSize, string> = {
  default: 'rounded-sm p-s text-body leading-normal',
  compact: 'rounded-xs p-xs text-body-sm',
};

/**
 * An icon component. Typed structurally rather than as a `LucideIcon` so the
 * registry does not depend on lucide-react, which one of the three sites does
 * not install.
 */
type IconComponent = ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>;

interface StatusBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'role'> {
  tone: StatusTone;
  children: ReactNode;
  /** `compact` is the one-line field error; `default` is a standalone banner. */
  size?: StatusSize;
  icon?: IconComponent;
  /** `alert` interrupts a screen reader; `status` waits its turn. */
  role?: 'alert' | 'status';
}

/**
 * The tinted box that tells the reader something went wrong, needs attention,
 * or worked. Colour comes from the status tokens, which already agree across
 * every site; this settles the shape.
 *
 * `tone` has no default. The version this replaces defaulted to `success`,
 * which meant a caller who forgot the prop silently announced good news.
 *
 * Vertical margin is deliberately not included: a shared component that sets
 * its own `my-*` fights every layout it is dropped into. The caller owns that
 * rhythm on a parent or through its surrounding gap.
 */
export function StatusBanner({
  tone,
  children,
  size = 'default',
  icon: Icon,
  role,
  ...rest
}: StatusBannerProps) {
  return (
    <div
      role={role}
      className={cn('border', TONE[tone], SIZE[size], Icon && 'flex items-start gap-xs')}
      {...rest}
    >
      {Icon ? (
        <>
          <Icon className="mt-4xs h-5 w-5 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">{children}</div>
        </>
      ) : (
        // No wrapper without an icon: ordinary text does not need another box.
        children
      )}
    </div>
  );
}

export default StatusBanner;
