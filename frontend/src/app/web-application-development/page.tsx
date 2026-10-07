import type { Metadata } from 'next';

import { AiReadinessBanner } from '@/components/marketing/AiReadinessBanner';
import { AdminAutomationSection } from '@/components/marketing/AdminAutomationSection';
import { CaseStudyTeaser } from '@/components/marketing/CaseStudyTeaser';
import { FaqSection } from '@/components/marketing/FaqSection';
import { FeatureScrollSection } from '@/components/marketing/FeatureScrollSection';
import { Hero } from '@/components/marketing/Hero';
import { IndexedFeatureSection } from '@/components/marketing/IndexedFeatureSection';
import { JourneySection } from '@/components/marketing/JourneySection';
import { ProjectEnquiry } from '@/components/marketing/ProjectEnquiry';
import { SubscriptionSwap } from '@/components/marketing/SubscriptionSwap';
import { WebsiteIntroduction } from '@/components/marketing/WebsiteIntroduction';
import { WebsiteJobsBar } from '@/components/marketing/WebsiteJobsBar';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { PageSchema } from '@/components/PageSchema';
import { metadataFor } from '@/lib/pages';
import { numberSections } from '@/lib/sectionNumbers';
import { buildFromOffer } from '@/lib/seo';
import { getSiteSettingsServer, SERVICE_PRICE_FIELDS } from '@/lib/serverApi';
import { servicePrices } from '@/lib/servicePricing';

import {
  WEB_APP_BACK_OFFICE,
  WEB_APP_INTRODUCTION,
  WEB_APP_JOURNEY,
  WEB_APP_SUBSCRIPTION_LEAD,
  webAppFaqs,
  webAppProcess,
} from './_lib/copy';
import { webAppServices } from './_lib/webAppServices';

/*
 * The website-development page's structure, section for section, with web
 * application content. Its SEO section becomes "How we build": an application
 * is scoped in a paid discovery before it is priced.
 */
const sections = numberSections([
  'How we build',
  'Customer side',
  'Back office',
  "What you're paying for",
  'Features and integrations',
  'Proof this works',
  'Common questions',
] as const);

export const metadata: Metadata = metadataFor('/web-application-development');

/* Discovery and the "from" price come from the admin, so this page renders per request. */
export const dynamic = 'force-dynamic';

const casePoints = ['Online purchasing', 'Identity checks', 'Online signing', 'Staff dashboard'];

export default async function WebApplicationDevelopmentPage() {
  const settings = await getSiteSettingsServer(SERVICE_PRICE_FIELDS);
  const prices = servicePrices(settings);

  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema
        path="/web-application-development"
        serviceOffers={buildFromOffer(settings.web_app_from_price)}
      />
      <AiReadinessBanner />
      <Hero
        path="/web-application-development"
        eyebrow="Web application development Perth"
        titleLines={['Software that fits']}
        accentTitle="your business."
        accentAlternates={['your customers.', 'your team.', 'the way you work.']}
        lead="Custom web applications for Perth businesses: customer portals, bookings, payments, online signing and the staff dashboards behind them, built around how your business already works."
        primaryHref="#enquiry"
        primaryLabel="Discuss your web app"
        secondaryHref="/portfolio/bloomprint"
        secondaryLabel="See a marketplace we built"
      />

      <WebsiteJobsBar
        id="webapp-hero-end"
        steps={['Serve customers', 'Run the back office', 'Own the software']}
        ariaLabel="Three jobs a web application should do"
      />

      <WebsiteIntroduction
        id="webapp-overview"
        title="Three layers."
        accentTitle="One application."
        items={WEB_APP_INTRODUCTION}
      />

      <IndexedFeatureSection
        id="process"
        eyebrow={sections['How we build']}
        title="Scoped first."
        accentTitle="Built in stages."
        lead={`Every web application starts with discovery, ${prices.discoveryTotal} paid upfront. It ends with a written scope and a price for the first release, and the build runs in stages you see and sign off as they land.`}
        items={webAppProcess(prices)}
      />

      <JourneySection eyebrow={sections['Customer side']} content={WEB_APP_JOURNEY} />

      <AdminAutomationSection
        id="webapp-automation"
        eyebrow={sections['Back office']}
        title="Let your application"
        accentTitle="run the back office."
        description={WEB_APP_BACK_OFFICE.description}
        jobs={WEB_APP_BACK_OFFICE.jobs}
        panelTitle="Your application"
        spacing="joined"
      />

      <SubscriptionSwap
        eyebrow={sections["What you're paying for"]}
        lead={WEB_APP_SUBSCRIPTION_LEAD}
        showCta={false}
      />

      <FeatureScrollSection
        eyebrow={sections['Features and integrations']}
        services={webAppServices}
        ctaLabel="Discuss your web app"
      />

      <CaseStudyTeaser
        eyebrow={sections['Proof this works']}
        title="A Perth dealership's paperwork, online."
        points={casePoints}
        primaryHref="#enquiry"
        primaryLabel="Discuss your web app"
        showPrimaryAction={false}
      >
        <p>
          Scooter Shop&apos;s customers can buy a vehicle with a deposit, verify their identity,
          complete licensing and sign their contract online, while the dealership&apos;s team works
          the same sale from a dashboard.
        </p>
        <p>It is a web application behind a website, designed and built as one system.</p>
      </CaseStudyTeaser>

      <ProjectEnquiry id="enquiry" eyebrow={null} showProjectType={false} />

      <FloatingPageCta
        label="Discuss your web app"
        href="#enquiry"
        showAfterId="webapp-hero-end"
        hideAtId="enquiry"
      />

      <FaqSection
        emitSchema
        eyebrow={sections['Common questions']}
        title="Web application questions."
        items={webAppFaqs(prices)}
      />

      <ManualAdminCta
        eyebrow="Start with the useful part"
        title="What should your application take off your hands?"
        href="#enquiry"
        buttonLabel="Discuss your web app"
      >
        Tell us what your customers do, what your team does after them, and which tools you pay for
        in between.
      </ManualAdminCta>
    </main>
  );
}
