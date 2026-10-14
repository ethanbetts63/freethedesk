import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { focusRingClassName } from '@/lib/controlState';
import { getSiteSettingsServer, SERVICE_PRICE_FIELDS } from '@/lib/serverApi';
import { servicePrices } from '@/lib/servicePricing';
import { cn } from '@/lib/utils';

/* The service prices plus the SEO plans, which the "from" figure is the cheapest of. */
const REQUIRED = [
  ...SERVICE_PRICE_FIELDS,
  'seo_monthly_price',
  'seo_quarterly_price',
  'seo_yearly_price',
  'seo_oneoff_price',
] as const;

type Tile = {
  label: string;
  /** A starting price: "from" is printed small before the figure. */
  from?: boolean;
  price: string;
  unit?: string;
  line: string;
  href: string;
  /** Grid placement: websites and SEO are the business, so they take the room. */
  className: string;
  dark?: boolean;
  /** The moving-colour border and price, as on the enquiry form. */
  moving?: boolean;
};

const tileClassName =
  'group relative flex flex-col overflow-hidden rounded-md border p-l no-underline transition-colors duration-200 sm:p-xl';

/**
 * The homepage's price list, as a mosaic: every figure the service pages sell at,
 * each tile linking to the page that sells it.
 *
 * Read from the admin like the service pages, so a figure here cannot drift from
 * theirs. If the settings cannot be read the section is left out rather than
 * guessed at: a wrong price is worse than none, and the homepage stays up.
 */
