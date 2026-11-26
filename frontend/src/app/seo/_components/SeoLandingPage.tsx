import { FaqSection } from '@/components/marketing/FaqSection';
import { RelatedPages } from '@/components/marketing/RelatedPages';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { CallRequest } from '@/components/marketing/CallRequest';
import { CallRequestNudge } from '@/components/marketing/CallRequestNudge';
import { CaseStudyTeaser } from '@/components/marketing/CaseStudyTeaser';
import { Hero } from '@/components/marketing/Hero';
import { PageSchema } from '@/components/PageSchema';
import { SeoReportOverview } from '@/components/SeoReportOverview';
import { formatMoney } from '@/lib/formatting';
import { type PagePath } from '@/lib/pages';
import { buildOneOffOffer } from '@/lib/seo';
import { numberSections } from '@/lib/sectionNumbers';
import { CHECKOUT_PRICE_FIELDS, getSiteSettingsServer } from '@/lib/serverApi';

import { faqsFor, type SeoPageCopy } from '../_lib/pageCopy';
import { buildSeoPlans, PRICE_FIELD } from '../_lib/plans';
import { SampleReportLink } from './SampleReportLink';
import { SeoAnalysis } from './SeoAnalysis';
import { SeoImprovement } from './SeoImprovement';
import { SeoIntroduction } from './SeoIntroduction';
import { SeoPackages } from './SeoPackages';

const sections = numberSections([
  'Analyse',
  'Recommend',
  'Experiment',
  'Proof this works',
  'Common questions',
] as const);

const casePoints = {
  'scooter-shop': [
    'Indexable stock',
    'Intent-focused pages',
    'Structured data',
    'Measured in Search Console',
  ],
  bloomprint: ['City pages', 'Occasion pages', 'Search-led guides', 'Measured in Search Console'],
} as const;

/**
 * The /seo page, and each industry SEO page: the same sections in the same order, with the words
 * from `copy`. Each route is a short page that names its path and copy, so every page is a real
 * file the sitemap and crumb checks can find.
 */
export async function SeoLandingPage({ path, copy }: { path: PagePath; copy: SeoPageCopy }) {
  // The questions quote the Business Profile job's price beside the audits'.
  const settings = await getSiteSettingsServer([
    ...CHECKOUT_PRICE_FIELDS,
    'gbp_optimisation_price',
  ]);

  // The Service node itself is declared in STATIC_PAGES; only the prices are dynamic.
  // One offer per audit, priced as the cards are.
  const plans = buildSeoPlans(settings);
  const serviceOffers = plans.flatMap((plan) => {
    const offer = buildOneOffOffer({
      price: Number(settings[PRICE_FIELD[plan.code]]),
      name: copy.packages.audience
        ? `${plan.productName} for ${copy.packages.audience}`
        : plan.productName,
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
      <PageSchema path={path} serviceOffers={serviceOffers} />
      <Hero
        path={path}
        titleLines={copy.hero.titleLines}
        accentTitle={copy.hero.accentTitle}
        lead={copy.hero.lead}
        primaryHref="#signup"
        primaryLabel={`Audits from ${fromPrice}`}
        secondaryHref="/seo/sample-report"
        secondaryLabel="See a sample report"
        secondaryNewTab
        trustLine="Money back if your Google clicks don't grow · Paid once, no subscription · Perth-based"
      />

      <SeoPackages settings={settings} copy={copy.packages} />

      <CallRequestNudge />

      <SeoIntroduction copy={copy.introduction} />

      <SeoAnalysis eyebrow={sections['Analyse']} copy={copy.analyse} />

      <SeoReportOverview
        id="recommend"
        eyebrow={sections['Recommend']}
        title={copy.recommend.title}
        accentTitle={copy.recommend.accentTitle}
        description={copy.recommend.description}
        spacing="joined"
        textSide="right"
        action={<SampleReportLink />}
      />

      <SeoImprovement eyebrow={sections['Experiment']} copy={copy.experiment} />

      <CaseStudyTeaser
        eyebrow={sections['Proof this works']}
        study={copy.caseStudy.study}
        title={copy.caseStudy.title}
        points={casePoints[copy.caseStudy.study]}
        primaryHref="#signup"
        primaryLabel="Choose an audit"
        showPrimaryAction={false}
      >
        <p>{copy.caseStudy.body}</p>
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
        title={copy.faqTitle}
        items={faqsFor(copy, settings)}
      />

      <CallRequest id="page-cta" source={path} title={copy.callTitle} />
      <RelatedPages path={path} />
    </main>
  );
}
