import type { PurchasePackage } from '@/lib/servicePricing';

import { PackageOrderPanel, type BudgetCard } from './PackageOrderPanel';

/**
 * A service page's order form, straight under its hero bar: the packages that can be bought now,
 * and optionally a card sending anyone who would rather start from a budget to the enquiry. The
 * panel carries its own heading. Server shell: only the panel hydrates.
 */
export function PackagesSection({
  packages,
  budgetCard,
}: {
  packages: readonly PurchasePackage[];
  budgetCard?: BudgetCard;
}) {
  return (
    <section className="py-section [scroll-margin-top:24px]" id="packages" aria-label="Packages">
      <div className="site-shell">
        <PackageOrderPanel packages={packages} budgetCard={budgetCard} />
      </div>
      {/* Where the page's floating call to action may appear: past the whole order form. */}
      <div id="packages-end" aria-hidden="true" />
    </section>
  );
}
