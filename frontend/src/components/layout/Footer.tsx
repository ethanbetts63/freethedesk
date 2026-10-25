import { FOOTER_NAVIGATION, OPENING_HOURS } from '@/lib/siteConfig';
import Eyebrow from '@/components/common/eyebrow';
import { DeferredSignalFlow } from '@/components/visuals/DeferredSignalFlow';
import { SiteFooter, type FooterColumn } from '@/components/layout/SiteFooter';
import { Wordmark } from '@/components/Wordmark';

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
  /* Where and when in one column: how to reach us, where we are, then the hours. */
  {
    label: 'Contact',
    links: [
      { href: 'tel:+61423853830', label: '0423 853 830', external: true },
      {
        href: 'mailto:hello@freethedesk.com.au',
        label: 'hello@freethedesk.com.au',
        external: true,
      },
    ],
    children: (
      <>
        <div className="mt-l mb-xs">
          <Eyebrow size="sm" tone="muted">
            Based in
          </Eyebrow>
        </div>
        <span className="text-body-sm text-text-muted">Perth, Western Australia</span>
        <div className="mt-l mb-xs">
          <Eyebrow size="sm" tone="muted">
            Hours
          </Eyebrow>
        </div>
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-s gap-y-3xs text-body-sm text-text-muted">
          {OPENING_HOURS.week.map((day) => (
            <div key={day} className="contents">
              <dt className="font-strong text-text-secondary">{day}</dt>
              <dd className="m-0 whitespace-nowrap">{OPENING_HOURS.dayHours}</dd>
            </div>
          ))}
        </dl>
      </>
    ),
  },
  { label: 'Explore', links: [...FOOTER_NAVIGATION] },
  {
    label: 'Terms & policies',
    links: [
      { href: '/legal/privacy', label: 'Privacy policy' },
      { href: '/legal/dealer-subscription-terms', label: 'Dealer subscription terms' },
      { href: '/legal/customer-terms', label: 'Customer terms' },
      { href: '/legal/seo-audit-terms', label: 'SEO audit terms' },
      { href: '/legal/affiliate-program-terms', label: 'Affiliate program terms' },
      { href: '/legal/web-development-terms', label: 'Web development terms' },
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
          <Wordmark href="/" />
          <p className="mt-l mb-0 max-w-[360px] text-body leading-relaxed text-text-muted">
            Websites, web applications, automation and SEO audits for Perth businesses, built by a
            Perth development team with years of hands-on experience.
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
