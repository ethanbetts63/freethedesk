'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { trackEvent } from '@/lib/analytics';

/**
 * `contact_click` for every phone and email link, wherever it sits, from one
 * listener rather than a handler on each link. A tap on the phone number is a
 * lead the enquiry form never sees. `excludedRoutes` is the same list GA itself
 * skips: a staff member emailing a customer from the dashboard is not a lead.
 */
export function ContactClickTracking({ excludedRoutes }: { excludedRoutes: readonly string[] }) {
  const pathname = usePathname();
  const excluded = excludedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  useEffect(() => {
    if (excluded) return;

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href]');
      const href = link?.getAttribute('href') ?? '';
      const method = href.startsWith('tel:')
        ? 'phone'
        : href.startsWith('mailto:')
          ? 'email'
          : null;
      if (!method || !link) return;
      trackEvent('contact_click', {
        method,
        link_location: link.closest('footer') ? 'footer' : 'page',
      });
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [excluded]);

  return null;
}
