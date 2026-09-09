"use client";

import { scrollToId } from "@/lib/scrollToId";

/**
 * The in-page ("scroll down to the form") variant of a CTA. Rendered by
 * `CtaButton` whenever its `href` is a bare `#fragment`. It carries no href on
 * purpose - see `scrollToId` for why a real hash link only works once.
 */
export function ScrollCtaButton({
  targetId,
  className = "",
  children,
}: {
  targetId: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={className} onClick={() => scrollToId(targetId)}>
      {children}
    </button>
  );
}
