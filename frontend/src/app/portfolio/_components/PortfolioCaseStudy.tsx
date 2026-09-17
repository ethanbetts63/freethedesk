import Image from 'next/image';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Fragment } from 'react';

import { Eyebrow } from '@/components/Eyebrow';
import { Faq, type FaqItem } from '@/components/Faq';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { PageSchema } from '@/components/PageSchema';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProcessBar, type ProcessBarStep } from '@/components/ProcessBar';
import { ProofStrip, type ProofStat } from '@/components/ProofStrip';
import { ScrollCtaButton } from '@/components/ScrollCtaButton';
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
 * sharing one rule in `case-study.css`, which is exactly the shape that has to
 * become a named constant rather than a descendant selector.
 */
const caseHeadingClassName = 'm-0 text-display-4 leading-[0.96] tracking-[-0.067em]';

/**
 * The hero's pair of calls to action. Was the last consumer of the global
 * `.button-row` that Phase 3 removed everywhere else.
 */
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
          <Eyebrow>{config.eyebrow}</Eyebrow>
          <h1 className="m-0 text-display-3 font-heavy leading-[0.91] tracking-[-0.078em] lg:text-display-5 [&_span]:text-text-action">
            <HeadingLines heading={config.title} />
          </h1>
          <p className="my-xl max-w-[555px] text-step-0 leading-[1.65] text-text-muted">
            {config.description}
          </p>
          <div className={caseButtonRowClassName}>
            <PrimaryButton href={config.liveHref} target="_blank" rel="noreferrer">
              Visit the live website
            </PrimaryButton>
            <ScrollCtaButton
              targetId="tour"
              className="cursor-pointer appearance-none border-0 border-b border-b-text-primary bg-transparent pt-3xs pb-2xs font-[inherit] text-body font-heavy text-inherit [&>span]:ml-xs"
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
        <div className="relative m-0 pt-l pr-0 pb-2xl pl-s sm:pl-xl lg:mr-[-190px] lg:pt-xl lg:pl-2xl xl:mr-[-105px]">
          <BrowserFrame image={config.desktopImage} browserUrl={config.browserUrl} hero />
          <div className={`case-phone${config.mobileImage.className ? ' case-phone-crop' : ''}`}>
            <div className="case-phone-speaker" />
            <div className="case-phone-menu" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <Image
              className={config.mobileImage.className}
              src={config.mobileImage.src}
              alt={config.mobileImage.alt}
              width={config.mobileImage.width}
              height={config.mobileImage.height}
              priority
            />
          </div>
          <div className="case-live-note">
            <i /> {config.liveLabel}
          </div>
        </div>
      </div>
    </section>
  );
}

