import Link from 'next/link';

import { SectionHeader } from '@/components/SectionHeader';

export type ServicePriceRow = {
  service: string;
  price: string;
  basis: string;
  href: string;
  linkLabel: string;
};

/** Every service on one list, each with its price and a link to the page that sells it. */
export function ServicePriceList({
  eyebrow,
  rows,
}: {
  eyebrow: string;
  rows: readonly ServicePriceRow[];
}) {
  return (
    <section className="bg-surface-tint py-section [scroll-margin-top:24px]" id="services">
      <div className="site-shell">
        <SectionHeader
          eyebrow={eyebrow}
          title="Every service,"
          accentTitle="priced."
          size="display-md"
        />

        <ul className="m-0 mt-2xl list-none border-t border-border-default p-0">
          {rows.map((row) => (
            <li
              key={row.service}
              className="grid grid-cols-1 gap-xs border-b border-border-default py-l sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-x-xl"
            >
              <div>
                <h3 className="m-0 text-title-sm tracking-[-0.035em] text-text-secondary">
                  {row.service}
                </h3>
                <p className="mt-2xs mb-0 text-body leading-relaxed text-text-muted">{row.basis}</p>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-l gap-y-xs sm:justify-end">
                <strong className="text-title font-heavy tracking-[-0.045em] text-text-primary">
                  {row.price}
                </strong>
                <Link
                  href={row.href}
                  className="text-body-sm font-strong text-text-action underline underline-offset-[3px] hover:opacity-70"
                >
                  {row.linkLabel}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
