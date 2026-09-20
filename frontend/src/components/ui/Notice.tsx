import type { HTMLAttributes, ReactNode } from 'react';

import { StatusBanner } from '@/components/common/status-banner';
import { cn } from '@/lib/utils';

export type NoticeTone = 'success' | 'warning' | 'danger';

type NoticeProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'role'> & {
  /** `alert` interrupts a screen reader; `status` waits its turn. */
  role?: 'alert' | 'status';
  tone?: NoticeTone;
  size?: 'banner' | 'field';
  children: ReactNode;
  className?: string;
};

/**
 * This site's name and spacing for the shared `StatusBanner`: the feedback
 * messages used by the dashboard, both portals and the login page.
 *
 * Two things stay here rather than moving into the shared component. The
 * vertical rhythm — a banner carries `my-m`, a field error is flush — because a
 * shared component that sets its own margin fights every layout it is dropped
 * into. And the `success` default, which the seventy-odd call sites were
 * written against; the shared component deliberately has no default tone, so a
 * caller that forgets the prop cannot silently announce good news.
 */
export function Notice({
  tone = 'success',
  size = 'banner',
  className,
  children,
  ...rest
}: NoticeProps) {
  return (
    <StatusBanner
      tone={tone}
      size={size === 'field' ? 'compact' : 'default'}
      className={cn(size === 'field' ? 'm-0' : 'my-m', className)}
      {...rest}
    >
      {children}
    </StatusBanner>
  );
}
