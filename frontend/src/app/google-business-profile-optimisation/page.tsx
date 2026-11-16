import type { Metadata } from 'next';

import { FloatingPageCta } from '@/components/FloatingPageCta';
import { FaqSection } from '@/components/marketing/FaqSection';
import { Hero } from '@/components/marketing/Hero';
import { CallRequest } from '@/components/marketing/CallRequest';
import { RelatedPages } from '@/components/marketing/RelatedPages';
import { PageSchema } from '@/components/PageSchema';
import { metadataFor } from '@/lib/pages';
import { buildOneOffOffer } from '@/lib/seo';
import { numberSections } from '@/lib/sectionNumbers';
import { GBP_OPTIMISATION_PRICE } from '@/lib/servicePricing';

import { GbpIntroduction } from './_components/GbpIntroduction';
import { GBP_ENQUIRY_ID, GbpPackage } from './_components/GbpPackage';
import { GbpSetup } from './_components/GbpSetup';
import { gbpFaqs } from './_lib/copy';
import { GBP_PRODUCT_NAME, gbpPrice } from './_lib/plan';

const PATH = '/google-business-profile-optimisation';

const sections = numberSections(['Set up', 'Common questions'] as const);

export const metadata: Metadata = metadataFor(PATH);

/**
 * The /seo page's layout for the one job that changes a Business Profile rather than reading it.
 * No online checkout yet, so the card and the floating button lead to the call-back form at the foot.
 */
export default function GoogleBusinessProfileOptimisationPage() {
  // The Service node is declared in STATIC_PAGES; only its one price is added here.
  const serviceOffers = buildOneOffOffer({ price: GBP_OPTIMISATION_PRICE, name: GBP_PRODUCT_NAME });

  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema path={PATH} serviceOffers={serviceOffers} />
      <Hero
        path={PATH}
        titleLines={['Google Business Profile', 'optimisation Perth:']}
        accentTitle="done for you, once."
        lead="We fill in your Google Business Profile properly, from categories and prices to photos and review replies. One job, paid once."
        primaryHref="#package"
        primaryLabel={`Done for you, ${gbpPrice}`}
        secondaryHref="/seo"
        secondaryLabel="Or start with an SEO audit"
        trustLine="Paid once, no subscription · Manager access only · Perth-based"
      />

      <GbpPackage />

      <GbpIntroduction />

      <GbpSetup eyebrow={sections['Set up']} />

      <FloatingPageCta
        label="Ask for a call back"
        href={`#${GBP_ENQUIRY_ID}`}
        direction="down"
        showAfterId="package-end"
        hideAtId={GBP_ENQUIRY_ID}
      />

      <FaqSection
        emitSchema
        eyebrow={sections['Common questions']}
        title="Business Profile optimisation: common questions."
        items={gbpFaqs}
      />

      <CallRequest id={GBP_ENQUIRY_ID} source={PATH} title="Ready to show up on Maps?" />
      <RelatedPages path={PATH} />
    </main>
  );
}