function PortfolioIntro({ config }: { config: PortfolioCaseStudyConfig['intro'] }) {
  return (
    <section
      className="section site-shell grid grid-cols-[minmax(0,1fr)] gap-xl py-[78px] lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1.58fr)] lg:gap-section lg:py-[112px]"
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
            className="my-xl max-w-[720px] text-step-0 leading-[1.72] text-text-muted"
          >
            {paragraph}
          </p>
        ))}
        {/* One row per capability on a phone, two from sm, four from lg. The
            dot is a ::before so the text can wrap under itself. */}
        <div className="grid grid-cols-[minmax(0,1fr)] border-t border-border-default sm:grid-cols-2 lg:grid-cols-4 [&>span]:relative [&>span]:border-b [&>span]:border-border-default [&>span]:py-m [&>span]:pr-xs [&>span]:pl-ml [&>span]:text-small [&>span]:font-strong [&>span]:text-text-muted [&>span]:before:absolute [&>span]:before:top-[21px] [&>span]:before:left-[2px] [&>span]:before:h-[5px] [&>span]:before:w-[5px] [&>span]:before:rounded-[var(--radius-circle)] [&>span]:before:bg-action-primary [&>span]:before:content-['']">
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
    <section className="case-tour-section" id="tour">
      <div className="site-shell">
        <div className="case-section-heading">
          <SectionNumber>{config.eyebrow}</SectionNumber>
          <h2>
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
    <section className="case-mobile-story">
      <div className="site-shell case-mobile-story-grid">
        <div className="case-mobile-copy">
          <SectionNumber>{config.eyebrow}</SectionNumber>
          <h2>{config.title}</h2>
          <p>{config.description}</p>
          <div className="case-mobile-stat">
            <strong className="moving-colour-text">{config.stat.value}</strong>
            <span>
              <b>{config.stat.label}</b>
              <small>{config.stat.description}</small>
            </span>
          </div>
          <PortfolioEnquiryCta />
        </div>
        <div className="case-mobile-stage">
          <div className="case-mobile-phone">
            <span />
            <div className="case-phone-menu" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <Image
              className={config.image.className}
              src={config.image.src}
              alt={config.image.alt}
              width={config.image.width}
              height={config.image.height}
            />
          </div>
          <div className="case-mobile-callout case-mobile-callout-one">
            <b>01</b>
            <span>{config.callout}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function OperationsConsole({ config }: { config: OperationsFeature['console'] }) {
  return (
    <div className="case-ops-console">
      <aside>
        <strong>{config.workspace}</strong>
        {config.navigation.map((item) => (
          <span className={item === config.activeNavigation ? 'active' : undefined} key={item}>
            {item} {item === config.activeNavigation && <b>{config.activeCount}</b>}
          </span>
        ))}
      </aside>
      <div className="case-ops-main">
        <div className="case-ops-topline">
          <div>
            <small>{config.timestamp}</small>
            <h3>{config.title}</h3>
          </div>
          <span>
            {config.status} <i />
          </span>
        </div>
        <div className="case-ops-list">
          {config.items.map((item) => (
            <article key={item.number}>
              <span>{item.number}</span>
              <div>
                <h4>{item.title}</h4>
                <p>{item.detail}</p>
              </div>
              <b>Open →</b>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function DualSteps({ columns }: { columns: DualStepsFeature['columns'] }) {
  return (
    <div className="case-steps-pair">
      {columns.map((column, index) => (
        <article
          className={`case-steps-column${index % 2 ? ' case-steps-column-alt' : ''}`}
          key={column.label}
        >
          <header>
            <small>{column.label}</small>
            <h3>{column.title}</h3>
            <p>{column.description}</p>
          </header>
          <ol>
            {column.steps.map((step) => (
              <li key={step.number}>
                <b>{step.number}</b>
                <span>{step.detail}</span>
              </li>
            ))}
          </ol>
        </article>
      ))}
    </div>
  );
}

function PortfolioFeature({ config }: { config: PortfolioCaseStudyConfig['feature'] }) {
  return (
    <section className="case-operations-section" id="operations">
      <div className="site-shell">
        <div className="case-operations-heading">
          <div>
            <SectionNumber onDark>{config.eyebrow}</SectionNumber>
            <h2>
              <HeadingLines heading={config.title} />
            </h2>
          </div>
          <p>{config.description}</p>
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
    <section className={config.tinted ? 'case-tinted-section' : 'section'}>
      <div className={`site-shell case-split${config.reverse ? ' case-split-reverse' : ''}`}>
        <div className="case-split-copy">
          <SectionNumber>{config.eyebrow}</SectionNumber>
          <h2>{config.title}</h2>
          <p>{config.description}</p>
          <div className="case-split-points">
            {config.points.map((point) => (
              <span key={point}>{point}</span>
            ))}
          </div>
          <PortfolioEnquiryCta />
        </div>
        <div className="case-split-media">
          <BrowserFrame image={config.image} browserUrl={config.browserUrl} />
        </div>
      </div>
    </section>
  );
}

function PortfolioIntent({ config }: { config: IntentSection }) {
  return (
    <section className="case-intent-section" id="search-structure">
      <div className="site-shell">
        <div className="case-intent-heading">
          <div>
            <SectionNumber>{config.eyebrow}</SectionNumber>
            <h2>
              <HeadingLines heading={config.title} />
            </h2>
          </div>
          <p>{config.description}</p>
        </div>
        <div className="case-intent-grid">
          {config.groups.map((group) => (
            <article key={group.number}>
              <header>
                <span>{group.number}</span>
                <h3>{group.title}</h3>
              </header>
              <ul>
                {group.pages.map((page) => (
                  <li key={page}>
                    {page}
                    <span>↗</span>
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
      <Faq
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
