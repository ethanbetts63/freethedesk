import type { Metadata } from 'next';

import { ExpandableServiceList } from '@/components/ExpandableServiceList';
import { FaqSection } from '@/components/marketing/FaqSection';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { AiReadinessBanner } from '@/components/marketing/AiReadinessBanner';
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
import { seoServices } from './_components/seoServices';
import { seoFaqs } from './_lib/copy';

const sections = numberSections([
  'Analyse',
  'Recommend',
  'Experiment',
  'How often',
  'What we look for',
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
    price: settings.seo_subscription_price,
    unitText: 'MONTH',
  });
  const cyclePrice = formatMoney(settings.seo_subscription_price, { cents: 'auto' });

  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema path="/seo" serviceOffers={serviceOffers} />
      <Hero
        path="/seo"
        eyebrow="SEO Perth"
        titleLines={['Be the Perth business']}
        accentTitle="Google"
        accentAlternates={['ChatGPT', 'Claude', 'Gemini', 'Perplexity']}
        titleSuffix="recommends first."
        lead={`Each month we find the searches you're losing, recommend solutions, and show what last month's fixes earned. ${cyclePrice} a month to start, less often when there's less new to measure.`}
        primaryHref="#signup"
        primaryLabel={`Start for ${cyclePrice} a month`}
        secondaryHref="#recommend"
        secondaryLabel="See what you get"
        trustLine="Cancel any time · Refund if nothing improves · Perth-based"
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

      <ExpandableServiceList
        id="issues-we-check"
        services={seoServices}
        eyebrow={sections['What we look for']}
        title="What we look for, every cycle."
        description="A few of the questions behind the findings. Open one to see the kinds of checks that can turn into a recommendation."
      />

      <CaseStudyTeaser
        eyebrow={sections['Proof this works']}
        title="A Perth website that grew organic clicks 300%."
        points={casePoints}
        primaryHref="#signup"
        primaryLabel="Choose a plan"
        showPrimaryAction={false}
      >
        <p>
          Scooter Shop is a Perth scooter dealership. Its website combines inventory, parts,
          purchasing and service journeys in one connected experience. Fast structured pages and
          search content aimed at what Perth riders search for helped organic clicks grow by 300% in
          six months.
        </p>
        <p>
          It is a practical example of what happens when the public website and the work behind it
          are designed as one system.
        </p>
      </CaseStudyTeaser>

      <AiReadinessBanner id="ai-readiness" />
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
        Connect your data and your first findings arrive within the week—ranked, plain-English, and
        honest about whether you should keep paying us.
      </ManualAdminCta>
    </main>
  );
}
