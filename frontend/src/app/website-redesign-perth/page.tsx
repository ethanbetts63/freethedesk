import type { Metadata } from 'next';
import Link from 'next/link';

import { CaseStudyTeaser } from '@/components/marketing/CaseStudyTeaser';
import { FaqSection } from '@/components/marketing/FaqSection';
import { Hero } from '@/components/marketing/Hero';
import { IndexedFeatureSection } from '@/components/marketing/IndexedFeatureSection';
import { PackagesSection } from '@/components/marketing/PackagesSection';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { PageSchema } from '@/components/PageSchema';
import { SCOOTER_SHOP_GROWTH } from '@/lib/caseStudies';
import { metadataFor } from '@/lib/pages';
import { numberSections } from '@/lib/sectionNumbers';
import { buildOneOffOffer } from '@/lib/seo';
import { getSiteSettingsServer, SERVICE_PRICE_FIELDS } from '@/lib/serverApi';
import { offerName, servicePrices } from '@/lib/servicePricing';

import { RANKING_STEPS, redesignFaqs, WORDPRESS_REASONS } from './_lib/copy';

export const metadata: Metadata = metadataFor('/website-redesign-perth');

/* The packages and the cost answer quote the admin's prices, so this page renders per request. */
export const dynamic = 'force-dynamic';

const sections = numberSections([
  'Why not WordPress',
  'Keeping your rankings',
  'Proof this works',
  'Common questions',
] as const);

const casePoints = [
  'Indexable stock',
  'Intent-focused pages',
  'Structured data',
  'Measured in Search Console',
];

const footnoteClassName = 'mt-xl max-w-[720px] text-body leading-relaxed text-text-muted';
const inlineLinkClassName =
  'text-text-action underline underline-offset-[3px] transition-opacity hover:opacity-70';

/**
 * Website redesign, for the businesses searching to replace a site they
 * already have: mostly WordPress, so the page leads on why to leave it and on
 * the part buyers fear, losing the searches the old site wins.
 */
export default async function WebsiteRedesignPage() {
  const prices = servicePrices(await getSiteSettingsServer(SERVICE_PRICE_FIELDS));
  const offers = prices.packages
    .filter((item) => !item.discovery)
    .map((item) => buildOneOffOffer({ price: item.price, name: offerName(item) }))
    .filter(Boolean) as object[];

  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema
        path="/website-redesign-perth"
        serviceOffers={offers.length ? offers : undefined}
      />
      <Hero
        path="/website-redesign-perth"
        eyebrow="Website redesign Perth"
        eyebrowIsHeading
        titleLines={['A new website that keeps your']}
        accentTitle="rankings."
        lead="Website redesign for Perth businesses outgrowing WordPress: a custom-coded site with no plugins to update, moved across page by page so the searches that find you now still find you after launch."
        primaryHref="#packages"
        primaryLabel="See the packages"
        secondaryHref="#rankings"
        secondaryLabel="How rankings are kept"
        trustLine="Fixed prices · Every old address redirected · Perth-based"
      />

      <PackagesSection packages={prices.packages.filter((item) => !item.discovery)} redesign />

      <div className="pt-section">
        <IndexedFeatureSection
          id="wordpress"
          eyebrow={sections['Why not WordPress']}
          title="Fewer moving parts."
          accentTitle="Less to go wrong."
          lead="WordPress itself is fine software. The trouble is what gets stacked on top of it: a theme, a page builder and a dozen plugins, each from a different developer, each with its own updates and licence. A custom-coded site does the same jobs without that layer."
          items={WORDPRESS_REASONS}
          footer={
            <p className={footnoteClassName}>
              WordPress still suits some businesses, such as ones that publish every day. Our guide
              to{' '}
              <Link href="/wordpress-website-cost-perth" className={inlineLinkClassName}>
                what a WordPress website really costs in Perth
              </Link>{' '}
              sets out when to stay.
            </p>
          }
        />
      </div>

      <IndexedFeatureSection
        id="rankings"
        eyebrow={sections['Keeping your rankings']}
        title="Every old address,"
        accentTitle="sent somewhere useful."
        lead="Most of the risk in a redesign is in the addresses. When a page Google ranks disappears without a redirect, the searches it won usually go with it. So the move is planned from your search data, not from the new design."
        items={RANKING_STEPS}
        footer={
          <p className={footnoteClassName}>
            After launch, our{' '}
            <Link href="/seo" className={inlineLinkClassName}>
              SEO audits
            </Link>{' '}
            show what the new site is found for and what to fix next.
          </p>
        }
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
          Scooter Shop is a Perth scooter dealership. Fast structured pages and focused search
          content grew its organic clicks {SCOOTER_SHOP_GROWTH.percent}% in{' '}
          {SCOOTER_SHOP_GROWTH.span}.
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
        title="Website redesign questions."
        items={redesignFaqs(prices)}
      />

      <ManualAdminCta
        id="page-cta"
        eyebrow="Start with what ranks"
        title="What is your current site found for?"
        href="/contact"
        buttonLabel="Get in touch"
      >
        Send us its address and we&apos;ll tell you what it ranks for today and what a move would
        need to keep.
      </ManualAdminCta>
    </main>
  );
}
