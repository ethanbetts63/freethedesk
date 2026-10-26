import type { Metadata } from 'next';

import { FaqSection } from '@/components/marketing/FaqSection';
import { RelatedPages } from '@/components/marketing/RelatedPages';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { CaseStudyTeaser } from '@/components/marketing/CaseStudyTeaser';
import { Hero } from '@/components/marketing/Hero';
import { PageSchema } from '@/components/PageSchema';
import { SeoReportOverview } from '@/components/SeoReportOverview';
import { metadataFor } from '@/lib/pages';
import { formatMoney } from '@/lib/formatting';
import { buildOneOffOffer } from '@/lib/seo';
import { numberSections } from '@/lib/sectionNumbers';
import { getSiteSettingsServer } from '@/lib/serverApi';

import { SeoAnalysis } from './_components/SeoAnalysis';
import { SampleReportLink } from './_components/SampleReportLink';
import { SeoImprovement } from './_components/SeoImprovement';
import { SeoIntroduction } from './_components/SeoIntroduction';
import { SeoSignup } from './_components/SeoSignup';
import { SeoStepsBar } from './_components/SeoStepsBar';
import { seoFaqs } from './_lib/copy';
import { buildSeoPlans, PRICE_FIELD } from './_lib/plans';
import { SCOOTER_SHOP_GROWTH } from '@/lib/caseStudies';

const sections = numberSections([
  'Analyse',
  'Recommend',
  'Experiment',
  'Proof this works',
  'Common questions',
] as const);

export const metadata: Metadata = metadataFor('/seo');

/* Pricing comes from the admin, so this page renders per request. */
export const dynamic = 'force-dynamic';

const casePoints = [
  'Indexable stock',
  'Intent-focused pages',
  'Structured data',
  'Measured in Search Console',
];

export default async function SeoPage() {
  const settings = await getSiteSettingsServer();

  // The Service node itself is declared in STATIC_PAGES; only the prices are dynamic.
  // One offer per audit, priced as the cards are.
  const plans = buildSeoPlans(settings);
  const serviceOffers = plans.flatMap((plan) => {
    const offer = buildOneOffOffer({
      price: Number(settings[PRICE_FIELD[plan.code]]),
      name: plan.productName,
    });
    return offer ? [offer] : [];
  });
  // "From": the cheapest audit, whichever that is.
  const fromPrice = formatMoney(
    Math.min(...plans.map((plan) => Number(settings[PRICE_FIELD[plan.code]]))),
    { cents: 'auto' },
  );

  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema path="/seo" serviceOffers={serviceOffers} />
      <Hero
        path="/seo"
        eyebrow="SEO audit Perth"
        titleLines={['Perth SEO audits that make you']}
        accentTitle="Google's"
        accentAlternates={["ChatGPT's", "Claude's", "Gemini's", "Perplexity's"]}
        titleSuffix="first pick."
        lead="Every audit is a written SEO report of your site: it finds the searches you're losing and recommends solutions, ranked by what they're worth."
        primaryHref="#signup"
        primaryLabel={`Audits from ${fromPrice}`}
        secondaryHref="/seo/sample-report"
        secondaryLabel="See a sample report"
        trustLine="Paid once, no subscription · Fixed prices · Perth-based"
      />

      <SeoStepsBar />

      <SeoSignup settings={settings} />

      <SeoIntroduction />

      <SeoAnalysis eyebrow={sections['Analyse']} />

      <SeoReportOverview
        id="recommend"
        eyebrow={sections['Recommend']}
        title="Ranked by value."
        accentTitle="Ready to hand over."
        description="Every recommendation says what to change, why the data points to it and how to do it. Written so you, or your IT person can quickly make the change."
        spacing="joined"
        textSide="right"
        action={<SampleReportLink />}
      />

      <SeoImprovement eyebrow={sections['Experiment']} />

      <CaseStudyTeaser
        eyebrow={sections['Proof this works']}
        title={`A Perth website that grew organic clicks ${SCOOTER_SHOP_GROWTH.percent}%.`}
        points={casePoints}
        primaryHref="#signup"
        primaryLabel="Choose an audit"
        showPrimaryAction={false}
      >
        <p>
          Scooter Shop is a Perth scooter dealership. Its website combines inventory, parts,
          purchasing and service journeys in one connected experience. Fast structured pages and
          search content aimed at what Perth riders search for grew its organic clicks{' '}
          {SCOOTER_SHOP_GROWTH.percent}% in {SCOOTER_SHOP_GROWTH.span}.
        </p>
      </CaseStudyTeaser>

      <FloatingPageCta
        label="Choose an audit"
        href="#signup"
        direction="up"
        // After the audits, so it never sits over the payment button.
        showAfterId="signup-end"
        hideAtId="page-cta"
      />

      <FaqSection
        emitSchema
        eyebrow={sections['Common questions']}
        title="SEO questions."
        items={seoFaqs(settings)}
      />

      <ManualAdminCta
        id="page-cta"
        eyebrow="Stop renting your traffic"
        title="Google Ads is SEO you pay for, click by click."
        href="#signup"
        buttonLabel="Choose an audit"
      >
        An ad click stops the day the budget does. A click you earn in search keeps arriving.
      </ManualAdminCta>
      <RelatedPages path="/seo" />
    </main>
  );
}
