'use client';

/* Component registry: freetheplatform/frontend/registry/src/components/common/ScrollCtaButton.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import type { ReactNode } from 'react';

import { scrollToId } from '@/lib/scrollToId';

interface ScrollCtaButtonProps {
  targetId: string;
  /**
   * The owning CTA family must resolve its closed variants before this
   * behaviour-only primitive is called. Required and named `classes` to make
   * that boundary explicit; this is not an optional appearance override.
   */
  classes: string;
  disabled?: boolean;
  ariaLabel?: string;
  children: ReactNode;
}

/**
 * The in-page ("scroll down to the form") form of a CTA: it moves the reader
 * without putting the target in the URL. It carries no href on purpose — see
 * `scrollToId` for why a real hash link only works once.
 */
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
