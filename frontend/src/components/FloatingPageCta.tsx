'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

import type { CtaDirection } from './CtaButton';

import { MovingColourButton } from './MovingColourButton';

export function FloatingPageCta({
  label,
  href,
  showAfterId,
  hideAtId,
  direction = 'down',
}: {
  label: string;
  href: string;
  showAfterId: string;
  hideAtId: string;
  /** Up where the form it leads to is above it, as on the package pages. */
  direction?: Extract<CtaDirection, 'up' | 'down'>;
}) {
  const visible = useScrollReveal({ showAfterId, hideBeforeId: hideAtId });

  return (
    <div
      className={`fixed right-[var(--gutter)] bottom-[calc(12px+env(safe-area-inset-bottom))] left-[var(--gutter)] z-40 transition-[opacity,transform] duration-[180ms] ease-in-out motion-reduce:transition-none sm:right-[28px] sm:left-auto sm:bottom-[28px] ${
        visible
          ? 'pointer-events-auto visible translate-y-0 opacity-100'
          : 'pointer-events-none invisible translate-y-[18px] opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <MovingColourButton
        className="w-full shadow-contrast-s sm:w-auto"
        href={href}
        direction={direction}
      >
        {label}
      </MovingColourButton>
    </div>
  );
}
