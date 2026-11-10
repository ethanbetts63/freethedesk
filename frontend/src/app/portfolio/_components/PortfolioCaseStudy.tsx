import Image from 'next/image';
import { Breadcrumbs } from '@/components/Breadcrumbs';

import { FaqSection } from '@/components/marketing/FaqSection';
import { RelatedPages } from '@/components/marketing/RelatedPages';
import type { FaqItem } from '@/types/FaqItem';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { PageSchema } from '@/components/PageSchema';
import { CtaButton } from '@/components/CtaButton';
import { SectionHeader } from '@/components/SectionHeader';
import { SectionNumber } from '@/components/SectionNumber';
import { SeoReportVisual } from '@/components/SeoReportVisual';
import { Introduction } from '@/components/marketing/Introduction';
import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { ProjectEnquiry } from '@/components/marketing/ProjectEnquiry';
import type { PagePath } from '@/lib/pages';
import { numberSections } from '@/lib/sectionNumbers';

import { BrowserFrame, type PortfolioImage } from './BrowserFrame';
import {
  HeadingLines,
  caseHeadingClassName,
  caseLeadClassName,
  caseSectionHeadingClassName,
  type LineHeading,
} from './caseHeading';
import { PortfolioEnquiryCta } from './PortfolioEnquiryCta';
import { PortfolioTour, type PortfolioTourItem } from './PortfolioTour';
import { SpeedCheckForm } from './SpeedCheckForm';
import { heroGridClassName } from '@/lib/gridSurface';
import { cn } from '@/lib/utils';
import { PhoneFrame } from '@/components/visuals/PhoneFrame';
import { SiteShot } from '@/components/visuals/SiteShot';

type TourSection = {
  eyebrow: string;
  title: LineHeading;
  label: string;
  browserUrl: string;
  items: readonly PortfolioTourItem[];
};

type MobileStory = {
  eyebrow: string;
  title: string;
  description: string;
  image: PortfolioImage;
};

type SectionHeading = {
  eyebrow: string;
  title: LineHeading;
  description?: string;
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
    /** A portrait of this side's person, drawn as the guides' pictures are. */
    portrait: PortfolioImage;
    steps: readonly { number: string; detail: string }[];
  }[];
};

type IntentSection = SectionHeading;

/** The organic growth figure beside the report drawing, with the call to action its reader wants. */
type GrowthSection = {
  eyebrow: string;
  title: string;
  accentTitle: string;
  description: string;
  /** `report` sends an SEO reader to the report page; `enquiry` a website reader down to the form. */
  action: 'report' | 'enquiry';
};

/**
 * One decision: a few lines of text on one side and the site's own screen on
 * the other, the sides alternating down the page (owner, 2026-11-06).
 */
type SplitSection = {
  eyebrow: string;
  title: string;
  accentTitle: string;
  description: string;
  /** A reading or two under the words, as the reports' cover shows its figures. */
  figures?: readonly { value: string; label: string }[];
  image: PortfolioImage;
  /** Set when the picture is a page of the site, which then sits in a browser frame. */
  browserUrl?: string;
  /** `above` stacks the words over a picture too wide to share a row with them. */
  textSide: 'left' | 'right' | 'above';
  background: 'white' | 'tint';
  /** The visitor's own site into PageSpeed, under the words. */
  speedCheck?: boolean;
};

/** The centred "How it works" opening the SEO page has, before the sections; it takes no number. */
type IntroSection = {
  eyebrow: string;
  title: string;
  accentTitle: string;
  description: string;
};

/**
 * The page's body is an ordered list of sections, numbered in that order, so
 * a case study chooses which to tell and in what order: the dealership tells
 * three measured decisions and the marketplace tells a tour.
 */
export type CaseSection =
  | ({ kind: 'tour' } & TourSection)
  | ({ kind: 'mobile' } & MobileStory)
  | ({ kind: 'feature' } & (OperationsFeature | DualStepsFeature))
  | ({ kind: 'intent' } & IntentSection)
  | ({ kind: 'growth' } & GrowthSection)
  | ({ kind: 'intro' } & IntroSection)
  | ({ kind: 'split' } & SplitSection);

export type PortfolioCaseStudyConfig = {
  path: PagePath;
  hero: {
    /** The h1, naming the client and what was built: the case study's own search words. */
    title: LineHeading;
    description: string;
    liveHref: string;
    browserUrl: string;
    desktopImage: PortfolioImage;
    mobileImage: PortfolioImage;
  };
  sections: readonly CaseSection[];
  faq: {
    eyebrow: string;
    items: FaqItem[];
  };
};

const caseButtonRowClassName =
  'flex flex-col flex-wrap items-start gap-l sm:flex-row sm:items-center';

