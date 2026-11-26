import type { Metadata } from 'next';
import Image from 'next/image';

import { SampleReportLink } from '@/app/seo/_components/SampleReportLink';
import { SeoPackages } from '@/app/seo/_components/SeoPackages';
import { buildSeoPlans, PRICE_FIELD, seoAuditPrices } from '@/app/seo/_lib/plans';
import { CallRequest } from '@/components/marketing/CallRequest';
import { CallRequestNudge } from '@/components/marketing/CallRequestNudge';
import { CaseStudyTeaser } from '@/components/marketing/CaseStudyTeaser';
import { FaqSection } from '@/components/marketing/FaqSection';
import { Hero } from '@/components/marketing/Hero';
import { Introduction } from '@/components/marketing/Introduction';
import { RelatedPages } from '@/components/marketing/RelatedPages';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { PageSchema } from '@/components/PageSchema';
import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { SCOOTER_SHOP_GROWTH } from '@/lib/caseStudies';
import { formatMoney } from '@/lib/formatting';
import { metadataFor } from '@/lib/pages';
import { numberSections } from '@/lib/sectionNumbers';
import { buildOneOffOffer } from '@/lib/seo';
import { getSiteSettingsServer } from '@/lib/serverApi';

import { CaseStudyLink } from './_components/CaseStudyLink';
import { migrationFaqs } from './_lib/copy';

const PATH = '/website-migration-seo-perth';

export const metadata: Metadata = metadataFor(PATH);

/* The audits and the cost answer quote the admin's prices, so this page renders per request. */
export const dynamic = 'force-dynamic';

/* /seo's sections, one for one (owner, 2026-11-16): before the move, the
   redirects, and the measuring after launch. */
const sections = numberSections([
  'Before the website migration',
  'SEO redirects',
  'SEO after launch',
  'Migration SEO case study',
  'Website migration questions',
] as const);

/** The bar under the case study: how the old site became the new one. */
const casePoints = [
  'Every old address redirected',
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
 * Website migration SEO, for a business moving to a new site, platform or domain with any
 * developer, or one whose traffic fell after the move. What it buys is an SEO audit read for the
 * move; a redesign with us includes the move. Built as /seo is, section for
 * section, its splits alternating left and right.
 */
export default async function WebsiteMigrationSeoPage() {
  const settings = await getSiteSettingsServer();
  const plans = buildSeoPlans(settings);
  const serviceOffers = plans.flatMap((plan) => {
    const offer = buildOneOffOffer({
      price: Number(settings[PRICE_FIELD[plan.code]]),
      name: plan.productName,
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
      <PageSchema path={PATH} serviceOffers={serviceOffers} />
      <Hero
        path={PATH}
        titleLines={['Website migration SEO Perth:']}
        accentTitle="keep your rankings"
        lead="Moving to a new website, platform or domain? Website migration SEO keeps the searches your old site wins: every page that ranks found in your Search Console, redirected to its replacement, and checked after launch."
        primaryHref="#signup"
        primaryLabel={`Audits from ${fromPrice}`}
        secondaryHref="/portfolio/scooter-shop"
        secondaryLabel="Read the case study"
        secondaryNewTab
        trustLine="Fixed prices · Read from your own Search Console · Perth-based"
      />

      <SeoPackages
        settings={settings}
        copy={{
          title: 'Website migration SEO audit packages',
        }}
      />

      <CallRequestNudge question="Moving with your own developer and not sure what you need?" />

      <Introduction
        id="migration-overview"
        eyebrow="How it works"
        spacing="tight"
        flushBottom
        title="What is"
        accentTitle="website migration SEO?"
      >
        Website migration SEO is the work that keeps your Google rankings when your site moves: to a
        new design, a new platform such as Shopify or WordPress, or a new domain. It finds the pages
        Google sends people to now, gives each old address a permanent redirect to its replacement,
        and checks Search Console after launch to make sure the searches came across.
      </Introduction>

      <SplitFeatureSection
        id="before"
        eyebrow={sections['Before the website migration']}
        title="Know which pages"
        accentTitle="you can't afford to lose"
        description="Before anything is designed, the audit reads your Search Console and lists the pages Google sends people to now, and the searches each one wins. Those are the addresses the new site has to keep or redirect, and the titles and wording that already rank are the ones to carry across."
        visual={<SectionPicture src="/images/seo/what-google-looks-at.webp" />}
        textSide="left"
        background="white"
        spacing="joined"
        action={<SampleReportLink />}
      />

      <SplitFeatureSection
        id="redirects"
        eyebrow={sections['SEO redirects']}
        title="A permanent redirect"
        accentTitle="for every old address"
        description="Most of the risk in a move is in the addresses. Each old page needs a 301 redirect to the page that replaces it: not to the home page, and not a temporary 302, which can leave Google showing the old address for months. The report sets them out for your developer, or we add them when we build the site."
        visual={<SectionPicture src="/images/guides/business-not-showing-up-on-google.webp" />}
        textSide="right"
        spacing="joined"
        action={<CaseStudyLink />}
      />

      <SplitFeatureSection
        id="after-launch"
        eyebrow={sections['SEO after launch']}
        title="Checked after launch"
        accentTitle="in Search Console"
        description="Google can take about three months to re-read a moved site, so a dip in the first weeks is normal. A page still down after that is a fault, usually a redirect that was never added. If your traffic has already dropped, an audit reads your Search Console from before and after launch day and names what went missing."
        visual={<SectionPicture src="/images/guides/seo-cost-perth.webp" />}
        textSide="left"
        background="white"
        spacing="joined"
        action={<SampleReportLink />}
      />

      <CaseStudyTeaser
        eyebrow={sections['Migration SEO case study']}
        title={`Website migration results for a Perth business: organic clicks up ${SCOOTER_SHOP_GROWTH.percent}%.`}
        points={casePoints}
        primaryHref="#signup"
        primaryLabel="Choose an audit"
        showPrimaryAction={false}
      >
        <p>
          Scooter Shop is a Perth scooter dealership. Its old site was moved to one custom-coded
          site for stock, parts, purchasing and service, with every old address redirected to its
          replacement. Fast structured pages and focused search content grew its organic clicks{' '}
          {SCOOTER_SHOP_GROWTH.percent}% in {SCOOTER_SHOP_GROWTH.span}.
        </p>
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
        eyebrow={sections['Website migration questions']}
        title="Website migration SEO Perth: common questions."
        items={migrationFaqs(seoAuditPrices(settings))}
      />

      <CallRequest id="page-cta" source={PATH} title="Planning a website move?" />
      <RelatedPages path={PATH} />
    </main>
  );
}
