import type { Metadata } from 'next';

import { FloatingPageCta } from '@/components/FloatingPageCta';
import { FaqSection } from '@/components/marketing/FaqSection';
import { Hero } from '@/components/marketing/Hero';
import { ProjectEnquiry } from '@/components/marketing/ProjectEnquiry';
import { RelatedPages } from '@/components/marketing/RelatedPages';
import { PageSchema } from '@/components/PageSchema';
import { metadataFor } from '@/lib/pages';
import { buildOneOffOffer } from '@/lib/seo';
import { numberSections } from '@/lib/sectionNumbers';
import { GBP_OPTIMISATION_PRICE } from '@/lib/servicePricing';

import { GbpConsistency } from './_components/GbpConsistency';
import { GbpIntroduction } from './_components/GbpIntroduction';
import { GBP_ENQUIRY_ID, GbpPackage } from './_components/GbpPackage';
import { GbpRules } from './_components/GbpRules';
import { GbpSetup } from './_components/GbpSetup';
import { gbpFaqs } from './_lib/copy';
import { GBP_PRODUCT_NAME, gbpPrice } from './_lib/plan';

const PATH = '/google-business-profile-optimisation';

const sections = numberSections([
  'Set up',
  'Match your site',
  'Kept clean',
  'Common questions',
] as const);

export const metadata: Metadata = metadataFor(PATH);

/**
 * The /seo page's layout for the one job that changes a Business Profile rather than reading it.
 * Sold by enquiry for now, so the card and the floating button lead to the form at the foot.
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
        lead="We fill in your Google Business Profile properly: categories, services and prices, hours, photos, posts and review replies, with your website and profile telling Google the same thing. For businesses in Perth and across Australia."
        primaryHref="#package"
        primaryLabel={`Done for you, ${gbpPrice}`}
        secondaryHref="/seo"
        secondaryLabel="Or start with an SEO audit"
        trustLine="Paid once, no subscription · Manager access only · Perth-based"
      />

      <GbpPackage />

      <GbpIntroduction />

      <GbpSetup eyebrow={sections['Set up']} />

      <GbpConsistency eyebrow={sections['Match your site']} />

      <GbpRules eyebrow={sections['Kept clean']} />

      <FloatingPageCta
        label="Ask for your optimisation"
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

      <ProjectEnquiry
        id={GBP_ENQUIRY_ID}
        eyebrow="Ask for it"
        showProjectType={false}
        defaultProjectType="gbp"
        title={
          <>
            Get your profile <span className="moving-colour-text">set up properly.</span>
          </>
        }
        lead={`${gbpPrice}, paid once. Send your details and we'll look at your profile, then reply with a start date and how to add us as a manager. Nothing is charged online.`}
      />
      <RelatedPages path={PATH} />
    </main>
  );
}
