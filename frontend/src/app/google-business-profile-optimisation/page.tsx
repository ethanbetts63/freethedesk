import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { FloatingPageCta } from '@/components/FloatingPageCta';
import { CallRequest } from '@/components/marketing/CallRequest';
import { CaseStudyTeaser } from '@/components/marketing/CaseStudyTeaser';
import { FaqSection } from '@/components/marketing/FaqSection';
import { Hero, secondaryLinkClassName } from '@/components/marketing/Hero';
import { Introduction } from '@/components/marketing/Introduction';
import { RelatedPages } from '@/components/marketing/RelatedPages';
import { PageSchema } from '@/components/PageSchema';
import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { metadataFor } from '@/lib/pages';
import { buildOneOffOffer } from '@/lib/seo';
import { numberSections } from '@/lib/sectionNumbers';
import { getSiteSettingsServer } from '@/lib/serverApi';
import { money } from '@/lib/servicePricing';

import { GBP_CALL_FORM_ID, GbpPackage } from './_components/GbpPackage';
import { GbpMatchCard } from './_components/GbpMatchCard';
import { GbpProfileCard } from './_components/GbpProfileCard';
import { GBP_AUDIT_PICTURE, GBP_COPY, gbpFaqs, type GbpSectionCopy } from './_lib/copy';
import { GBP_PRODUCT_NAME, gbpPlan } from './_lib/plan';

const PATH = '/google-business-profile-optimisation';
const CALL_FORM = `#${GBP_CALL_FORM_ID}`;

/* /seo's three sections alternate sides, the outer two on white. */
const SECTION_LAYOUT = [
  { textSide: 'left', background: 'white' },
  { textSide: 'right', background: 'transparent' },
  { textSide: 'left', background: 'white' },
] as const;

/* As on /seo: a picture first, then a drawn report card and a drawn check card. */
const SECTION_VISUALS = [
  <Image
    key="audit"
    src={GBP_AUDIT_PICTURE}
    alt=""
    width={1536}
    height={1024}
    sizes="(min-width: 1024px) 55vw, 100vw"
    className="aspect-[3/2] h-auto w-full rounded-lg border border-border-default object-cover"
  />,
  <GbpProfileCard key="profile" />,
  <GbpMatchCard key="website" />,
] as const;

export const metadata: Metadata = metadataFor(PATH);

/* The price is the admin's, so this page renders per request. */
export const dynamic = 'force-dynamic';

function SectionLink({ link }: { link: GbpSectionCopy['link'] }) {
  return (
    <Link
      className={secondaryLinkClassName}
      href={link.href}
      {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {link.label} <span>{link.newTab ? '↗' : '→'}</span>
    </Link>
  );
}

/**
 * /seo's layout, section for section (owner, 2026-11-26): the hero, the one card, the
 * introduction, three numbered sections (a picture, then two drawn cards), the case study, the
 * questions and the call-back form. No nudge under the card (owner, 2026-11-26). No online checkout yet, so the card and the floating button lead to the
 * call-back form.
 */
export default async function GoogleBusinessProfileOptimisationPage() {
  const settings = await getSiteSettingsServer(['gbp_optimisation_price']);
  const priceValue = Number(settings.gbp_optimisation_price);
  const price = money(priceValue);
  const plan = gbpPlan(price);
  // The Service node is declared in STATIC_PAGES; only its one price is added here.
  const serviceOffers = buildOneOffOffer({ price: priceValue, name: GBP_PRODUCT_NAME });
  const copy = GBP_COPY;
  /* Section eyebrows in page order. */
  const numbered: Record<string, string> = numberSections([
    ...copy.sections.map((section) => section.label),
    copy.caseStudy.label,
    copy.faq.label,
  ]);

  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema path={PATH} serviceOffers={serviceOffers} />
      <Hero
        path={PATH}
        titleLines={copy.hero.titleLines}
        accentTitle={copy.hero.accentTitle}
        lead={copy.hero.lead}
        primaryHref="#package"
        primaryLabel="Pricing"
        secondaryHref={CALL_FORM}
        secondaryLabel="Book a call"
        trustLine={copy.hero.trustLine}
      />

      <GbpPackage plan={plan} copy={copy.packages} />

      <Introduction
        id="gbp-overview"
        eyebrow={copy.introduction.eyebrow}
        title={copy.introduction.title}
        accentTitle={copy.introduction.accentTitle}
      >
        {copy.introduction.body}
      </Introduction>

      {copy.sections.map((section, index) => (
        <SplitFeatureSection
          key={section.id}
          id={section.id}
          eyebrow={numbered[section.label]}
          title={section.title}
          accentTitle={section.accentTitle}
          description={section.description}
          visual={SECTION_VISUALS[index]}
          textSide={SECTION_LAYOUT[index].textSide}
          background={SECTION_LAYOUT[index].background}
          spacing="joined"
          action={<SectionLink link={section.link} />}
        />
      ))}

      <CaseStudyTeaser
        eyebrow={numbered[copy.caseStudy.label]}
        title={copy.caseStudy.title}
        points={copy.caseStudy.points}
        primaryHref={CALL_FORM}
        primaryLabel="Book a call"
        showPrimaryAction={false}
      >
        <p>{copy.caseStudy.body}</p>
      </CaseStudyTeaser>

      <FloatingPageCta
        label="Book a call"
        href={CALL_FORM}
        showAfterId="package-end"
        hideAtId={GBP_CALL_FORM_ID}
      />

      <FaqSection
        emitSchema
        eyebrow={numbered[copy.faq.label]}
        title={copy.faq.title}
        items={gbpFaqs(price)}
      />

      <CallRequest
        id={GBP_CALL_FORM_ID}
        source={PATH}
        title={copy.call.title}
        picture={copy.call.picture}
      />
      <RelatedPages path={PATH} />
    </main>
  );
}
