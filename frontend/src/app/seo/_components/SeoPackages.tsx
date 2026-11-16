'use client';

import { useMemo } from 'react';

import { PackagesSection, usePackageChoice } from '@/components/marketing/Packages';
import { type PublicSiteSettings } from '@/lib/api';

import type { SeoPageCopy } from '../_lib/pageCopy';
import { buildSeoPlans } from '../_lib/plans';
import { SeoSignupDialog } from './SeoSignupDialog';

/**
 * The audits a customer can buy, each card opening the order form over the page. An industry page's
 * copy names its `audience` ("tradies") to title the cards for its trade; the audits are the same.
 */
export function SeoPackages({
  settings,
  copy,
}: {
  settings: PublicSiteSettings;
  copy: SeoPageCopy['packages'];
}) {
  const plans = useMemo(() => buildSeoPlans(settings), [settings]);
  const { selectedCode, choose, open, dialogRef } = usePackageChoice(plans, 'seo');

  return (
    <PackagesSection
      id="signup"
      endId="signup-end"
      eyebrow="Audits"
      title={copy.title}
      accentTitle="and prices."
      lead={copy.lead}
      plans={plans}
      kicker="Recommendations based on"
      cardTitle={(plan) => `${plan.name} SEO audit${copy.audience ? ` for ${copy.audience}` : ''}`}
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
