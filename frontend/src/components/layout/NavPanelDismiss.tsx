'use client';

/* Component registry: freetheplatform/frontend/registry/src/components/layout/NavPanelDismiss.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { useDetailsDismiss } from '@/hooks/useDisclosure';

/** Closes the hamburger panel on navigate, outside tap and Escape; the only client code in it, so the nav markup stays on the server. */
export function NavPanelDismiss() {
  return <span ref={useDetailsDismiss()} hidden />;
}
