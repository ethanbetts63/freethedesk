'use client';

/* Component registry: freetheplatform/frontend/registry/src/components/common/ScrollCtaButton.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import type { ReactNode } from 'react';

import { scrollToId } from '@/lib/scrollToId';

interface ScrollCtaButtonProps {
  targetId: string;
  /** Already-resolved variants from the owning CTA family; required, not an optional appearance override. */
  classes: string;
  disabled?: boolean;
  ariaLabel?: string;
  children: ReactNode;
}

/** The in-page CTA: scrolls without putting the target in the URL, and has no href because a hash link only works once (`scrollToId`). */
export function ScrollCtaButton({
  targetId,
  classes,
  disabled,
  ariaLabel,
  children,
}: ScrollCtaButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      className={classes}
      onClick={() => scrollToId(targetId)}
    >
      {children}
    </button>
  );
}

export default ScrollCtaButton;
