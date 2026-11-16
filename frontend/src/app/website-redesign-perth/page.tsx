import type { Metadata } from 'next';
import Image from 'next/image';

import { CallRequestNudge } from '@/components/marketing/CallRequestNudge';
import { CaseStudyTeaser } from '@/components/marketing/CaseStudyTeaser';
import { FaqSection } from '@/components/marketing/FaqSection';
import { Hero } from '@/components/marketing/Hero';
import { Introduction } from '@/components/marketing/Introduction';
import { RelatedPages } from '@/components/marketing/RelatedPages';
import { ServicePackages } from '@/components/marketing/ServicePackages';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { PageSchema } from '@/components/PageSchema';
import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { SCOOTER_SHOP_GROWTH } from '@/lib/caseStudies';
import { metadataFor } from '@/lib/pages';
import { numberSections } from '@/lib/sectionNumbers';
import { buildOneOffOffer } from '@/lib/seo';
import { getSiteSettingsServer, SERVICE_PRICE_FIELDS } from '@/lib/serverApi';
import { money, offerName, servicePrices } from '@/lib/servicePricing';

import { CaseStudyLink } from './_components/CaseStudyLink';
import { WordPressCostLink } from './_components/WordPressCostLink';
import { redesignFaqs } from './_lib/copy';

export const metadata: Metadata = metadataFor('/website-redesign-perth');

/* The packages and the cost answer quote the admin's prices, so this page renders per request. */
export const dynamic = 'force-dynamic';

/* The /seo page's sections, one for one (owner, 2026-11-16): its Analyse, Recommend and Experiment
   become why to leave WordPress, the redirects, and the measuring after launch. */
const sections = numberSections([
  'Why not WordPress',
  'Keeping your rankings',
  'Measured after launch',
  'Proof this works',
  'Common questions',
] as const);

/** The bar under the case study: how the old site became the new one. */
const casePoints = [
  'Indexable stock',
  'Intent-focused pages',
  'Structured data',
  'Measured in Search Console',
];

/** A section's picture, in the guide illustrations' 3:2 frame, as /seo's Analyse picture is. */
function SectionPicture({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={1536}
      height={1024}
      sizes="(min-width: 1024px) 55vw, 100vw"
      className="aspect-[3/2] h-auto w-full rounded-lg border border-border-default object-cover"
    />
  );
}

/**
 * Website redesign, for the businesses searching to replace a site they already have: mostly
 * WordPress, so the page leads on why to leave it and on the part buyers fear, losing the searches
 * the old site wins. Built as /seo is, section for section, its splits alternating left and right.
 */
export default async function WebsiteRedesignPage() {
  const prices = servicePrices(await getSiteSettingsServer(SERVICE_PRICE_FIELDS));
  const packages = prices.packages.filter((item) => !item.discovery);
  const offers = packages
    .map((item) => buildOneOffOffer({ price: item.price, name: offerName(item) }))
    .filter(Boolean) as object[];
  // "From": the cheapest package, whichever that is.
  const fromPrice = money(Math.min(...packages.map((item) => item.price)));

  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema
        path="/website-redesign-perth"
        serviceOffers={offers.length ? offers : undefined}
      />
      <Hero
        path="/website-redesign-perth"
        titleLines={['Website redesign Perth:']}
        accentTitle="moving off WordPress"
        lead="Website redesign for Perth businesses outgrowing WordPress: a custom-coded site with no plugins to update, moved across page by page so the searches that find you now still find you after launch."
        primaryHref="#packages"
        primaryLabel={`Redesigns from ${fromPrice}`}
        secondaryHref="/portfolio/scooter-shop"
        secondaryLabel="Read the case study"
        secondaryNewTab
        trustLine="Fixed prices · Every old address redirected · Perth-based"
      />

      <ServicePackages
        title="Website redesign packages"
        lead="Priced like a new build: a fixed price per page, half when you buy and the rest before launch. Moving your pages across and redirecting the old addresses is part of it."
        packages={packages}
        redesign
      />

      <CallRequestNudge question="Not sure which package fits your site?" />

      <Introduction
        id="redesign-overview"
        eyebrow="How it works"
        spacing="tight"
        flushBottom
        title="What is in a"
        accentTitle="website redesign?"
      >
        A website redesign replaces the site you have with a custom-coded one, without starting your
        search standing again from zero. We read what Google finds your current site for, rebuild
        every page with nothing to patch or license, redirect each old address to its replacement,
        and watch Search Console after launch to check the searches came across.
      </Introduction>

      <SplitFeatureSection
        id="wordpress"
        eyebrow={sections['Why not WordPress']}
        title="Why move off WordPress:"
        accentTitle="fewer plugins and updates"
        description="WordPress itself is fine software. The trouble is the theme, page builder and dozen plugins stacked on top, each with its own updates and licence. A custom-coded site does the same jobs with nothing to patch each month, no yearly licences in US dollars, and pages that load only what they need."
        visual={<SectionPicture src="/images/redesign/why-not-wordpress.webp" />}
        textSide="left"
        background="white"
        spacing="joined"
        action={<WordPressCostLink />}
      />

      <SplitFeatureSection
        id="rankings"
        eyebrow={sections['Keeping your rankings']}
        title="Redirects that keep"
        accentTitle="your Google rankings"
        description="Most of the risk in a redesign is in the addresses. Before anything is built we pull every page Google shows today from your Search Console. Each old address then gets a permanent redirect to the page that replaces it, and the titles and wording that already rank are kept."
        visual={<SectionPicture src="/images/guides/business-not-showing-up-on-google.webp" />}
        textSide="right"
        spacing="joined"
        action={<CaseStudyLink />}
      />

      <SplitFeatureSection
        id="measured"
        eyebrow={sections['Measured after launch']}
        title="Every move is"
        accentTitle="measured in Search Console"
        description="The new sitemap goes to Google on launch day, and Search Console is watched in the weeks after, so a missing redirect is caught early rather than months later."
        visual={<SectionPicture src="/images/guides/seo-cost-perth.webp" />}
        textSide="left"
        background="white"
        spacing="joined"
        action={<CaseStudyLink />}
      />

      <CaseStudyTeaser
        eyebrow={sections['Proof this works']}
        title={`Website redesign results for a Perth business: organic clicks up ${SCOOTER_SHOP_GROWTH.percent}%.`}
        points={casePoints}
        primaryHref="#packages"
        primaryLabel="Choose your package"
        showPrimaryAction={false}
      >
        <p>
          Scooter Shop is a Perth scooter dealership. Its old site was rebuilt as one custom-coded
          site for stock, parts, purchasing and service, with its old addresses redirected. Fast
          structured pages and focused search content grew its organic clicks{' '}
          {SCOOTER_SHOP_GROWTH.percent}% in {SCOOTER_SHOP_GROWTH.span}.
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
        title="Website redesign Perth: common questions."
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
      <RelatedPages path="/website-redesign-perth" />
    </main>
  );
}
