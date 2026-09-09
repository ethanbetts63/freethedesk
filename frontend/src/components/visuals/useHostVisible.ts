"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Watches the parent of a sentinel element and reports when it nears the
 * viewport. Returns the ref to place on the sentinel.
 *
 * Deliberately observes the parent rather than the sentinel: where that wrapper
 * is `display: none` under a breakpoint - the footer backdrop below 640px - it
 * never intersects, so the visual is never fetched at that size at all.
 *
 * Only for decoration below the fold. Anything above it should be imported
 * normally: the chunk cannot start downloading until hydration finishes, so
 * deferring something already on screen just delays it.
 */
export function useHostVisible(rootMargin = "300px") {
  const sentinel = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const host = sentinel.current?.parentElement;
    if (!host) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { rootMargin },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { sentinel, visible };
}
