import Image from 'next/image';
import Link from 'next/link';

import { FOOTER_NAVIGATION, PORTFOLIO_NAVIGATION } from '@/lib/siteConfig';
import { DeferredSignalFlow } from '@/components/visuals/DeferredSignalFlow';
import { cn } from '@/lib/utils';

/**
 * The footer's two text tints. Neither is a semantic role: they are the muted
 * greys pulled part of the way towards the link blue so the whole footer reads
 * as one quiet, faintly interactive block rather than as body copy. Local
 * constants rather than tokens because nothing outside this file wants them.
 */
const quietTextClassName =
  'text-[color-mix(in_srgb,var(--text-subtle)_55%,var(--text-action)_45%)]';
const linkTextClassName = 'text-[color-mix(in_srgb,var(--text-muted)_50%,var(--text-action)_50%)]';

/**
 * Footer links render as 19px-tall rows, too small to tap reliably, so on
 * narrow screens each is widened to the tap minimum rather than enlarged —
 * that keeps the visual weight while giving the finger a target. From `lg` the
 * rows go back to inline text. `overflow-wrap` is for the email address, a
 * single unbreakable token wider than its column.
 */
const footerLineClassName = cn(
  'flex min-h-[var(--tap-min)] items-center [overflow-wrap:anywhere] lg:inline lg:min-h-0',
  linkTextClassName,
);
const footerLinkClassName = cn(footerLineClassName, 'hover:text-text-action');

const footerLabelClassName = cn(
  'm-0 mb-xs text-micro font-heavy tracking-label uppercase',
  quietTextClassName,
);

const footerColumnClassName = 'flex flex-col gap-0 text-small lg:gap-s';

/**
 * The graph-paper backdrop, faded out at the top and both edges so it never
 * meets a hard boundary. Same two grid layers as the hero and the portfolio
 * case study; when `case-study.css` migrates it is worth naming the pair once.
 */
const footerGridBackdropClassName = [
  "relative overflow-hidden before:absolute before:inset-0 before:content-[''] before:pointer-events-none",
  'before:[background-image:linear-gradient(to_top,var(--surface-page)_0%,transparent_20%),linear-gradient(to_right,var(--surface-page)_0%,transparent_14%),linear-gradient(to_left,var(--surface-page)_0%,transparent_14%),linear-gradient(var(--tint-hero-grid)_1px,transparent_1px),linear-gradient(90deg,var(--tint-hero-grid)_1px,transparent_1px)]',
  'before:[background-repeat:no-repeat,no-repeat,no-repeat,repeat,repeat]',
  'before:[background-size:100%_100%,100%_100%,100%_100%,var(--hero-grid-size)_var(--hero-grid-size),var(--hero-grid-size)_var(--hero-grid-size)]',
].join(' ');

export function SiteFooter() {
  return (
    <footer
      className={cn(
        'bg-surface-page pt-section pb-l text-text-primary',
        footerGridBackdropClassName,
      )}
    >
      {/* Hidden below `sm`: the canvas costs more than it reads at phone width. */}
      <div className="pointer-events-none absolute inset-0 hidden opacity-60 sm:block [&_canvas]:h-full [&_canvas]:w-full">
        <DeferredSignalFlow smooth />
      </div>
      <div className="site-shell relative z-1 grid grid-cols-[minmax(0,1fr)] gap-2xl sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)_minmax(0,0.55fr)_minmax(0,0.75fr)_minmax(0,0.85fr)]">
        {/* The wordmark block spans the pair of columns at `sm` and takes the
            widest track once there are five. */}
        <div className="sm:col-span-full lg:col-auto">
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
          <p className={cn('mt-l mb-0 max-w-[360px] text-body leading-[1.6]', quietTextClassName)}>
            Dealer websites and operational systems built by a development team with hands-on
            experience across dealerships and automotive suppliers.
          </p>
        </div>
        <div className={footerColumnClassName}>
          <p className={footerLabelClassName}>Explore</p>
          {FOOTER_NAVIGATION.map((item) => (
            <Link key={item.href} className={footerLinkClassName} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className={footerColumnClassName}>
          <p className={footerLabelClassName}>Portfolio</p>
          {PORTFOLIO_NAVIGATION.map((item) => (
            <Link key={item.href} className={footerLinkClassName} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className={footerColumnClassName}>
          <p className={footerLabelClassName}>Based in</p>
          <span className={footerLineClassName}>Perth, Western Australia</span>
          <a className={footerLinkClassName} href="mailto:hello@freethedesk.com.au">
            hello@freethedesk.com.au
          </a>
        </div>
        <div className={footerColumnClassName}>
          <p className={footerLabelClassName}>Terms &amp; policies</p>
          <Link className={footerLinkClassName} href="/legal/privacy">
            Privacy policy
          </Link>
          <Link className={footerLinkClassName} href="/legal/dealer-subscription-terms">
            Dealer subscription terms
          </Link>
        </div>
      </div>
      <div
        className={cn(
          'site-shell relative z-1 mt-3xl flex flex-col items-start justify-between gap-xs border-t border-border-default pt-ml text-meta lg:flex-row lg:items-center lg:gap-0',
          quietTextClassName,
        )}
      >
        <span>© {new Date().getFullYear()} freethedesk</span>
        <span>ABN 11 493 753 896</span>
        <span>Working with dealers across Australia</span>
      </div>
    </footer>
  );
}
