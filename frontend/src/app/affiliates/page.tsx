import type { Metadata } from 'next';

import { FaqSection } from '@/components/marketing/FaqSection';
import { RelatedPages } from '@/components/marketing/RelatedPages';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { CaseStudyTeaser } from '@/components/marketing/CaseStudyTeaser';
import { Hero } from '@/components/marketing/Hero';
import { PageSchema } from '@/components/PageSchema';
import { ProcessStepsBar } from '@/components/ProcessStepsBar';
import { SeoReportOverview } from '@/components/SeoReportOverview';
import { metadataFor } from '@/lib/pages';
import { numberSections } from '@/lib/sectionNumbers';
import { getSiteSettingsServer } from '@/lib/serverApi';
import { SCOOTER_SHOP_GROWTH } from '@/lib/caseStudies';

import { SampleReportLink } from '@/app/seo/_components/SampleReportLink';
import { AffiliateEarnings } from './_components/AffiliateEarnings';
import { AffiliateIntroduction } from './_components/AffiliateIntroduction';
import { AffiliatePayout } from './_components/AffiliatePayout';
import { AffiliatePitch } from './_components/AffiliatePitch';
import { AffiliateShare } from './_components/AffiliateShare';
import { AffiliateSignup } from './_components/AffiliateSignup';
import { affiliateEarnings, affiliateFaqs } from './_lib/copy';

const sections = numberSections([
  'Share',
  'What you recommend',
  'Get paid',
  'What you earn',
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
        eyebrow="Podcast affiliate program"
        titleLines={['Recommend an SEO audit.']}
        accentTitle="Keep half."
        lead={`Your listeners run businesses. Recommend our SEO audits with your code and keep ${lowest.share} to ${highest.share} of every one sold. Your own audit is free, so you know exactly what you're recommending.`}
        primaryHref="#signup"
        primaryLabel="Become an affiliate"
        secondaryHref="/seo/sample-report"
        secondaryLabel="See a sample report"
        trustLine="50% of every sale · 20% off for your listeners · Paid through Stripe"
      />

      <ProcessStepsBar
        id="affiliates-hero-end"
        ariaLabel="The three steps of the affiliate program"
        steps={['Sign up', 'Share your code', 'Get paid']}
      />

      <AffiliateSignup pitch={<AffiliatePitch settings={settings} />} />

      <AffiliateIntroduction />

      <AffiliateShare eyebrow={sections['Share']} />

      <SeoReportOverview
        id="recommend"
        eyebrow={sections['What you recommend']}
        title="A written report."
        accentTitle="Not a sales call."
        description="What your listener gets is a report about their own site: where it shows up on Google and in AI answers, who's beating it, and the changes worth making first, ranked by what they're worth. Read the sample before you put your name to it."
        spacing="joined"
        textSide="right"
        action={<SampleReportLink />}
      />

      <AffiliatePayout eyebrow={sections['Get paid']} settings={settings} />

      <AffiliateEarnings eyebrow={sections['What you earn']} settings={settings} />

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
        eyebrow="Every episode is a referral"
        title="Your listeners already ask you who to use."
        href="#signup"
        buttonLabel="Become an affiliate"
      >
        Give them a code and an answer. Half of every audit they buy comes back to the show.
      </ManualAdminCta>
      <RelatedPages path="/affiliates" />
    </main>
  );
}
