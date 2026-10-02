'use client';

import { usePathname } from 'next/navigation';

import { AiReadinessModal } from '@/components/marketing/AiReadinessModal';
import { isApplicationRoute, usesStandaloneChrome } from '@/lib/chromeRoutes';

/**
 * Picks which chrome a route gets. Header and footer arrive as already-rendered
 * server elements rather than imports, so their markup never reaches the client
 * bundle - this component only chooses whether to place them.
 */
export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const standalone = usesStandaloneChrome(pathname);
  const applicationArea = isApplicationRoute(pathname);
  return (
    <>
      {!standalone && header}
      {children}
      {!standalone && footer}
      {/* /seo has its own one-minute prompt, the click-value calculator. */}
      {!standalone && !applicationArea && pathname !== '/seo' && <AiReadinessModal />}
    </>
  );
}
