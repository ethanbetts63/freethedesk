import { SectionHeader } from '@/components/SectionHeader';
import type { ServicePrices } from '@/lib/servicePricing';

/** The hourly rate and the discovery it buys, as one card beside the explanation. */
export function RateCard({ eyebrow, prices }: { eyebrow: string; prices: ServicePrices }) {
  return (
    <section className="site-shell py-section [scroll-margin-top:24px]" id="rate">
      <div className="grid grid-cols-1 items-center gap-split lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <SectionHeader
            eyebrow={eyebrow}
            title="One rate."
            accentTitle="Every service."
            size="display-md"
          />
          <p className="mt-l max-w-[620px] text-lead leading-[1.75] text-text-muted">
            Anything we build that is not a fixed package is billed at one hourly rate, whether it
            is a web application, an automation or a change to a site we launched. Before we price
            custom work, we spend {prices.discoveryHours} hours working out what it should be.
          </p>
        </div>

        <div className="moving-colour-border p-ml shadow-l sm:p-xl">
          <p className="m-0 text-label font-heavy tracking-label text-text-subtle uppercase">
            Hourly rate
          </p>
          <p className="mt-s mb-0 flex items-baseline gap-xs text-text-primary">
            <strong className="text-hero leading-none font-heavy tracking-[-0.07em]">
              {prices.hourlyRate}
            </strong>
            <span className="text-title-sm text-text-muted">/ hour</span>
          </p>
          <dl className="m-0 mt-xl grid gap-m border-t border-border-default pt-l">
            <div>
              <dt className="text-body font-strong text-text-secondary">
                Discovery: {prices.discoveryHours} hours, {prices.discoveryTotal}
              </dt>
              <dd className="m-0 mt-2xs text-body leading-relaxed text-text-muted">
                Paid upfront, before any custom work is scoped. It ends with a written scope and a
                price for the first release.
              </dd>
            </div>
            <div>
              <dt className="text-body font-strong text-text-secondary">The price is the total</dt>
              <dd className="m-0 mt-2xs text-body leading-relaxed text-text-muted">
                The figure on this page is what you pay. Nothing is added at the end.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
