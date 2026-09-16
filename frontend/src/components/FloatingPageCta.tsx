'use client';

import { useEffect, useState } from 'react';

import { MovingColourButton } from './MovingColourButton';

export function FloatingPageCta({
  label,
  href,
  showAfterId,
  hideAtId,
}: {
  label: string;
  href: string;
  showAfterId: string;
  hideAtId: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const start = document.getElementById(showAfterId);
      const end = document.getElementById(hideAtId);

      if (!start || !end) {
        setVisible(false);
        return;
      }

      const heroHasPassed = start.getBoundingClientRect().top <= 0;
      const enquiryIsApproaching = end.getBoundingClientRect().top <= window.innerHeight * 0.8;
      setVisible(heroHasPassed && !enquiryIsApproaching);
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);

    return () => {
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, [hideAtId, showAfterId]);

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
        className="w-full shadow-[0_12px_32px_color-mix(in_srgb,var(--surface-inverse)_24%,transparent)] sm:w-auto"
        href={href}
        direction="down"
      >
        {label}
      </MovingColourButton>
    </div>
  );
}
