'use client';

/* Component registry: freetheplatform/frontend/registry/src/hooks/useScrollReveal.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { useEffect, useState } from 'react';

/**
 * Whether a floating element should show: once `showAfterId` has scrolled past the top, until `hideBeforeId` approaches
 * (an "enquire" button is noise beside the form). `hideMargin` is the viewport-height fraction at which that counts.
 */
export function useScrollReveal({
  showAfterId,
  hideBeforeId,
  hideMargin = 0.8,
}: {
  showAfterId: string;
  hideBeforeId: string;
  hideMargin?: number;
}): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const start = document.getElementById(showAfterId);
      const end = document.getElementById(hideBeforeId);

      if (!start || !end) {
        setVisible(false);
        return;
      }

      const startHasPassed = start.getBoundingClientRect().top <= 0;
      const endIsApproaching = end.getBoundingClientRect().top <= window.innerHeight * hideMargin;
      setVisible(startHasPassed && !endIsApproaching);
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);

    return () => {
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, [showAfterId, hideBeforeId, hideMargin]);

  return visible;
}