function PortfolioHero({
  config,
  path,
}: {
  config: PortfolioCaseStudyConfig['hero'];
  path: PortfolioCaseStudyConfig['path'];
}) {
  return (
    <section className="relative min-h-auto overflow-hidden pt-3xl pb-xl lg:min-h-[720px]">
      {/* Top right in the hero, as every page with a hero places its trail. */}
      <Breadcrumbs path={path} variant="overlay" />
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
          <h1 className="m-0 text-display font-heavy leading-[0.91] tracking-[-0.078em] [&_span]:text-text-action">
            <HeadingLines heading={config.title} />
          </h1>
          <p className="my-xl max-w-[555px] text-lead leading-relaxed text-text-muted">
            {config.description}
          </p>
          <div className={caseButtonRowClassName}>
            <CtaButton href={config.liveHref} target="_blank" rel="noreferrer">
              Visit the live website
            </CtaButton>
          </div>
        </div>

        {/* Exactly the phone's overhang under the shot, no more, so the section
            after the hero sits close (owner, 2026-11-06); the shot itself keeps
            to the shell, as the sample report's cover does. */}
        <div className="relative pt-l pb-xl sm:pb-2xl lg:pt-xl">
          <SiteShot
            url={config.browserUrl}
            desktop={
              <Image
                className={config.desktopImage.className}
                src={config.desktopImage.src}
                alt={config.desktopImage.alt}
                width={config.desktopImage.width}
                height={config.desktopImage.height}
                priority
              />
            }
            phone={
              <Image
                className={config.mobileImage.className}
                src={config.mobileImage.src}
                alt={config.mobileImage.alt}
                width={config.mobileImage.width}
                height={config.mobileImage.height}
                priority
              />
            }
          />
        </div>
      </div>
    </section>
  );
}

