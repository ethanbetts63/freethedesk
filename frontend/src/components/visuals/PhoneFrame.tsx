import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * A drawn phone: bezel, notch, optional menu overlay, optional home bar.
 *
 * The site drew three of these — a diagram in the licensing illustrations, a
 * small one pinned into the case-study hero, and a large free-standing one —
 * in two places (this file and `styles/phone-mockup.css`) under three sets of
 * names. They are one object at three scales, so they are one component at
 * three sizes now:
 *
 *   diagram    175x340, fixed. Invented contents, not a screenshot.
 *   inset      pinned into a larger composition; grows 84 -> 105 -> 160px.
 *   standalone free-standing, 218x410 growing to 250x465.
 *
 * Every dimension here is literal. These are the proportions of a drawn
 * object, not interface spacing, so no token applies.
 */
const SIZES = {
  diagram: {
    frame:
      'relative h-[340px] w-[175px] flex-none rounded-[26px] border-[6px] border-surface-inverse bg-surface-inverse shadow-contrast-l',
    notch: 'z-3 h-[8px] w-[44px] rounded-b-md bg-surface-inverse',
    homeBar: true,
  },
  inset: {
    frame:
      'absolute bottom-[10px] left-[-6px] z-3 w-[84px] rounded-[20px] border-4 border-surface-dark bg-surface-dark shadow-m sm:bottom-0 sm:left-0 sm:w-[105px] lg:w-[160px]',
    notch: 'z-2 h-[10px] w-[55px] rounded-b-m bg-surface-dark',
    homeBar: false,
  },
  standalone: {
    frame:
      'relative z-2 h-[410px] w-[218px] rounded-[29px] border-[7px] border-surface-inverse bg-surface-inverse shadow-contrast-l lg:h-[465px] lg:w-[250px]',
    notch: 'z-2 h-[16px] w-[80px] rounded-b-l bg-surface-inverse',
    homeBar: false,
  },
} as const;

export function PhoneFrame({
  children,
  size = 'diagram',
  menu = false,
  className,
}: {
  children: ReactNode;
  size?: keyof typeof SIZES;
  /** The three-line menu button drawn over the top right of a screenshot. */
  menu?: boolean;
  className?: string;
}) {
  const preset = SIZES[size];
  return (
    <div
      className={cn(
        'overflow-hidden [&_img]:block [&_img]:h-auto [&_img]:w-full',
        preset.frame,
        className,
      )}
      aria-hidden="true"
    >
      <div className={cn('absolute top-0 left-1/2 -translate-x-1/2', preset.notch)} />
      {menu ? (
        <div className="absolute top-[10px] right-[5px] z-4 flex w-[25px] flex-col items-stretch justify-center gap-4xs bg-surface-inverse p-2xs [&>i]:block [&>i]:h-px [&>i]:w-full [&>i]:bg-surface-page">
          <i />
          <i />
          <i />
        </div>
      ) : null}
      {size === 'diagram' ? (
        <div className="relative h-full w-full overflow-hidden bg-surface-tint">{children}</div>
      ) : (
        children
      )}
      {preset.homeBar ? (
        <div className="absolute bottom-[8px] left-1/2 z-3 h-[3px] w-[46px] -translate-x-1/2 rounded-[var(--radius-2xs)] bg-surface-page opacity-50" />
      ) : null}
    </div>
  );
}

/** The floating "live" pill that sits alongside the case-study hero phone. */
export function LivePill({ children }: { children: ReactNode }) {
  return (
    <div className="absolute top-[9px] right-[-4px] z-4 flex items-center gap-xs bg-surface-page p-xs text-label font-heavy shadow-s sm:px-m sm:py-s lg:right-[22px] sm:text-caption">
      <i className="h-[7px] w-[7px] rounded-[var(--radius-circle)] bg-[var(--status-won)] shadow-halo [--ring-halo-colour:var(--status-won)]" />{' '}
      {children}
    </div>
  );
}
