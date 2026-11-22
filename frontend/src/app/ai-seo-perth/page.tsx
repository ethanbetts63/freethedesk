import type { Metadata } from 'next';
import Image from 'next/image';

import { SampleReportLink } from '@/app/seo/_components/SampleReportLink';
import { SeoPackages } from '@/app/seo/_components/SeoPackages';
import { buildSeoPlans, PRICE_FIELD, seoAuditPrices } from '@/app/seo/_lib/plans';
import { AiReadinessBanner } from '@/components/marketing/AiReadinessBanner';
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
import { BLOOMPRINT_GROWTH } from '@/lib/caseStudies';
import { formatMoney } from '@/lib/formatting';
import { metadataFor } from '@/lib/pages';
import { numberSections } from '@/lib/sectionNumbers';
import { buildOneOffOffer } from '@/lib/seo';
import { getSiteSettingsServer } from '@/lib/serverApi';

import { AiSearchGuideLink } from './_components/AiSearchGuideLink';
import { aiSeoFaqs } from './_lib/copy';

const PATH = '/ai-seo-perth';

export const metadata: Metadata = metadataFor(PATH);

/* The audits and the cost answer quote the admin's prices, so this page renders per request. */
export const dynamic = 'force-dynamic';

/* /seo's sections, one for one (owner, 2026-11-16): letting the AI crawlers
   in, pages a machine can read, and measuring where you appear. */
const sections = numberSections([
  'Found',
  'Read',
  'Measured',
  'Proof this works',
  'Common questions',
] as const);

/** The bar under the case study: what the search work behind it was. */
const casePoints = [
  'Question-led guides',
  'City pages',
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
 * AI SEO, for businesses asking how to be named by ChatGPT, Google's AI Overviews, Copilot and
 * Perplexity. What it buys is an SEO audit, every one of which checks for AI search; the free AI
 * readiness check sits above the hero, as on the website pages. Built as /seo
 * is, section for section, its splits alternating left and right.
 */
export default async function AiSeoPage() {
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
      <AiReadinessBanner />
      <Hero
        path={PATH}
        titleLines={['AI SEO Perth:']}
        accentTitle="get named in AI answers"
        lead="AI SEO for Perth businesses: what ChatGPT, Google's AI Overviews, Copilot and Perplexity need to find your site, read it and name you, checked against your own search data and ranked by what each fix is worth."
        primaryHref="#signup"
        primaryLabel={`Audits from ${fromPrice}`}
        secondaryHref="/seo/sample-report"
        secondaryLabel="See a sample report"
        secondaryNewTab
        trustLine="Money back if your Google clicks don't grow · Paid once, no subscription · Perth-based"
      />

      <SeoPackages
        settings={settings}
        copy={{
          title: 'AI SEO audits',
          lead: 'One written report, paid once. Every audit checks whether AI crawlers can reach your site and what AI answers say about your business.',
        }}
      />

      <CallRequestNudge />

      <Introduction
        id="ai-seo-overview"
        eyebrow="How it works"
        spacing="tight"
        flushBottom
        title="What is"
        accentTitle="AI SEO?"
      >
        AI SEO, also called GEO, is the work that gets your business named when customers ask an AI
        instead of searching. AI tools lean on search indexes, so most of it is the SEO Google
        rewards anyway. The rest is the checks most sites have never had: which AI crawlers are let
        in, whether Bing has your pages, and whether a machine can tell who you are and what you do.
      </Introduction>

      <SplitFeatureSection
        id="found"
        eyebrow={sections['Found']}
        title="Let the AI crawlers"
        accentTitle="into your site"
        description="ChatGPT, Claude and Perplexity each send their own crawler, and Copilot reads Bing. One line in robots.txt, a hosting firewall or a Search Console setting can shut them out without you knowing. The audit checks whether each one can reach your site."
        visual={<SectionPicture src="/images/guides/how-to-show-up-in-ai-search.webp" />}
        textSide="left"
        background="white"
        spacing="joined"
        action={<AiSearchGuideLink />}
      />

      <SplitFeatureSection
        id="read"
        eyebrow={sections['Read']}
        title="Pages an AI can"
        accentTitle="read and quote"
        description="An answer is built from words a machine can read: in the page itself, not only in scripts, with structured data saying who you are, where you work and what you charge, and your business details matching everywhere you're listed. We add an llms.txt file too, a plain summary of your site for the AI tools that read one."
        visual={<SectionPicture src="/images/seo/what-google-looks-at.webp" />}
        textSide="right"
        spacing="joined"
        action={<SampleReportLink />}
      />

      <SplitFeatureSection
        id="measured"
        eyebrow={sections['Measured']}
        title="Where you appear,"
        accentTitle="measured"
        description="Search Console now reports how often Google shows your pages in AI Overviews and AI Mode, and Bing reports citations in Copilot. Every change the audit recommends becomes an experiment, measured in your Search Console: what earns is kept, and what doesn't is dropped."
        visual={<SectionPicture src="/images/guides/seo-cost-perth.webp" />}
        textSide="left"
        background="white"
        spacing="joined"
        action={<SampleReportLink />}
      />

      <CaseStudyTeaser
        eyebrow={sections['Proof this works']}
        study="bloomprint"
        title={`AI answers start with search: a new brand's organic clicks up ${BLOOMPRINT_GROWTH.percent}%.`}
        points={casePoints}
        primaryHref="#signup"
        primaryLabel="Choose an audit"
        showPrimaryAction={false}
      >
        <p>
          Bloomprint is a national flower delivery marketplace. Fast pages a machine can read, a
          guide for each question buyers ask and a page for each city grew the new site&apos;s
          organic clicks {BLOOMPRINT_GROWTH.percent}% in {BLOOMPRINT_GROWTH.span}: the same pages AI
          answers are built from.
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
        eyebrow={sections['Common questions']}
        title="AI SEO Perth: common questions."
        items={aiSeoFaqs(seoAuditPrices(settings))}
      />

      <CallRequest id="page-cta" source={PATH} title="Want to be named in AI answers?" />
      <RelatedPages path={PATH} />
    </main>
  );
}
