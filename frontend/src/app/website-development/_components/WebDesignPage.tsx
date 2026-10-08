import { AiReadinessBanner } from '@/components/marketing/AiReadinessBanner';
import { AdminAutomationSection } from '@/components/marketing/AdminAutomationSection';
import { CaseStudyTeaser } from '@/components/marketing/CaseStudyTeaser';
import { FaqSection } from '@/components/marketing/FaqSection';
import { FeatureScrollSection } from '@/components/marketing/FeatureScrollSection';
import { Hero } from '@/components/marketing/Hero';
import { JourneySection } from '@/components/marketing/JourneySection';
import { PackagesSection } from '@/components/marketing/PackagesSection';
import { SubscriptionSwap } from '@/components/marketing/SubscriptionSwap';
import { WebsiteIntroduction } from '@/components/marketing/WebsiteIntroduction';
import { WebsiteJobsBar } from '@/components/marketing/WebsiteJobsBar';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { PageSchema } from '@/components/PageSchema';
import { SeoReportOverview } from '@/components/SeoReportOverview';
import { SCOOTER_SHOP_GROWTH } from '@/lib/caseStudies';
import type { PagePath } from '@/lib/pages';
import { numberSections } from '@/lib/sectionNumbers';
import { buildOneOffOffer } from '@/lib/seo';
import { getSiteSettingsServer, SERVICE_PRICE_FIELDS } from '@/lib/serverApi';
import { offerName, servicePrices, type ServicePrices } from '@/lib/servicePricing';
import type { FaqItem } from '@/types/FaqItem';

import { WEB_DESIGN_JOURNEY } from '../_lib/copy';
import { websiteServices } from '../_lib/websiteServices';

/**
 * The words that change between the web design pages. Everything else (the
 * layout, the visuals, the packages, the journey, the case study) is shared, so
 * a location page is a different audience for the same offer, not a copy.
 */
export interface WebDesignCopy {
  heroEyebrow: string;
  heroTitleLines: readonly string[];
  heroLead: string;
  designDescription: string;
  seoDescription: string;
  faqTitle: string;
  faqs: (prices: ServicePrices) => FaqItem[];
  ctaTitle: string;
}

/* Section eyebrows in page order. */
const sections = numberSections([
  'SEO',
  'Web Design',
  'Admin Automation',
  "What you're paying for",
  'Features and integrations',
  'Proof this works',
  'Common questions',
] as const);

const casePoints = [
  'Indexable stock',
  'Intent-focused pages',
  'Structured data',
  'Measured in Search Console',
];

/**
 * A web design page. The packages and the cost answer quote the admin's
 * prices, so every route that renders this sets `dynamic = 'force-dynamic'`.
 */
export async function WebDesignPage({ path, copy }: { path: PagePath; copy: WebDesignCopy }) {
  const prices = servicePrices(await getSiteSettingsServer(SERVICE_PRICE_FIELDS));
  const offers = prices.packages
    .map((item) => buildOneOffOffer({ price: item.price, name: offerName(item) }))
    .filter(Boolean) as object[];

  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema path={path} serviceOffers={offers.length ? offers : undefined} />
      <AiReadinessBanner />
      <Hero
        path={path}
        eyebrow={copy.heroEyebrow}
        titleLines={copy.heroTitleLines}
        accentTitle="work harder."
        accentAlternates={['be faster.', 'grow faster.', 'be easier.', 'sell more.']}
        lead={copy.heroLead}
        primaryHref="#packages"
        primaryLabel="See the packages"
        secondaryHref="/portfolio/scooter-shop"
        secondaryLabel="Read the full case study"
      />

      <WebsiteJobsBar />

      <PackagesSection packages={prices.packages} />

      <WebsiteIntroduction designDescription={copy.designDescription} />

      <SeoReportOverview
        id="seo"
        eyebrow={sections['SEO']}
        title="Launch SEO Strong."
        accentTitle="Improve with data."
        mode="improvement"
        description={copy.seoDescription}
      />

      <JourneySection eyebrow={sections['Web Design']} content={WEB_DESIGN_JOURNEY} />

      <AdminAutomationSection
        id="website-automation"
        eyebrow={sections['Admin Automation']}
        spacing="joined"
      />

      <SubscriptionSwap eyebrow={sections["What you're paying for"]} />

      <FeatureScrollSection
        eyebrow={sections['Features and integrations']}
        services={websiteServices}
      />

      <CaseStudyTeaser
        eyebrow={sections['Proof this works']}
        title={`A Perth website that grew organic clicks ${SCOOTER_SHOP_GROWTH.percent}%.`}
        points={casePoints}
        primaryHref="#packages"
        primaryLabel="Choose your package"
        showPrimaryAction={false}
      >
        <p>
          Scooter Shop is a Perth scooter dealership. Its website combines inventory, parts,
          purchasing and service journeys in one connected experience. Fast structured pages and
          focused search content grew its organic clicks {SCOOTER_SHOP_GROWTH.percent}% in{' '}
          {SCOOTER_SHOP_GROWTH.span}.
        </p>
        <p>
          It is a practical example of what happens when the public website and the work behind it
          are designed as one system.
        </p>
      </CaseStudyTeaser>

      <FloatingPageCta
        label="Choose your package"
        href="#packages"
        direction="up"
        // After the packages, so it never sits over a Buy now button.
        showAfterId="packages-end"
        hideAtId="page-cta"
      />

      <FaqSection
        emitSchema
        eyebrow={sections['Common questions']}
        title={copy.faqTitle}
        items={copy.faqs(prices)}
      />

      <ManualAdminCta
        id="page-cta"
        eyebrow="Start with the useful part"
        title={copy.ctaTitle}
        href="#packages"
        buttonLabel="Choose your package"
      >
        Tell us what you sell, who the site is for and where the current process gets in the way.
      </ManualAdminCta>
    </main>
  );
}
