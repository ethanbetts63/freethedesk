import type { Metadata } from 'next';

import { FaqSection } from '@/components/marketing/FaqSection';
import { RelatedPages } from '@/components/marketing/RelatedPages';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { CaseStudyTeaser } from '@/components/marketing/CaseStudyTeaser';
import { Hero } from '@/components/marketing/Hero';
import { PageSchema } from '@/components/PageSchema';
import { ProcessStepsBar } from '@/components/ProcessStepsBar';
import { metadataFor } from '@/lib/pages';
import { numberSections } from '@/lib/sectionNumbers';
import { getSiteSettingsServer } from '@/lib/serverApi';
import { SCOOTER_SHOP_GROWTH } from '@/lib/caseStudies';

import { AffiliateAudit } from './_components/AffiliateAudit';
import { AffiliateIntroduction } from './_components/AffiliateIntroduction';
import { AffiliatePayout } from './_components/AffiliatePayout';
import { AffiliatePitch } from './_components/AffiliatePitch';
import { AffiliateExperience } from './_components/AffiliateExperience';
import { AffiliateSignup } from './_components/AffiliateSignup';
import { affiliateEarnings, affiliateFaqs } from './_lib/copy';

const sections = numberSections([
  'What to say',
  'What you sell',
  'Get paid',
  'Proof this works',
  'Common questions',
] as const);

export const metadata: Metadata = metadataFor('/affiliates');

/* The earnings come from the admin's prices, so this page renders per request. */
export const dynamic = 'force-dynamic';

const casePoints = [
  'A real Perth business',
  'Recommendations shipped',
  'Measured in Search Console',
  `${SCOOTER_SHOP_GROWTH.stat} organic clicks`,
];

export default async function AffiliatesPage() {
  const settings = await getSiteSettingsServer();
  const earnings = affiliateEarnings(settings);
  const lowest = earnings[0];
  const highest = earnings[earnings.length - 1];

  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema path="/affiliates" />
      <Hero
        path="/affiliates"
        eyebrow="SEO affiliate program"
        titleLines={['Recommend an SEO audit.']}
        accentTitle="Keep half."
        lead={`Recommend our SEO audits and get ${lowest.share} to ${highest.share} of every sale, 20% off for your followers and a free audit for your own website.`}
        primaryHref="#signup"
        primaryLabel="Become an affiliate"
        secondaryHref="/seo/sample-report"
        secondaryLabel="See a sample report"
        secondaryNewTab
        trustLine="50% of every sale · 20% off for your audience · Complimentary Audit"
      />

      <ProcessStepsBar
        id="affiliates-hero-end"
        ariaLabel="The three steps of the affiliate program"
        steps={['Sign up', 'Share your code', 'Get paid']}
      />

      <AffiliateSignup pitch={<AffiliatePitch settings={settings} />} />

      <AffiliateIntroduction />

      <AffiliateExperience eyebrow={sections['What to say']} />

      <AffiliateAudit eyebrow={sections['What you sell']} />

      <AffiliatePayout eyebrow={sections['Get paid']} settings={settings} />

      <CaseStudyTeaser
        eyebrow={sections['Proof this works']}
        title={`A Perth website that grew organic clicks ${SCOOTER_SHOP_GROWTH.percent}%.`}
        points={casePoints}
        primaryHref="#signup"
        primaryLabel="Become an affiliate"
        showPrimaryAction={false}
      >
        <p>
          Scooter Shop is a Perth scooter dealership. The changes its audit recommended, fast
          structured pages and search content aimed at what Perth riders search for, grew its
          organic clicks {SCOOTER_SHOP_GROWTH.percent}% in {SCOOTER_SHOP_GROWTH.span}. That is the
          kind of result your listeners would be buying.
        </p>
      </CaseStudyTeaser>

      <FloatingPageCta
        label="Become an affiliate"
        href="#signup"
        direction="up"
        // After the form, so it never sits over the submit button.
        showAfterId="signup-end"
        hideAtId="page-cta"
      />

      <FaqSection
        emitSchema
        eyebrow={sections['Common questions']}
        title="Affiliate questions."
        items={affiliateFaqs(settings)}
      />

      <ManualAdminCta
        id="page-cta"
        eyebrow="Affiliate program"
        title="Half the audit. All the credit."
        href="#signup"
        buttonLabel="Become an affiliate"
      >
        They get 20% off and a real report. You get {lowest.share} to {highest.share}.
      </ManualAdminCta>
      <RelatedPages path="/affiliates" />
    </main>
  );
}
