import type { ReactNode } from 'react';

import { kickerClassName } from './layout';
import { cn } from '@/lib/utils';

/**
 * The heading block every authenticated route opens with: a kicker, a title,
 * an optional line of context, and an optional action on the right.
 *
 * It was `.admin-page-header` in `admin.css`, styling its `h1` and its
 * non-kicker `p` by descendant selector. That works in CSS and does not
 * translate: a utility written as `[&_p]:…` outranks a class on the `p`
 * itself, so the kicker would have lost to the subtitle's colour. The block
 * has a fixed shape, so the honest fix is to make the shape explicit and give
 * each part its own class.
 */
export function PageHeader({
  kicker,
  title,
  subtitle,
  align = 'baseline',
  className,
  children,
}: {
  kicker: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /**
   * `baseline` sits the action on the title's baseline from `sm`, which reads
   * right when the block is two lines tall. Detail screens carry a third line
   * and centre it instead.
   */
  align?: 'baseline' | 'center';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header
      className={cn(
        'mb-l flex flex-col justify-between gap-xl sm:flex-row',
        align === 'center' ? 'items-center' : 'items-start sm:items-end',
        className,
      )}
    >
      <div>
        <p className={kickerClassName}>{kicker}</p>
        <h1 className="m-0 text-display leading-none tracking-[-0.06em]">{title}</h1>
        {subtitle ? <p className="mt-xs mb-0 text-body-sm text-text-muted">{subtitle}</p> : null}
      </div>
      {children}
    </header>
  );
}
