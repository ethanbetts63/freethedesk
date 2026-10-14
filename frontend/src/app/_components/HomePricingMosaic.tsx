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
};

const tileClassName =
  'group flex min-h-[180px] flex-col rounded-md border p-l no-underline transition-colors duration-200 sm:p-xl';

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
    },
    {
      label: 'Discovery',
      price: prices.discoveryTotal,
      line: `${prices.discoveryHours} hours, paid upfront, to scope a custom build. Automation starts from ${prices.automationFrom}.`,
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
      className="site-shell pt-section [scroll-margin-top:24px]"
      id="pricing"
      aria-label="Prices"
    >
      <ul className="m-0 grid list-none grid-cols-2 gap-s p-0 lg:grid-cols-4">
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
                  : 'border-border-default bg-surface-tint text-text-secondary hover:border-border-strong-hover',
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-between gap-xs text-caption font-heavy tracking-label uppercase',
                  tile.dark ? 'text-text-on-dark-muted' : 'text-text-subtle',
                )}
              >
                {tile.label}
                <ArrowRight
                  aria-hidden="true"
                  className="size-[16px] shrink-0 transition-transform duration-200 group-hover:translate-x-3xs"
                />
              </span>
              <span className="mt-auto flex flex-wrap items-baseline gap-x-xs pt-l">
                {tile.from && (
                  <span
                    className={cn(
                      'text-body',
                      tile.dark ? 'text-text-on-dark-muted' : 'text-text-muted',
                    )}
                  >
                    from
                  </span>
                )}
                <strong
                  className={cn(
                    'leading-none font-heavy tracking-[-0.05em]',
                    tile.dark ? 'text-hero text-text-on-dark' : 'text-title text-text-primary',
                  )}
                >
                  {tile.price}
                </strong>
                {tile.unit && (
                  <span
                    className={cn(
                      'text-body',
                      tile.dark ? 'text-text-on-dark-muted' : 'text-text-muted',
                    )}
                  >
                    {tile.unit}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  'mt-s block text-body leading-relaxed',
                  tile.dark ? 'text-text-on-dark-muted' : 'text-text-muted',
                )}
              >
                {tile.line}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-xl mb-0 text-body leading-relaxed text-text-muted">
        Not sure which? Tell us your budget on the{' '}
        <Link
          href="/contact"
          className="font-strong text-text-action underline underline-offset-[3px] hover:opacity-70"
        >
          contact page
        </Link>{' '}
        and we&apos;ll say what fits.
      </p>
    </section>
  );
}
