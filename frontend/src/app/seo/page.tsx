import type { Metadata } from 'next';

import { FaqSection } from '@/components/marketing/FaqSection';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { CaseStudyTeaser } from '@/components/marketing/CaseStudyTeaser';
import { AdsSavingsModal } from '@/components/marketing/AdsSavingsModal';
import { Hero } from '@/components/marketing/Hero';
import { PageSchema } from '@/components/PageSchema';
import { SeoReportOverview } from '@/components/SeoReportOverview';
import { metadataFor } from '@/lib/pages';
import { formatMoney } from '@/lib/formatting';
import { buildRecurringOffer } from '@/lib/seo';
import { numberSections } from '@/lib/sectionNumbers';
import { getSiteSettingsServer } from '@/lib/serverApi';

import { SeoAnalysis } from './_components/SeoAnalysis';
import { SeoCadence } from './_components/SeoCadence';
import { SeoImprovement } from './_components/SeoImprovement';
import { SeoIntroduction } from './_components/SeoIntroduction';
import { SeoSignup } from './_components/SeoSignup';
import { SeoStepsBar } from './_components/SeoStepsBar';
import { seoFaqs } from './_lib/copy';
import { SCOOTER_SHOP_BASELINE, SCOOTER_SHOP_GROWTH } from '@/lib/caseStudies';

const sections = numberSections([
  'Analyse',
  'Recommend',
  'Experiment',
  'How often',
  'Proof this works',
  'Choose your plan',
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

  // The Service node itself is declared in STATIC_PAGES; only the price is dynamic.
  // A subscription starts monthly, so that is the cadence the offer states.
  const serviceOffers = buildRecurringOffer({
    price: settings.seo_monthly_price,
    unitText: 'MONTH',
  });
  // "From": the cheapest audit on offer, whichever plan that is.
  const fromPrice = formatMoney(
    Math.min(
      ...[
        settings.seo_monthly_price,
        settings.seo_quarterly_price,
        settings.seo_yearly_price,
        settings.seo_oneoff_price,
      ].map(Number),
    ),
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
        lead="Every audit finds the searches you're losing, recommends solutions, and shows what your last fixes earned."
        primaryHref="#signup"
        primaryLabel={`First audit from ${fromPrice}`}
        secondaryHref="#recommend"
        secondaryLabel="See what you get"
        trustLine="Cancel any time · Fixed prices, no lock-in · Perth-based"
      />

      <SeoStepsBar />

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
      />

      <SeoImprovement eyebrow={sections['Experiment']} />

      <SeoCadence eyebrow={sections['How often']} />

      <CaseStudyTeaser
        eyebrow={sections['Proof this works']}
        title={`A Perth website that grew organic clicks ${SCOOTER_SHOP_GROWTH.percent}%.`}
        points={casePoints}
        primaryHref="#signup"
        primaryLabel="Choose a plan"
        showPrimaryAction={false}
      >
        <p>
          Scooter Shop is a Perth scooter dealership. Its website combines inventory, parts,
          purchasing and service journeys in one connected experience. Fast structured pages and
          search content aimed at what Perth riders search for grew its organic clicks{' '}
          {SCOOTER_SHOP_GROWTH.percent}% in {SCOOTER_SHOP_GROWTH.span}, {SCOOTER_SHOP_BASELINE}.
        </p>
      </CaseStudyTeaser>

      <SeoSignup settings={settings} eyebrow={sections['Choose your plan']} />

      <AdsSavingsModal />

      <FloatingPageCta
        label="Choose a plan"
        href="#signup"
        showAfterId="seo-hero-end"
        hideAtId="signup"
      />

      <FaqSection
        emitSchema
        eyebrow={sections['Common questions']}
        title="SEO questions."
        items={seoFaqs(settings)}
      />

      <ManualAdminCta
        eyebrow="Stop renting your traffic"
        title="Google Ads is SEO you pay for, click by click."
        href="#signup"
        buttonLabel="Choose a plan"
      >
        An ad click stops the day the budget does. A click you earn in search keeps arriving.
      </ManualAdminCta>
    </main>
  );
}