function PortfolioTourSection({ config }: { config: TourSection }) {
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
          <PortfolioEnquiryCta />
        </div>
        {/* Graph paper at its own scale: this is a stage for a drawn object,
            not a page surface, so the 46px grid is literal. */}
        <div className="relative flex min-h-[550px] items-center justify-center overflow-hidden bg-surface-dark [background-image:linear-gradient(var(--tint-grid-on-dark-strong)_1px,transparent_1px),linear-gradient(90deg,var(--tint-grid-on-dark-strong)_1px,transparent_1px)] [background-size:46px_46px] lg:min-h-[620px]">
          <PhoneFrame size="standalone">
            <Image
              className={config.image.className}
              src={config.image.src}
              alt={config.image.alt}
              width={config.image.width}
              height={config.image.height}
            />
          </PhoneFrame>
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
            {/* The person beside the words: a portrait in the guides' style, so
                the two sides are two faces rather than two paragraphs
                (owner, 2026-11-06). */}
            <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-l border-b border-border-default pb-l">
              <div>
                <small
                  className={cn(
                    'mb-s block text-label font-black tracking-label uppercase',
                    alt ? 'text-text-primary' : 'text-text-action',
                  )}
                >
                  {column.label}
                </small>
                <h3 className="m-0 text-display tracking-[-0.06em]">{column.title}</h3>
              </div>
              <Image
                className="w-[110px] rounded-md border border-border-default sm:w-[140px]"
                src={column.portrait.src}
                alt={column.portrait.alt}
                width={column.portrait.width}
                height={column.portrait.height}
              />
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

function PortfolioFeature({ config }: { config: OperationsFeature | DualStepsFeature }) {
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
          {config.description && (
            <p className="m-0 max-w-[540px] self-end text-lead leading-[1.72] text-[color-mix(in_srgb,var(--surface-page)_78%,transparent)]">
              {config.description}
            </p>
          )}
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

function PortfolioIntent({ config }: { config: IntentSection }) {
  return (
    <section className="bg-surface-tint py-section" id="search-structure">
      <div className="site-shell grid grid-cols-[minmax(0,1fr)] items-center gap-2xl lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:gap-3xl">
        <div>
          <SectionNumber>{config.eyebrow}</SectionNumber>
          <h2 className="m-0 text-hero leading-[0.95] tracking-[-0.068em]">
            <HeadingLines heading={config.title} />
          </h2>
          <p className={cn(caseLeadClassName, 'my-xl max-w-[520px]')}>{config.description}</p>
          <PortfolioEnquiryCta />
        </div>
        {/* The guide's picture of a search, in place of the lists of pages
            (owner, 2026-11-06), framed as the guides frame theirs. */}
        <Image
          src="/images/guides/business-not-showing-up-on-google.webp"
          alt=""
          width={1536}
          height={1024}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="aspect-[3/2] h-auto w-full rounded-lg border border-border-default object-cover"
        />
      </div>
    </section>
  );
}

function PortfolioGrowth({ config }: { config: GrowthSection }) {
  return (
    <SplitFeatureSection
      id="seo-growth"
      eyebrow={config.eyebrow}
      title={config.title}
      accentTitle={config.accentTitle}
      // The report drawing at four-fifths of its column: smaller than the
      // SEO page draws it (owner, 2026-11-06).
      visual={
        <div className="mx-auto max-w-[520px]">
          <SeoReportVisual mode="report" />
        </div>
      }
      spacing="compact"
      description={
        <>
          <p>{config.description}</p>
          {config.action === 'report' ? (
            <CtaButton className="mt-xl" href="/seo">
              See the SEO report
            </CtaButton>
          ) : (
            <PortfolioEnquiryCta />
          )}
        </>
      }
    />
  );
}

/** The paragraph and, under it, the readings: the figure heavy and black, the label in the accent beneath. */
function SplitWords({ config }: { config: SplitSection }) {
  return (
    <>
      <p>{config.description}</p>
      {config.figures && (
        <ul className="m-0 mt-l grid list-none grid-cols-2 gap-l p-0">
          {config.figures.map((figure) => (
            <li key={figure.label}>
              <strong className="block text-title font-heavy tracking-[-0.04em] whitespace-nowrap text-text-primary tabular-nums">
                {figure.value}
              </strong>
              <span className="mt-2xs block text-label font-heavy tracking-label text-text-action uppercase">
                {figure.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function SplitVisual({ config, sizes }: { config: SplitSection; sizes: string }) {
  return config.browserUrl ? (
    <BrowserFrame image={config.image} browserUrl={config.browserUrl} />
  ) : (
    <Image
      className={cn(
        'h-auto w-full rounded-md border border-border-default',
        config.image.className,
      )}
      src={config.image.src}
      alt={config.image.alt}
      width={config.image.width}
      height={config.image.height}
      sizes={sizes}
    />
  );
}

function PortfolioSplit({ config }: { config: SplitSection }) {
  if (config.textSide === 'above') {
    return (
      <section
        className={cn(
          'text-text-secondary',
          config.background === 'tint' ? 'bg-surface-tint' : 'bg-surface-page',
        )}
      >
        <div className="site-shell py-section text-center">
          <SectionHeader
            eyebrow={config.eyebrow}
            title={config.title}
            accentTitle={config.accentTitle}
            size="display-sm"
            titleBreak="always"
          />
          <div className="mx-auto mt-ml max-w-[62ch] text-lead leading-[1.74] text-text-muted [&>:first-child]:mt-0 [&>:last-child]:mb-0">
            <SplitWords config={config} />
          </div>
          {config.speedCheck && (
            <div className="mx-auto mt-l max-w-[560px] text-left">
              <SpeedCheckForm />
            </div>
          )}
          <div className="mt-2xl">
            <SplitVisual config={config} sizes="(min-width: 1280px) 1200px, 100vw" />
          </div>
        </div>
      </section>
    );
  }
  return (
    <SplitFeatureSection
      eyebrow={config.eyebrow}
      title={config.title}
      accentTitle={config.accentTitle}
      description={<SplitWords config={config} />}
      action={config.speedCheck ? <SpeedCheckForm /> : undefined}
      visual={<SplitVisual config={config} sizes="(min-width: 1024px) 55vw, 100vw" />}
      textSide={config.textSide}
      background={config.background}
    />
  );
}

function PortfolioIntro({ config }: { config: IntroSection }) {
  return (
    <Introduction
      eyebrow={config.eyebrow}
      title={config.title}
      accentTitle={config.accentTitle}
      measure="wide"
      spacing="tight"
    >
      {config.description}
    </Introduction>
  );
}

function CaseSectionView({ section }: { section: CaseSection }) {
  switch (section.kind) {
    case 'tour':
      return <PortfolioTourSection config={section} />;
    case 'mobile':
      return <PortfolioMobileStory config={section} />;
    case 'feature':
      return <PortfolioFeature config={section} />;
    case 'intent':
      return <PortfolioIntent config={section} />;
    case 'growth':
      return <PortfolioGrowth config={section} />;
    case 'intro':
      return <PortfolioIntro config={section} />;
    case 'split':
      return <PortfolioSplit config={section} />;
  }
}

/** Derives the "01 / ..." eyebrow numbers from section order; an intro is a preface and takes none. */
function withSectionNumbers(config: PortfolioCaseStudyConfig): PortfolioCaseStudyConfig {
  const counted = config.sections.filter((s) => s.kind !== 'intro');
  const numbered = numberSections([...counted.map((s) => s.eyebrow), config.faq.eyebrow]);

  return {
    ...config,
    sections: config.sections.map((section) =>
      section.kind === 'intro' ? section : { ...section, eyebrow: numbered[section.eyebrow] },
    ),
    faq: { ...config.faq, eyebrow: numbered[config.faq.eyebrow] },
  };
}

export function PortfolioCaseStudy({ config: rawConfig }: { config: PortfolioCaseStudyConfig }) {
  const config = withSectionNumbers(rawConfig);

  return (
    <main className="case-page">
      <PageSchema path={config.path} />
      <PortfolioHero config={config.hero} path={config.path} />

      {config.sections.map((section) => (
        <CaseSectionView section={section} key={section.eyebrow} />
      ))}
      <ProjectEnquiry id="enquiry" />
      <FaqSection
        emitSchema
        eyebrow={config.faq.eyebrow}
        title="Website project questions."
        items={config.faq.items}
      />
      <ManualAdminCta href="#enquiry" buttonLabel="Get a price for yours" />
      <RelatedPages path={config.path} />
    </main>
  );
}
