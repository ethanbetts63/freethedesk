import type { Metadata } from 'next';

import { ExpandableServiceList } from '@/components/ExpandableServiceList';
import { FaqSection } from '@/components/marketing/FaqSection';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { AiReadinessBanner } from '@/components/marketing/AiReadinessBanner';
import { CaseStudyTeaser } from '@/components/marketing/CaseStudyTeaser';
import { ClickValueModal } from '@/components/marketing/ClickValueModal';
import { Hero } from '@/components/marketing/Hero';
import { PageSchema } from '@/components/PageSchema';
import { SeoReportOverview } from '@/components/SeoReportOverview';
import { metadataFor } from '@/lib/pages';
import { buildRecurringOffer } from '@/lib/seo';
import { numberSections } from '@/lib/sectionNumbers';
import { getSiteSettingsServer } from '@/lib/serverApi';

import { GoogleBusinessProfileAudit } from './_components/GoogleBusinessProfileAudit';
import { SeoAnalysis } from './_components/SeoAnalysis';
import { SeoImprovement } from './_components/SeoImprovement';
import { SeoIntroduction } from './_components/SeoIntroduction';
import { SeoSignup } from './_components/SeoSignup';
import { SeoStepsBar } from './_components/SeoStepsBar';
import { seoServices } from './_components/seoServices';
import { SEO_FAQS } from './_lib/copy';

const sections = numberSections([
  'Discover',
  'Recommend',
  'Measure',
  'Google Business Profile audit',
  'What we inspect',
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
  const serviceOffers = buildRecurringOffer({
    price: settings.seo_quarterly_price,
    unitText: 'QUARTER',
  });

  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema path="/seo" serviceOffers={serviceOffers} />
      <Hero
        path="/seo"
        eyebrow="SEO reports Perth"
        titleLines={['Be the Perth business']}
        accentTitle="Google"
        accentAlternates={['ChatGPT', 'Claude', 'Gemini', 'Perplexity']}
        titleSuffix="recommends first."
        lead="We find where Perth customers search and don't find you, rank the fixes by value, then measure what changed. Every click you earn is one you stop buying from Google Ads."
        primaryHref="#signup"
        primaryLabel="Choose a Report"
        secondaryHref="#report"
        secondaryLabel="See what you get"
        trustLine="Perth-based · reports for Perth and WA businesses"
      />

      <SeoStepsBar />

      <SeoIntroduction />

      <SeoAnalysis eyebrow={sections['Discover']} />

      <SeoReportOverview
        id="report"
        eyebrow={sections['Recommend']}
        title="Ranked by value."
        accentTitle="Ready to hand over."
        description="Each report turns fresh search data into a plain-English action plan: what improved, what is holding you back, and the next changes ranked by the clicks they could earn. Written so you, your IT person or we can make the changes."
        spacing="joined"
        textSide="right"
      />

      <SeoImprovement eyebrow={sections['Measure']} />

      <GoogleBusinessProfileAudit eyebrow={sections['Google Business Profile audit']} />

      <ExpandableServiceList
        id="issues-we-check"
        services={seoServices}
        eyebrow={sections['What we inspect']}
        title="What we inspect in every SEO report."
        description="These are examples of the issues and opportunities we look for. Open a category to see the kinds of checks that can appear in your report."
      />

      <CaseStudyTeaser
        eyebrow={sections['Proof this works']}
        title="A Perth website that grew organic clicks 300%."
        points={casePoints}
        primaryHref="#signup"
        primaryLabel="Choose a Report"
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

      <ClickValueModal />

      <FloatingPageCta
        label="Choose a Report"
        href="#signup"
        showAfterId="seo-hero-end"
        hideAtId="signup"
      />

      <FaqSection
        emitSchema
        eyebrow={sections['Common questions']}
        title="SEO report and audit questions."
        items={SEO_FAQS}
      />

      <ManualAdminCta
        eyebrow="Stop renting your traffic"
        title="Google Ads is SEO you pay for, click by click."
        href="#signup"
        buttonLabel="Choose a Report"
      >
        An ad click stops the day the budget does. A click you earn in search keeps arriving.
        Connect Google Search Console and your first report arrives within the week—ranked,
        plain-English, and honest about whether you should keep paying us.
      </ManualAdminCta>
    </main>
  );
}
