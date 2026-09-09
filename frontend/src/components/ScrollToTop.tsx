"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Resets scroll to the top on client-side navigation, which can otherwise land
 * part-way down a long page. Skipped when the URL has a hash, so the browser's
 * own anchor jump wins (/licensing#signup, /portfolio/*#tour).
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
