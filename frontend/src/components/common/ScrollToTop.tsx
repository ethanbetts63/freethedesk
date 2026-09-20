'use client';

/* Component registry: freetheplatform/frontend/registry/src/components/common/ScrollToTop.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Resets scroll to the top on client-side navigation, which can otherwise land
 * part-way down a long page.
 *
 * Skipped when the URL has a hash, so the browser's own anchor jump wins — a
 * copy of this without that guard fought every deep link on the site.
 * `scroll-behavior` is forced to `auto` for the jump so a global `smooth` does
 * not animate a page change.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.hash) return;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = '';
  }, [pathname]);

  return null;
}

export default ScrollToTop;
