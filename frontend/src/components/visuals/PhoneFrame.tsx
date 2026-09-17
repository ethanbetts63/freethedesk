import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * A drawn phone: bezel, notch, screen and home bar. Both licensing
 * illustrations had their own copy of it under different class names in
 * `page.module.css`.
 *
 * Deliberately not merged with `styles/phone-mockup.css`. That one frames real
 * screenshots inside a larger composition and is sized by the layout around it;
 * this one is a fixed 175x340 diagram with invented contents. They look alike
 * and are doing different jobs.
 *
 * The bezel radius and the notch and home-bar dimensions are literal values
 * rather than tokens: they are the proportions of a drawn object, not
 * interface spacing.
 */
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative h-[340px] w-[175px] flex-none overflow-hidden rounded-[26px] border-[6px] border-surface-inverse bg-surface-inverse shadow-contrast-l',
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute top-0 left-1/2 z-3 h-[8px] w-[44px] -translate-x-1/2 rounded-b-md bg-surface-inverse" />
      <div className="relative h-full w-full overflow-hidden bg-surface-tint">{children}</div>
      <div className="absolute bottom-[8px] left-1/2 z-3 h-[3px] w-[46px] -translate-x-1/2 rounded-[var(--radius-2xs)] bg-surface-page opacity-50" />
    </div>
  );
}
