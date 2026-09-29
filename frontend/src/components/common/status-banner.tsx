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

/** Typed structurally, not as a `LucideIcon`, because freethedesk does not install lucide-react. */
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
 * The tinted box for something that went wrong, needs attention, or worked.
 * `tone` has no default, so a forgotten prop cannot announce good news; no vertical margin, the caller owns that rhythm.
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
        children
      )}
    </div>
  );
}

export default StatusBanner;
