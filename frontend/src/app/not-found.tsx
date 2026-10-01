/**
 * The 404 page.
 *
 * Until this file existed, every `notFound()` in the app -- and every mistyped
 * URL, and every link to a page that has since moved -- rendered Next's stock
 * black-on-white "404 | This page could not be found": no header, no footer, no
 * way onward, and nothing saying whose site it is. On a site whose main channel
 * is organic search, that page has real traffic.
 *
 * It renders inside the root layout, so the header and footer come with it.
 */
import Link from 'next/link';

import { CtaButton } from '@/components/CtaButton';

const DESTINATIONS = [
  { href: '/website-development', label: 'Website development' },
  { href: '/seo', label: 'SEO' },
  { href: '/automation', label: 'Automation' },
  { href: '/portfolio/scooter-shop', label: 'Case study: Scooter Shop' },
];

export default function NotFound() {
  return (
    <div className="site-shell py-16 sm:py-24">
      <p className="text-label uppercase tracking-widest text-text-muted">404</p>
      <h1 className="mt-2 text-display font-semibold text-text-primary">That page is not here</h1>
      <p className="mt-4 text-lead text-text-secondary">
        It may have moved, or the address may have a typo in it. These are the pages people usually
        want.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {DESTINATIONS.map((destination) => (
          <li key={destination.href}>
            <Link
              href={destination.href}
              className="block border border-border-default px-4 py-3 text-body text-text-primary transition-colors hover:bg-surface-muted"
            >
              {destination.label}
            </Link>
          </li>
        ))}
      </ul>

      <CtaButton href="/" className="mt-8">
        Back to the home page
      </CtaButton>
    </div>
  );
}
