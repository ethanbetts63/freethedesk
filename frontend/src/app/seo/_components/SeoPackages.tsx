'use client';

import Link from 'next/link';
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
      note={
        <>
          Make three of the ranking changes. If your Google clicks aren&rsquo;t up 90 days later,
          you get every dollar back.{' '}
          <Link
            className="text-text-action underline underline-offset-[3px] hover:opacity-70"
            href="/legal/seo-audit-terms"
          >
            How the guarantee works
          </Link>
        </>
      }
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
