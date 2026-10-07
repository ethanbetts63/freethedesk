import { SectionHeader } from '@/components/SectionHeader';
import type { PurchasePackage } from '@/lib/servicePricing';

import { PackageOrderPanel } from './PackageOrderPanel';

/** Server shell: the heading stays out of the client bundle; only the cards and the form hydrate. */
export function PackagesSection({
  eyebrow,
  packages,
}: {
  eyebrow: string;
  packages: readonly PurchasePackage[];
}) {
  return (
    <section className="py-section [scroll-margin-top:24px]" id="packages">
      <div className="site-shell">
        <div className="max-w-[860px]">
          <SectionHeader
            eyebrow={eyebrow}
            title="Pick a package."
            accentTitle="Buy it today."
            size="display-md"
          />
          <p className="mt-l max-w-[720px] text-lead leading-[1.75] text-text-muted">
            Two websites priced per page, and a web application that starts with paid discovery.
            Every price is on the page, and you can buy any of them now.
          </p>
        </div>

        <PackageOrderPanel packages={packages} />
      </div>
      {/* Where the page's floating call to action may appear: past the whole order form. */}
      <div id="packages-end" aria-hidden="true" />
    </section>
  );
}
