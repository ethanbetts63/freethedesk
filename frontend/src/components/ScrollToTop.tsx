"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Next restores scroll position itself, but a client-side navigation into a
 * long page can land part-way down. This resets it - except when the URL
 * carries a hash, where the browser's own anchor jump is what we want and
 * scrolling to the top would fight it (/licensing#signup, /portfolio/*#tour).
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.hash) return;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = "";
  }, [pathname]);

  return null;
}
