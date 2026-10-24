'use client';

/* Component registry: freetheplatform/frontend/registry/src/components/layout/NavPanelDismiss.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { useEffect } from 'react';

import { useDetailsDismiss } from '@/hooks/useDisclosure';

/**
 * Closes the hamburger panel on navigate, outside tap and Escape, and holds the page still while the full-screen
 * menu covers it. The only client code in the panel, so the nav markup stays on the server.
 */
export function NavPanelDismiss() {
  const anchor = useDetailsDismiss();

  useEffect(() => {
    const panel = anchor.current?.closest('details');
    if (!panel) return;

    const root = document.documentElement;
    const lockScroll = () => {
      root.style.overflow = panel.open ? 'hidden' : '';
    };

    panel.addEventListener('toggle', lockScroll);
    return () => {
      panel.removeEventListener('toggle', lockScroll);
      root.style.overflow = '';
    };
  }, [anchor]);

  return <span ref={anchor} hidden />;
}
