'use client';

import { useMemo } from 'react';

import type { Plan } from '@/lib/plans';
import { money, offerName, type PackageCode, type PurchasePackage } from '@/lib/servicePricing';

import { PackageOrderDialog, packageCadence } from './PackageOrderDialog';
import { PackagesSection, usePackageChoice } from './Packages';

/**
 * A service page's packages, sold as the SEO audits are: cards under a heading, each opening the
 * order form over the page. The website, Subiaco, redesign and automation pages differ only in
 * the words and the packages they pass. `id="packages"` is where their heroes' buttons land.
 */
export function ServicePackages({
  title,
  lead,
  packages,
  redesign = false,
}: {
  /** The heading before "and prices.": "Website packages". */
  title: string;
  lead: string;
  packages: readonly PurchasePackage[];
  /** The buyer is replacing a site, so the form asks for it. */
  redesign?: boolean;
}) {
  // The cards' words: the name, how the price is reached, the price and how it's paid, what it
  // includes.
  const plans = useMemo<Plan<PackageCode>[]>(
    () =>
      packages.map((item) => ({
        code: item.code,
        name: item.name,
        price: money(item.price),
        cadence: packageCadence(item),
        summary: item.priceNote,
        features: [...item.includes],
        recommended: item.recommended,
      })),
    [packages],
  );
  const cardTitles = useMemo(
    () => new Map(packages.map((item) => [item.code, offerName(item)])),
    [packages],
  );
  const automation = packages.every((item) => item.code === 'automation_discovery');
  const { selectedCode, choose, open, dialogRef } = usePackageChoice(
    plans,
    automation ? 'automation' : 'website',
  );

  return (
    <PackagesSection
      id="packages"
      endId="packages-end"
      eyebrow="Packages"
      title={title}
      accentTitle={packages.length === 1 ? 'and price.' : 'and prices.'}
      lead={lead}
      plans={plans}
      kicker="Includes"
      // "Web application discovery": the card says what the price buys.
      cardTitle={(plan) => cardTitles.get(plan.code) ?? plan.name}
      onChoose={open}
    >
      <PackageOrderDialog
        dialogRef={dialogRef}
        packages={packages}
        selectedCode={selectedCode}
        onChoose={choose}
        redesign={redesign}
      />
    </PackagesSection>
  );
}
