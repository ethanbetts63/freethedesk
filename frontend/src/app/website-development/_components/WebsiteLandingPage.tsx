import Image from 'next/image';
import Link from 'next/link';

import { FloatingPageCta } from '@/components/FloatingPageCta';
import { CallRequest } from '@/components/marketing/CallRequest';
import { CallRequestNudge } from '@/components/marketing/CallRequestNudge';
import { CaseStudyTeaser } from '@/components/marketing/CaseStudyTeaser';
import { FaqSection } from '@/components/marketing/FaqSection';
import { Hero, secondaryLinkClassName } from '@/components/marketing/Hero';
import { Introduction } from '@/components/marketing/Introduction';
import { RelatedPages } from '@/components/marketing/RelatedPages';
import { PageSchema } from '@/components/PageSchema';
import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { type PagePath } from '@/lib/pages';
import { numberSections } from '@/lib/sectionNumbers';
import { buildOneOffOffer } from '@/lib/seo';
import { getSiteSettingsServer, SERVICE_PRICE_FIELDS } from '@/lib/serverApi';
import { servicePrices, WEBSITE_PACKAGE_PRICES } from '@/lib/servicePricing';

import { WEBSITE_PLANS } from '../_lib/packages';
import type { WebsitePageCopy, WebsiteSectionCopy } from '../_lib/pageCopy';
import { WebsitePackages } from './WebsitePackages';

const CALL_FORM = '#page-cta';

/* /seo's three sections alternate sides, the outer two on white. */
const SECTION_LAYOUT = [
  { textSide: 'left', background: 'white' },
  { textSide: 'right', background: 'transparent' },
  { textSide: 'left', background: 'white' },
] as const;

/** A section's picture, in the guide illustrations' 3:2 frame, as the SEO page's picture is. */
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

function SectionLink({ link }: { link: WebsiteSectionCopy['link'] }) {
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
 * A website page (owner, 2026-11-21): three packages sold by what the site does rather than by
 * its page count, each card leading to a call rather than a checkout. Below the packages it is
 * /seo's page, section for section: the nudge, the centred introduction, three numbered sections,
 * the case study, the questions and the call-back form. The website page, its Subiaco page and the
 * WordPress page are this with different words.
 */
export async function WebsiteLandingPage({
  path,
  copy,
}: {
  path: PagePath;
  copy: WebsitePageCopy;
}) {
  const prices = servicePrices(await getSiteSettingsServer(SERVICE_PRICE_FIELDS));
  const offers = WEBSITE_PLANS.map((plan) =>
    buildOneOffOffer({
      price: WEBSITE_PACKAGE_PRICES[plan.code],
      name: `${plan.name} website package`,
    }),
  ).filter(Boolean) as object[];
  /* Section eyebrows in page order. */
  const numbered: Record<string, string> = numberSections([
    ...copy.sections.map((section) => section.label),
    copy.caseStudy.label,
    copy.faq.label,
  ]);

  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema path={path} serviceOffers={offers} />
      <Hero
        path={path}
        titleLines={copy.hero.titleLines}
        accentTitle={copy.hero.accentTitle}
        lead={copy.hero.lead}
        primaryHref="#packages"
        primaryLabel="See the packages"
        secondaryHref={CALL_FORM}
        secondaryLabel="Book a call"
        trustLine={copy.hero.trustLine}
      />

      <WebsitePackages copy={copy.packages} />

      <CallRequestNudge question={copy.nudge} href={CALL_FORM} />

      <Introduction
        id="website-overview"
        eyebrow={copy.introduction.eyebrow}
        spacing="tight"
        flushBottom
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
          visual={<SectionPicture src={section.picture} />}
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
        showAfterId="packages-end"
        hideAtId="page-cta"
      />

      <FaqSection
        emitSchema
        eyebrow={numbered[copy.faq.label]}
        title={copy.faq.title}
        items={copy.faq.items(prices)}
      />

      <CallRequest
        id="page-cta"
        source={path}
        title={copy.call.title}
        picture={copy.call.picture}
      />
      <RelatedPages path={path} />
    </main>
  );
}
