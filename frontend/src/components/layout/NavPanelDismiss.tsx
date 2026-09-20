'use client';

/* Component registry: freetheplatform/frontend/registry/src/components/layout/NavPanelDismiss.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { useDetailsDismiss } from '@/hooks/useDisclosure';

/**
 * Closes the hamburger panel on navigate, on an outside tap, and on Escape.
 *
 * Deliberately the only client code in the mobile panel: the panel itself is a
 * native `<details>`, so it opens and closes with no JavaScript at all, its
 * links are correctly unfocusable while it is closed, and the nav markup stays
 * on the server.
 */
export function NavPanelDismiss() {
  return <span ref={useDetailsDismiss()} hidden />;
}
