import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * The site's one drawn phone: a dark handset with an even bezel, the screen's
 * corners rounded inside it, and the flat slab every visual on the site sits
 * on, offset down and right. No notch and no home bar. It is the sample
 * report cover's handset, and every phone on the site is this one.
 *
 * Every measure is a share of the frame's width (`cqw`), so the handset keeps
 * the cover's proportions at any size: the cover draws it 228 wide with a
 * 216-wide body, an 8 bezel, 30 and 23 corners and a 12 slab. Only the width
 * and placement differ by size:
 *
 *   diagram    175 wide, a phone-shaped screen. Invented contents, not a screenshot.
 *   standalone free-standing, 218 growing to 250.
 *   fill       the width of whatever holds it, the screen as tall as its contents.
 *
 * Every size but `fill` gives the screen a phone's proportions, so a phone
 * screenshot fills it exactly and anything else can crop to it.
 */
/* eslint-disable no-restricted-syntax -- A drawn object, not an interface element:
   these are the cover handset's own proportions, as shares of its width, and its
   placement when it stands alone. No token means either. */
const SIZES = {
  diagram: { frame: 'relative w-[175px] flex-none', phoneScreen: true, hidden: true },
  standalone: { frame: 'relative z-2 w-[218px] lg:w-[250px]', phoneScreen: true, hidden: true },
  fill: { frame: 'w-full', phoneScreen: false, hidden: false },
} as const;

const bodyClassName =
  'mr-[5.3cqw] mb-[5.3cqw] rounded-[13.2cqw] bg-text-primary p-[3.5cqw] shadow-[5.3cqw_5.3cqw_0_var(--surface-tint-strong)]';
const screenClassName =
  'relative overflow-hidden rounded-[10.1cqw] bg-surface-page [&_img]:block [&_img]:h-auto [&_img]:w-full';
/* eslint-enable no-restricted-syntax */

export function PhoneFrame({
  children,
  size = 'diagram',
}: {
  children: ReactNode;
  size?: keyof typeof SIZES;
}) {
  const preset = SIZES[size];
  return (
    <div className={cn('@container', preset.frame)} aria-hidden={preset.hidden || undefined}>
      <div className={bodyClassName}>
        <div className={cn(screenClassName, preset.phoneScreen && 'aspect-[390/844]')}>
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * A small white pill floating over a drawn composition: the case-study hero's
 * "live" note and the mobile story's numbered callout are the same object at
 * different corners, so position and shadow come from the caller.
 */
export function FloatingPill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'absolute z-4 flex items-center gap-xs bg-surface-page p-xs text-label font-heavy sm:px-m sm:py-s sm:text-caption',
        className,
      )}
    >
      {children}
    </div>
  );
}