export async function HomePricingMosaic() {
  let prices;
  try {
    prices = servicePrices(await getSiteSettingsServer(REQUIRED));
  } catch (error) {
    console.error('Homepage prices unavailable; leaving the mosaic out.', error);
    return null;
  }

  // The package the "from" figure is, so its sum is the one printed beside it.
  const cheapest = prices.packages
    .filter((item) => !item.discovery)
    .reduce((low, item) => (item.price < low.price ? item : low));

  const tiles: Tile[] = [
    {
      label: 'Websites',
      from: true,
      price: prices.websiteFrom,
      line: `${cheapest.priceNote}, half when you buy and half before launch.`,
      href: '/website-development#packages',
      className: 'col-span-2 lg:row-span-2',
      dark: true,
    },
    {
      label: 'SEO audits',
      from: true,
      price: prices.seoFrom,
      unit: 'an audit',
      line: 'One audit, or one every month, quarter or year. Cancel any time.',
      href: '/seo',
      className: 'col-span-2',
      moving: true,
    },
    {
      label: 'Discovery',
      price: prices.discoveryTotal,
      line: `${prices.discoveryHours} hours, paid upfront, to scope a custom build.`,
      href: '/automation#packages',
      className: 'col-span-2 sm:col-span-1',
    },
    {
      label: 'Hourly rate',
      price: prices.hourlyRate,
      unit: '/ hour',
      line: 'Changes and new features after launch, agreed before we start.',
      href: '/contact',
      className: 'col-span-2 sm:col-span-1',
    },
  ];

  return (
    <section
      className="site-shell py-section-half [scroll-margin-top:24px]"
      id="pricing"
      aria-label="Prices"
    >
      <ul className="m-0 grid list-none auto-rows-[minmax(220px,auto)] grid-cols-2 gap-s p-0 lg:grid-cols-4">
        {tiles.map((tile) => (
          <li key={tile.label} className={cn('flex', tile.className)}>
            <Link
              href={tile.href}
              className={cn(
                tileClassName,
                'w-full',
                focusRingClassName,
                tile.dark
                  ? 'border-surface-dark bg-surface-dark text-text-on-dark hover:bg-surface-dark-hover'
                  : tile.moving
                    ? 'moving-colour-border text-text-secondary hover:[--moving-colour-inset:var(--surface-tint)]'
                    : 'border-border-default bg-surface-tint text-text-secondary hover:border-border-strong-hover',
              )}
            >
              <span
                className={cn(
                  'relative',
                  tile.dark ? 'text-display text-text-on-dark' : 'text-title text-text-primary',
                  // After the size: tailwind-merge drops a leading that comes before one.
                  'leading-[1.02] font-heavy tracking-[-0.045em]',
                )}
              >
                {tile.label}
              </span>
              {tile.dark && <BrowserSketch />}
              <span className="relative mt-auto flex flex-wrap items-baseline gap-x-xs pt-xl">
                {tile.from && (
                  <span
                    className={cn(
                      'text-lead',
                      tile.dark ? 'text-text-on-dark-muted' : 'text-text-muted',
                    )}
                  >
                    from
                  </span>
                )}
                <strong
                  className={cn(
                    tile.dark
                      ? 'text-hero text-accent-on-dark'
                      : cn('text-display', tile.moving ? 'moving-colour-text' : 'text-text-action'),
                    'leading-none font-heavy tracking-[-0.05em]',
                  )}
                >
                  {tile.price}
                </strong>
                {tile.unit && (
                  <span
                    className={cn(
                      'text-lead',
                      tile.dark ? 'text-text-on-dark-muted' : 'text-text-muted',
                    )}
                  >
                    {tile.unit}
                  </span>
                )}
                <ArrowRight
                  aria-hidden="true"
                  className={cn(
                    'ml-auto size-[24px] shrink-0 self-center transition-transform duration-200 group-hover:translate-x-3xs',
                    tile.dark ? 'text-text-on-dark-muted' : 'text-text-subtle',
                  )}
                />
              </span>
              <span
                className={cn(
                  'relative mt-s block max-w-[420px] text-body leading-relaxed',
                  tile.dark ? 'text-text-on-dark-muted' : 'text-text-muted',
                )}
              >
                {tile.line}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * A website drawn in outline: the Websites tile's picture, cropped by the tile's
 * edge so it reads as a page carrying on past it. Decoration only.
 */
function BrowserSketch() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 420 300"
      fill="none"
      className="pointer-events-none mt-l -mr-[40%] w-[115%] max-w-none self-start text-accent-on-dark opacity-60 transition-transform duration-300 group-hover:-translate-y-3xs sm:absolute sm:top-[22%] sm:-right-[6%] sm:m-0 sm:w-[58%]"
    >
      <g stroke="currentColor" strokeWidth="2">
        <rect x="1" y="1" width="418" height="298" rx="14" />
        <path d="M1 38h418" />
        <rect x="140" y="13" width="200" height="13" rx="6.5" strokeOpacity="0.6" />
        <rect x="32" y="62" width="64" height="9" rx="4.5" strokeOpacity="0.6" />
        <path d="M250 66h40M306 66h40M362 66h28" strokeOpacity="0.6" strokeLinecap="round" />
        <rect x="32" y="190" width="104" height="30" rx="15" />
        <rect x="248" y="96" width="142" height="124" rx="10" strokeOpacity="0.6" />
        <path d="m248 196 40-38 30 26 22-18 50 34" strokeOpacity="0.6" strokeLinejoin="round" />
        <circle cx="356" cy="128" r="12" strokeOpacity="0.6" />
        <rect x="32" y="244" width="110" height="40" rx="8" strokeOpacity="0.4" />
        <rect x="156" y="244" width="110" height="40" rx="8" strokeOpacity="0.4" />
        <rect x="280" y="244" width="110" height="40" rx="8" strokeOpacity="0.4" />
      </g>
      <g fill="currentColor">
        <circle cx="22" cy="19.5" r="5" />
        <circle cx="40" cy="19.5" r="5" fillOpacity="0.6" />
        <circle cx="58" cy="19.5" r="5" fillOpacity="0.35" />
        <rect x="32" y="98" width="180" height="20" rx="4" />
        <rect x="32" y="128" width="140" height="20" rx="4" />
        <rect x="32" y="162" width="160" height="8" rx="4" fillOpacity="0.5" />
      </g>
    </svg>
  );
}
