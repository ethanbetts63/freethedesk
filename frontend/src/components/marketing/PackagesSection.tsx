import type { PurchasePackage } from '@/lib/servicePricing';

import { PackageOrderPanel } from './PackageOrderPanel';

/**
 * A service page's order form, straight under its hero bar: the packages that can be bought now.
 * The panel carries its own heading. Server shell: only the panel hydrates.
 *
 * Top padding only: the section after it opens with its own `pt-section`, so the
 * form sits one section's space from the bar above and from what follows.
 */
export function PackagesSection({ packages }: { packages: readonly PurchasePackage[] }) {
  return (
    <section className="pt-section [scroll-margin-top:24px]" id="packages" aria-label="Packages">
      <div className="site-shell">
        <PackageOrderPanel packages={packages} />
      </div>
      {/* Where the page's floating call to action may appear: past the whole order form. */}
      <div id="packages-end" aria-hidden="true" />
    </section>
  );
}
