"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Watches the parent of a sentinel element and reports when it nears the
 * viewport. Returns the ref to place on the sentinel.
 *
 * Deliberately observes the parent rather than the sentinel: the wrappers these
 * visuals sit in are `display: none` under their breakpoints, so a hidden one
 * never intersects and the visual is never fetched at that size at all.
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
