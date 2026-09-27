import Image from 'next/image';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Fragment } from 'react';

import Eyebrow from '@/components/common/eyebrow';
import { FaqSection } from '@/components/marketing/FaqSection';
import type { FaqItem } from '@/types/FaqItem';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { PageSchema } from '@/components/PageSchema';
import { CtaButton } from '@/components/CtaButton';
import { ProcessBar, type ProcessBarStep } from '@/components/ProcessBar';
import { ProofStrip, type ProofStat } from '@/components/ProofStrip';
import { ScrollCtaButton } from '@/components/common/ScrollCtaButton';
import { SectionNumber } from '@/components/SectionNumber';
import { SeoReportOverview } from '@/components/SeoReportOverview';
import { ProjectEnquiry } from '@/components/marketing/ProjectEnquiry';
import type { PagePath } from '@/lib/pages';
import { numberSections } from '@/lib/sectionNumbers';

import { BrowserFrame, type PortfolioImage } from './BrowserFrame';
import { PortfolioEnquiryCta } from './PortfolioEnquiryCta';
import { PortfolioTour, type PortfolioTourItem } from './PortfolioTour';
import { heroGridClassName } from '@/lib/gridSurface';
import { cn } from '@/lib/utils';
import { FloatingPill, LiveMark, PhoneFrame } from '@/components/visuals/PhoneFrame';

type LineHeading = {
  lines: readonly string[];
  accentLine?: number;
};

type MobileStory = {
  eyebrow: string;
  title: string;
  description: string;
  stat: ProofStat;
  image: PortfolioImage;
  callout: string;
};

type SectionHeading = {
  eyebrow: string;
  title: LineHeading;
  description: string;
};

type OperationsFeature = SectionHeading & {
  variant: 'operations';
  console: {
    workspace: string;
    navigation: readonly string[];
    activeNavigation: string;
    activeCount: string;
    timestamp: string;
    title: string;
    status: string;
    items: readonly { number: string; title: string; detail: string }[];
  };
};

type DualStepsFeature = SectionHeading & {
  variant: 'dual-steps';
  columns: readonly {
    label: string;
    title: string;
    description: string;
    steps: readonly { number: string; detail: string }[];
  }[];
};

type MediaFeature = {
  eyebrow: string;
  title: string;
  description: string;
  points: readonly string[];
  image: PortfolioImage;
  browserUrl: string;
  reverse?: boolean;
  tinted?: boolean;
};

type IntentSection = SectionHeading & {
  groups: readonly {
    number: string;
    title: string;
    pages: readonly string[];
  }[];
};

export type PortfolioCaseStudyConfig = {
  path: PagePath;
  process: {
    label: string;
    steps: readonly ProcessBarStep[];
  };
  hero: {
    eyebrow: string;
    title: LineHeading;
    description: string;
    liveHref: string;
    browserUrl: string;
    desktopImage: PortfolioImage;
    mobileImage: PortfolioImage;
    liveLabel: string;
    capabilities: readonly string[];
  };
  proof: {
    id: string;
    stats: readonly ProofStat[];
  };
  intro: {
    eyebrow: string;
    title: LineHeading;
    paragraphs: readonly string[];
    capabilities: readonly string[];
    showCta?: boolean;
  };
  tour: {
    eyebrow: string;
    title: LineHeading;
    label: string;
    browserUrl: string;
    items: readonly PortfolioTourItem[];
  };
  mobile: MobileStory;
  feature: OperationsFeature | DualStepsFeature;
  mediaFeatures?: readonly MediaFeature[];
  intent: IntentSection;
  seo: {
    eyebrow: string;
    title: string;
    accentTitle: string;
    description: string;
  };
  faq: {
    eyebrow: string;
    items: FaqItem[];
  };
};

