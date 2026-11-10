'use client';

import { useMemo } from 'react';

import { PackagesSection, usePackageChoice } from '@/components/marketing/Packages';
import { type PublicSiteSettings } from '@/lib/api';

import { buildSeoPlans } from '../_lib/plans';
import { SeoSignupDialog } from './SeoSignupDialog';

/** The audits a customer can buy, each card opening the order form over the page. */
export function SeoPackages({ settings }: { settings: PublicSiteSettings }) {
  const plans = useMemo(() => buildSeoPlans(settings), [settings]);
  const { selectedCode, choose, open, dialogRef } = usePackageChoice(plans, 'seo');

  return (
    <PackagesSection
      id="signup"
      endId="signup-end"
      eyebrow="Audits"
      title="SEO audit packages"
      accentTitle="and prices."
      lead="One written report of your site, paid once. The three differ in what they read."
      plans={plans}
      kicker="Recommendations based on"
      cardTitle={(plan) => `${plan.name} SEO audit`}
      onChoose={open}
    >
      <SeoSignupDialog
        dialogRef={dialogRef}
        plans={plans}
        selectedCode={selectedCode}
        onChoose={choose}
        settings={settings}
      />
    </PackagesSection>
  );
}
