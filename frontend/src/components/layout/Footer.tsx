import Image from 'next/image';
import Link from 'next/link';

import { FOOTER_NAVIGATION, PORTFOLIO_NAVIGATION } from '@/lib/siteConfig';
import { DeferredSignalFlow } from '@/components/visuals/DeferredSignalFlow';
import { SiteFooter, type FooterColumn } from '@/components/layout/SiteFooter';

/**
 * The graph-paper backdrop plus the signal-flow canvas, the two things that
 * make this footer this site's rather than a shared shell. The grid layers are
 * the hero's, from `--tint-hero-grid`; only the fade is the footer's own, so
 * the pattern never meets a hard boundary at the top or either edge.
 */
const gridBackdropClassName = [
  "absolute inset-0 pointer-events-none content-['']",
  '[background-image:linear-gradient(to_top,var(--surface-page)_0%,transparent_20%),linear-gradient(to_right,var(--surface-page)_0%,transparent_14%),linear-gradient(to_left,var(--surface-page)_0%,transparent_14%),linear-gradient(var(--tint-hero-grid)_1px,transparent_1px),linear-gradient(90deg,var(--tint-hero-grid)_1px,transparent_1px)]',
  '[background-size:100%_100%,100%_100%,100%_100%,var(--hero-grid-size)_var(--hero-grid-size),var(--hero-grid-size)_var(--hero-grid-size)]',
  '[background-repeat:no-repeat,no-repeat,no-repeat,repeat,repeat]',
].join(' ');

const COLUMNS: FooterColumn[] = [
  { label: 'Explore', links: [...FOOTER_NAVIGATION] },
  { label: 'Portfolio', links: [...PORTFOLIO_NAVIGATION] },
  {
    label: 'Based in',
    links: [
      {
        href: 'mailto:hello@freethedesk.com.au',
        label: 'hello@freethedesk.com.au',
        external: true,
      },
    ],
    children: <span className="text-body-sm text-text-muted">Perth, Western Australia</span>,
  },
  {
    label: 'Terms & policies',
    links: [
      { href: '/legal/privacy', label: 'Privacy policy' },
      { href: '/legal/dealer-subscription-terms', label: 'Dealer subscription terms' },
      { href: '/legal/customer-terms', label: 'Customer terms' },
    ],
  },
];

export function Footer() {
  return (
    <SiteFooter
      columns={COLUMNS}
      backdrop={
        <>
          <div aria-hidden="true" className={gridBackdropClassName} />
          {/* Hidden below `sm`: the canvas costs more than it reads at phone width. */}
          <div className="pointer-events-none absolute inset-0 hidden opacity-60 sm:block [&_canvas]:h-full [&_canvas]:w-full">
            <DeferredSignalFlow smooth />
          </div>
        </>
      }
      brand={
        <>
          <Link
            className="wordmark flex items-center gap-xs"
            href="/"
            aria-label="freethedesk home"
          >
            <Image
              className="nav-logo-image"
              src="/logo-192x192.png"
              alt=""
              width={40}
              height={40}
            />
            <span className="nav-logo-text">
              free<span>the</span>desk<span className="wordmark-dot">.</span>
            </span>
          </Link>
          <p className="mt-l mb-0 max-w-[360px] text-body leading-relaxed text-text-muted">
            Websites, SEO and automation for Perth businesses, built by a Perth development team
            with years of hands-on experience.
          </p>
        </>
      }
      legal={
        <>
          <span>&copy; {new Date().getFullYear()} freethedesk</span>
          <span>ABN 11 493 753 896</span>
          <span>Perth-based, with clients across Australia</span>
        </>
      }
    />
  );
}