function HeadingLines({ heading }: { heading: LineHeading }) {
  return (
    <>
      {heading.lines.map((line, index) => (
        <Fragment key={line}>
          {index === heading.accentLine ? <span>{line}</span> : line}
          {index < heading.lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Every section below the hero opens with this heading. It was four selectors
 * sharing one rule in the case-study stylesheet, which is exactly the shape
 * that has to become a named constant rather than a descendant selector.
 */
const caseHeadingClassName = 'm-0 text-hero leading-[0.96] tracking-[-0.067em]';

/**
 * The hero's pair of calls to action. Was the last consumer of the global
 * `.button-row` that Phase 3 removed everywhere else.
 */
/** The muted lead paragraph that follows a section heading. */
const caseLeadClassName = 'text-lead leading-[1.72] text-text-muted';

/**
 * A section's opening block: the number in a narrow first column, the heading
 * in a wide second. Three columns from xl, the last left empty as a rail.
 */
const caseSectionHeadingClassName =
  'mb-2xl grid grid-cols-[minmax(0,1fr)] gap-ml lg:mb-3xl lg:grid-cols-[minmax(0,0.4fr)_minmax(0,1.2fr)] lg:gap-x-3xl lg:gap-y-xl xl:grid-cols-[minmax(0,0.5fr)_minmax(0,1.2fr)_minmax(0,0.7fr)]';

const caseButtonRowClassName =
  'flex flex-col flex-wrap items-start gap-l sm:flex-row sm:items-center';

function PortfolioHero({ config }: { config: PortfolioCaseStudyConfig['hero'] }) {
  return (
    <section className="relative min-h-auto overflow-hidden py-3xl lg:min-h-[720px]">
      <div
        className={cn(
          heroGridClassName,
          '[mask-image:linear-gradient(to_right,var(--text-primary)_15%,color-mix(in_srgb,var(--text-primary)_48%,transparent)_64%,transparent)]',
        )}
        aria-hidden="true"
      />
      {/* The copy column narrows as the viewport widens so the screenshot can
          take more of the room it needs. */}
      <div className="site-shell relative grid grid-cols-[minmax(0,1fr)] items-center gap-2xl lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:gap-3xl">
        <div className="relative z-3">
          <Eyebrow dot tone="accent">
            {config.eyebrow}
          </Eyebrow>
          <h1 className="m-0 text-display font-heavy leading-[0.91] tracking-[-0.078em] lg:text-hero [&_span]:text-text-action">
            <HeadingLines heading={config.title} />
          </h1>
          <p className="my-xl max-w-[555px] text-lead leading-relaxed text-text-muted">
            {config.description}
          </p>
          <div className={caseButtonRowClassName}>
            <CtaButton href={config.liveHref} target="_blank" rel="noreferrer">
              Visit the live website
            </CtaButton>
            <ScrollCtaButton
              targetId="tour"
              classes="cursor-pointer appearance-none border-0 border-b border-b-text-primary bg-transparent pt-3xs pb-2xs font-[inherit] text-body font-heavy text-inherit [&>span]:ml-xs"
            >
              Explore the build <span>↓</span>
            </ScrollCtaButton>
          </div>
          <div className="mt-xl flex flex-wrap gap-x-l gap-y-s border-t border-border-default pt-m lg:mt-2xl [&>span]:text-caption [&>span]:font-heavy [&>span]:tracking-label-tight [&>span]:text-text-subtle [&>span]:uppercase">
            {config.capabilities.map((capability) => (
              <span key={capability}>{capability}</span>
            ))}
          </div>
        </div>

        {/* Bleeds past the page rail from lg so the window runs off the edge.
            The negative margins are literal: there is no token for absence. */}
        {/* eslint-disable-next-line no-restricted-syntax -- A bleed, not spacing: the
          panel overhangs its column by however much the artwork beside it needs,
          measured against the image rather than chosen from the scale. */}
        <div className="relative m-0 pt-l pr-0 pb-2xl pl-s sm:pl-xl lg:mr-[-190px] lg:pt-xl lg:pl-2xl xl:mr-[-105px]">
          <BrowserFrame image={config.desktopImage} browserUrl={config.browserUrl} hero />
          <PhoneFrame
            size="inset"
            menu
            className={cn(config.mobileImage.className && 'aspect-[390/844]')}
          >
            <Image
              className={config.mobileImage.className}
              src={config.mobileImage.src}
              alt={config.mobileImage.alt}
              width={config.mobileImage.width}
              height={config.mobileImage.height}
              priority
            />
          </PhoneFrame>
          <FloatingPill className="top-[9px] right-[-4px] shadow-s lg:right-[22px]">
            <LiveMark /> {config.liveLabel}
          </FloatingPill>
        </div>
      </div>
    </section>
  );
}

function PortfolioIntro({ config }: { config: PortfolioCaseStudyConfig['intro'] }) {
  return (
    <section
      className="section site-shell grid grid-cols-[minmax(0,1fr)] gap-xl py-section lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1.58fr)] lg:gap-section"
      id="overview"
    >
      <SectionNumber>{config.eyebrow}</SectionNumber>
      <div className="max-w-[880px]">
        <h2 className={caseHeadingClassName}>
          <HeadingLines heading={config.title} />
        </h2>
        {config.paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="my-xl max-w-[720px] text-lead leading-[1.72] text-text-muted"
          >
            {paragraph}
          </p>
        ))}
        {/* One row per capability on a phone, two from sm, four from lg. The
            dot is a ::before so the text can wrap under itself. */}
        <div className="grid grid-cols-[minmax(0,1fr)] border-t border-border-default sm:grid-cols-2 lg:grid-cols-4 [&>span]:relative [&>span]:border-b [&>span]:border-border-default [&>span]:py-m [&>span]:pr-xs [&>span]:pl-ml [&>span]:text-body-sm [&>span]:font-strong [&>span]:text-text-muted [&>span]:before:absolute [&>span]:before:top-[21px] [&>span]:before:left-[2px] [&>span]:before:h-[5px] [&>span]:before:w-[5px] [&>span]:before:rounded-circle [&>span]:before:bg-action-primary [&>span]:before:content-['']">
          {config.capabilities.map((capability) => (
            <span key={capability}>{capability}</span>
          ))}
        </div>
        {config.showCta !== false && <PortfolioEnquiryCta />}
      </div>
    </section>
  );
}

function PortfolioTourSection({ config }: { config: PortfolioCaseStudyConfig['tour'] }) {
  return (
    <section className="bg-surface-tint py-section" id="tour">
      <div className="site-shell">
        <div className={caseSectionHeadingClassName}>
          <SectionNumber>{config.eyebrow}</SectionNumber>
          <h2 className={cn(caseHeadingClassName, 'lg:col-start-2')}>
            <HeadingLines heading={config.title} />
          </h2>
        </div>
        <PortfolioTour label={config.label} browserUrl={config.browserUrl} items={config.items} />
      </div>
    </section>
  );
}

function PortfolioMobileStory({ config }: { config: MobileStory }) {
  return (
    <section className="bg-surface-page py-section">
      <div className="site-shell grid grid-cols-[minmax(0,1fr)] items-center gap-2xl lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:gap-section">
        <div>
          <SectionNumber>{config.eyebrow}</SectionNumber>
          <h2 className={caseHeadingClassName}>{config.title}</h2>
          <p className={cn(caseLeadClassName, 'mt-xl mb-0 max-w-[540px]')}>{config.description}</p>
          <div className="mt-xl grid max-w-[540px] grid-cols-[auto_minmax(0,1fr)] items-center gap-l border-y border-border-default py-ml">
            {/* The trailing padding is optical kerning after the last glyph:
                em-relative to the number's own size, not interface spacing. */}
            {/* eslint-disable-next-line no-restricted-syntax -- Optical kerning after the final glyph: em-relative to the numeral's own size, not interface spacing. */}
            <strong className="moving-colour-text pr-[0.08em] text-hero leading-[0.85] tracking-[-0.08em]">
              {config.stat.value}
            </strong>
            <span className="block">
              <b className="block text-body leading-[1.35]">{config.stat.label}</b>
              <small className="mt-2xs block text-caption leading-normal text-text-subtle">
                {config.stat.description}
              </small>
            </span>
          </div>
          <PortfolioEnquiryCta />
        </div>
        {/* Graph paper at its own scale: this is a stage for a drawn object,
            not a page surface, so the 46px grid is literal. */}
        <div className="relative flex min-h-[550px] items-center justify-center overflow-hidden bg-surface-dark [background-image:linear-gradient(var(--tint-grid-on-dark-strong)_1px,transparent_1px),linear-gradient(90deg,var(--tint-grid-on-dark-strong)_1px,transparent_1px)] [background-size:46px_46px] lg:min-h-[620px]">
          <PhoneFrame size="standalone" menu>
            <Image
              className={config.image.className}
              src={config.image.src}
              alt={config.image.alt}
              width={config.image.width}
              height={config.image.height}
            />
          </PhoneFrame>
          <FloatingPill className="top-[25%] right-[1%] shadow-contrast-s lg:right-[7%]">
            <b className="text-label text-text-action">01</b>
            <span>{config.callout}</span>
          </FloatingPill>
        </div>
      </div>
    </section>
  );
}

function OperationsConsole({ config }: { config: OperationsFeature['console'] }) {
  return (
    // A row of scrolling chips on a phone, a fixed sidebar from lg.
    <div className="grid min-h-[530px] grid-cols-[minmax(0,1fr)] overflow-hidden rounded-l border border-border-on-dark-strong bg-surface-tint text-text-primary lg:grid-cols-[190px_minmax(0,1fr)]">
      <aside className="flex flex-row gap-2xs overflow-x-auto border-b border-border-strong bg-surface-tint-strong p-s lg:flex-col lg:overflow-x-visible lg:border-r lg:border-b-0 lg:px-ml lg:py-xl">
        <strong className="mr-xs min-w-[115px] px-3xs py-s text-body lg:mr-0 lg:mb-m lg:min-w-0 lg:border-b lg:border-border-strong lg:px-xs lg:pt-0 lg:pb-l">
          {config.workspace}
        </strong>
        {config.navigation.map((item) => (
          <span
            className={cn(
              'flex min-w-max items-center justify-between px-xs py-s text-label font-strong text-text-muted lg:min-w-0',
              item === config.activeNavigation && 'rounded-xs bg-surface-dark text-text-on-dark',
            )}
            key={item}
          >
            {item}{' '}
            {item === config.activeNavigation && (
              <b className="flex h-[20px] w-[20px] items-center justify-center rounded-circle bg-accent text-caption text-text-primary">
                {config.activeCount}
              </b>
            )}
          </span>
        ))}
      </aside>
      <div className="px-ml py-xl lg:p-xl">
        <div className="flex flex-col items-start justify-between gap-m border-b border-border-default pb-l lg:flex-row lg:items-end lg:gap-0">
          <div>
            <small className="text-label font-heavy tracking-label text-text-action uppercase">
              {config.timestamp}
            </small>
            <h3 className="mt-xs mb-0 text-display tracking-[-0.06em]">{config.title}</h3>
          </div>
          <span className="text-caption text-text-muted">
            {config.status}{' '}
            <i className="ml-2xs inline-block h-[7px] w-[7px] rounded-circle bg-[var(--status-won)]" />
          </span>
        </div>
        <div>
          {config.items.map((item) => (
            <article
              className="grid grid-cols-[25px_minmax(0,1fr)] items-center gap-s border-b border-border-default px-3xs py-ml lg:grid-cols-[35px_minmax(0,1fr)_auto] lg:gap-ml"
              key={item.number}
            >
              <span className="text-label font-black text-text-action">{item.number}</span>
              <div>
                <h4 className="m-0 mb-3xs text-lead">{item.title}</h4>
                <p className="m-0 text-label leading-normal text-text-muted">{item.detail}</p>
              </div>
              {/* Below lg the row is two columns, so this wraps under the copy
                  rather than sitting beside it. */}
              <b className="col-start-2 text-caption lg:col-auto">Open →</b>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Two step columns, the second inverted onto the accent. The alternate colours
 * are the only difference between them, so they ride on one `alt` flag rather
 * than a second class family.
 */
function DualSteps({ columns }: { columns: DualStepsFeature['columns'] }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-l lg:grid-cols-2">
      {columns.map((column, index) => {
        const alt = index % 2 === 1;
        return (
          <article
            className={cn(
              'flex flex-col rounded-l px-xl pt-xl pb-l text-text-primary xl:pb-xl',
              alt ? 'bg-accent' : 'bg-surface-page',
            )}
            key={column.label}
          >
            <header className="border-b border-border-default pb-l">
              <small
                className={cn(
                  'mb-s block text-label font-black tracking-label uppercase',
                  alt ? 'text-text-primary' : 'text-text-action',
                )}
              >
                {column.label}
              </small>
              <h3 className="m-0 text-display tracking-[-0.06em]">{column.title}</h3>
              <p
                className={cn(
                  'mt-s mb-0 max-w-[380px] text-body leading-relaxed',
                  alt ? 'text-text-on-accent' : 'text-text-muted',
                )}
              >
                {column.description}
              </p>
            </header>
            <ol className="m-0 list-none p-0">
              {column.steps.map((step) => (
                <li
                  className={cn(
                    'grid grid-cols-[26px_minmax(0,1fr)] items-start gap-ml border-b py-m last:border-b-0',
                    alt ? 'border-border-on-accent' : 'border-border-default',
                  )}
                  key={step.number}
                >
                  <b
                    className={cn(
                      'pt-4xs text-label font-black',
                      alt ? 'text-text-on-accent' : 'text-text-action',
                    )}
                  >
                    {step.number}
                  </b>
                  <span className="text-body leading-normal">{step.detail}</span>
                </li>
              ))}
            </ol>
          </article>
        );
      })}
    </div>
  );
}

function PortfolioFeature({ config }: { config: PortfolioCaseStudyConfig['feature'] }) {
  return (
    <section className="bg-surface-dark py-section text-text-on-dark" id="operations">
      <div className="site-shell">
        <div className="mb-2xl grid grid-cols-[minmax(0,1fr)] gap-xl lg:mb-3xl lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-2xl xl:gap-section">
          <div>
            {/* Brighter than the shared on-dark number: this band is the
                darkest surface on the page. */}
            <SectionNumber
              className="text-[color-mix(in_srgb,var(--surface-page)_72%,transparent)]"
              onDark
            >
              {config.eyebrow}
            </SectionNumber>
            <h2 className={caseHeadingClassName}>
              <HeadingLines heading={config.title} />
            </h2>
          </div>
          <p className="m-0 max-w-[540px] self-end text-lead leading-[1.72] text-[color-mix(in_srgb,var(--surface-page)_78%,transparent)]">
            {config.description}
          </p>
        </div>
        {config.variant === 'operations' ? (
          <OperationsConsole config={config.console} />
        ) : (
          <DualSteps columns={config.columns} />
        )}
      </div>
    </section>
  );
}

function PortfolioMediaFeature({ config }: { config: MediaFeature }) {
  return (
    <section className={config.tinted ? 'bg-surface-tint py-section' : 'section'}>
      <div className="site-shell grid grid-cols-[minmax(0,1fr)] items-center gap-2xl lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-3xl">
        {/* Reversed bands put the copy second from lg; on a phone it always
            leads, so the order swap is a breakpoint away. */}
        <div className={cn(config.reverse && 'lg:order-2')}>
          <SectionNumber>{config.eyebrow}</SectionNumber>
          <h2 className="m-0 text-display leading-[1] tracking-[-0.062em]">{config.title}</h2>
          <p className={cn(caseLeadClassName, 'my-xl max-w-copy')}>{config.description}</p>
          <div className="grid grid-cols-[minmax(0,1fr)] border-t border-border-default sm:grid-cols-2 [&>span]:border-b [&>span]:border-border-default [&>span]:py-s [&>span]:text-label [&>span]:font-heavy [&>span]:text-text-muted">
            {config.points.map((point) => (
              <span key={point}>{point}</span>
            ))}
          </div>
          <PortfolioEnquiryCta />
        </div>
        <div>
          <BrowserFrame image={config.image} browserUrl={config.browserUrl} />
        </div>
      </div>
    </section>
  );
}

function PortfolioIntent({ config }: { config: IntentSection }) {
  return (
    <section className="bg-surface-tint py-section" id="search-structure">
      <div className="site-shell">
        <div className="mb-2xl grid grid-cols-[minmax(0,1fr)] items-start gap-xl lg:mb-3xl lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-2xl xl:gap-section">
          <div>
            <SectionNumber>{config.eyebrow}</SectionNumber>
            <h2 className="m-0 text-hero leading-[0.95] tracking-[-0.068em]">
              <HeadingLines heading={config.title} />
            </h2>
          </div>
          <p className={cn(caseLeadClassName, 'm-0 max-w-[530px]')}>{config.description}</p>
        </div>
        {/* One column on a phone, two from lg, four from xl. The outer rules
            come from the grid's own top and left borders; every cell draws its
            own right and bottom so they never double up. */}
        <div className="grid grid-cols-[minmax(0,1fr)] border-t border-l border-border-strong lg:grid-cols-2 xl:grid-cols-4">
          {config.groups.map((group) => (
            <article
              className="flex flex-col border-r border-b border-border-strong px-l py-xl lg:min-h-[420px] xl:min-h-[460px]"
              key={group.number}
            >
              <header className="lg:min-h-[118px]">
                <span className="mb-ml block text-label font-black text-text-action lg:mb-xl">
                  {group.number}
                </span>
                <h3 className="m-0 text-lead tracking-[-0.035em]">{group.title}</h3>
              </header>
              {/* Pinned to the bottom of the card from lg, where the cards
                  share a height and the headers are padded to match. */}
              <ul className="mx-0 mt-xl mb-0 list-none p-0 lg:mt-auto">
                {group.pages.map((page) => (
                  <li
                    className="flex items-center justify-between border-t border-border-default py-s text-label font-strong leading-[1.35] text-text-muted"
                    key={page}
                  >
                    {page}
                    <span className="ml-xs text-label text-text-action">↗</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <PortfolioEnquiryCta />
      </div>
    </section>
  );
}

function PortfolioEnding({ config }: { config: Pick<PortfolioCaseStudyConfig, 'seo' | 'faq'> }) {
  return (
    <>
      <SeoReportOverview
        id="seo-growth"
        eyebrow={config.seo.eyebrow}
        title={config.seo.title}
        accentTitle={config.seo.accentTitle}
        description={
          <>
            <p>{config.seo.description}</p>
            <PortfolioEnquiryCta />
          </>
        }
      />
      <ProjectEnquiry id="enquiry" />
      <FaqSection
        emitSchema
        eyebrow={config.faq.eyebrow}
        title="Website project questions."
        items={config.faq.items}
      />
      <ManualAdminCta href="#enquiry" buttonLabel="See our options" />
    </>
  );
}

/** Derives the "01 / ..." eyebrow numbers from section order. */
function withSectionNumbers(config: PortfolioCaseStudyConfig): PortfolioCaseStudyConfig {
  const mediaFeatures = config.mediaFeatures ?? [];
  const numbered = numberSections([
    config.intro.eyebrow,
    config.tour.eyebrow,
    config.mobile.eyebrow,
    config.feature.eyebrow,
    ...mediaFeatures.map((feature) => feature.eyebrow),
    config.intent.eyebrow,
    config.seo.eyebrow,
    config.faq.eyebrow,
  ]);

  return {
    ...config,
    intro: { ...config.intro, eyebrow: numbered[config.intro.eyebrow] },
    tour: { ...config.tour, eyebrow: numbered[config.tour.eyebrow] },
    mobile: { ...config.mobile, eyebrow: numbered[config.mobile.eyebrow] },
    feature: { ...config.feature, eyebrow: numbered[config.feature.eyebrow] },
    mediaFeatures: mediaFeatures.map((feature) => ({
      ...feature,
      eyebrow: numbered[feature.eyebrow],
    })),
    intent: { ...config.intent, eyebrow: numbered[config.intent.eyebrow] },
    seo: { ...config.seo, eyebrow: numbered[config.seo.eyebrow] },
    faq: { ...config.faq, eyebrow: numbered[config.faq.eyebrow] },
  };
}

export function PortfolioCaseStudy({ config: rawConfig }: { config: PortfolioCaseStudyConfig }) {
  const config = withSectionNumbers(rawConfig);

  return (
    <main className="case-page">
      <PageSchema path={config.path} />
      <PortfolioHero config={config.hero} />
      <ProcessBar label={config.process.label} steps={config.process.steps} />

      <Breadcrumbs path={config.path} />
      <PortfolioIntro config={config.intro} />
      <ProofStrip id={config.proof.id} stats={config.proof.stats} />
      <PortfolioTourSection config={config.tour} />
      <PortfolioMobileStory config={config.mobile} />
      <PortfolioFeature config={config.feature} />
      {config.mediaFeatures?.map((feature) => (
        <PortfolioMediaFeature config={feature} key={feature.eyebrow} />
      ))}
      <PortfolioIntent config={config.intent} />
      <PortfolioEnding config={config} />
    </main>
  );
}
