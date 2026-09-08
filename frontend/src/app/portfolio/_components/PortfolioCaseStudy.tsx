import Image from "next/image";
import { Fragment } from "react";

import { Faq, type FaqItem } from "@/components/Faq";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { PageSchema } from "@/components/PageSchema";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { SeoReportOverview } from "@/components/SeoReportOverview";
import { ProjectEnquiry } from "@/components/marketing/ProjectEnquiry";
import type { PagePath } from "@/lib/pages";

import { PortfolioEnquiryCta } from "./PortfolioEnquiryCta";
import { PortfolioTour, type PortfolioTourItem } from "./PortfolioTour";

type LineHeading = {
  lines: readonly string[];
  accentLine?: number;
};

type PortfolioImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
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
  variant: "operations";
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
  variant: "dual-steps";
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

function BrowserFrame({
  image,
  browserUrl,
  hero = false,
}: {
  image: PortfolioImage;
  browserUrl: string;
  hero?: boolean;
}) {
  return (
    <div className={`case-browser${hero ? " case-browser-hero" : ""}`}>
      <div className="case-browser-bar">
        <i />
        <i />
        <i />
        <span>{browserUrl}</span>
      </div>
      <Image
        className={image.className}
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        priority={hero}
      />
    </div>
  );
}

function PortfolioHero({ config }: { config: PortfolioCaseStudyConfig["hero"] }) {
  return (
    <section className="case-hero">
      <div className="case-hero-grid" aria-hidden="true" />
      <div className="shell case-hero-layout">
        <div className="case-hero-copy">
          <p className="eyebrow">
            <span />
            {config.eyebrow}
          </p>
          <h1>
            <HeadingLines heading={config.title} />
          </h1>
          <p>{config.description}</p>
          <div className="button-row">
            <PrimaryButton href={config.liveHref} target="_blank" rel="noreferrer">
              Visit the live website
            </PrimaryButton>
            <a className="text-link" href="#tour">
              Explore the build <span>↓</span>
            </a>
          </div>
          <div className="case-hero-meta">
            {config.capabilities.map((capability) => (
              <span key={capability}>{capability}</span>
            ))}
          </div>
        </div>

        <div className="case-hero-media">
          <BrowserFrame image={config.desktopImage} browserUrl={config.browserUrl} hero />
          <div className={`case-phone${config.mobileImage.className ? " case-phone-crop" : ""}`}>
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

function PortfolioIntro({ config }: { config: PortfolioCaseStudyConfig["intro"] }) {
  return (
    <section className="section shell case-story-intro">
      <p className="section-number">{config.eyebrow}</p>
      <div>
        <h2>
          <HeadingLines heading={config.title} />
        </h2>
        {config.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <div className="case-capability-list">
          {config.capabilities.map((capability) => (
            <span key={capability}>{capability}</span>
          ))}
        </div>
        {config.showCta !== false && <PortfolioEnquiryCta />}
      </div>
    </section>
  );
}

function PortfolioTourSection({ config }: { config: PortfolioCaseStudyConfig["tour"] }) {
  return (
    <section className="case-tour-section" id="tour">
      <div className="shell">
        <div className="case-section-heading">
          <p className="section-number">{config.eyebrow}</p>
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
      <div className="shell case-mobile-story-grid">
        <div className="case-mobile-copy">
          <p className="section-number">{config.eyebrow}</p>
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

function OperationsConsole({ config }: { config: OperationsFeature["console"] }) {
  return (
    <div className="case-ops-console">
      <aside>
        <strong>{config.workspace}</strong>
        {config.navigation.map((item) => (
          <span className={item === config.activeNavigation ? "active" : undefined} key={item}>
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

function DualSteps({ columns }: { columns: DualStepsFeature["columns"] }) {
  return (
    <div className="bloom-sides">
      {columns.map((column, index) => (
        <article className={`bloom-side${index % 2 ? " bloom-side-alt" : ""}`} key={column.label}>
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

function PortfolioFeature({ config }: { config: PortfolioCaseStudyConfig["feature"] }) {
  return (
    <section className="case-operations-section">
      <div className="shell">
        <div className="case-operations-heading">
          <div>
            <p className="section-number section-number-light">{config.eyebrow}</p>
            <h2>
              <HeadingLines heading={config.title} />
            </h2>
          </div>
          <p>{config.description}</p>
        </div>
        {config.variant === "operations" ? (
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
    <section className={config.tinted ? "bloom-seo-section" : "section"}>
      <div className={`shell bloom-split${config.reverse ? " bloom-split-reverse" : ""}`}>
        <div className="bloom-split-copy">
          <p className="section-number">{config.eyebrow}</p>
          <h2>{config.title}</h2>
          <p>{config.description}</p>
          <div className="bloom-split-points">
            {config.points.map((point) => (
              <span key={point}>{point}</span>
            ))}
          </div>
          <PortfolioEnquiryCta />
        </div>
        <div className="bloom-split-media">
          <BrowserFrame image={config.image} browserUrl={config.browserUrl} />
        </div>
      </div>
    </section>
  );
}

function PortfolioIntent({ config }: { config: IntentSection }) {
  return (
    <section className="case-intent-section">
      <div className="shell">
        <div className="case-intent-heading">
          <div>
            <p className="section-number">{config.eyebrow}</p>
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

function PortfolioEnding({ config }: { config: Pick<PortfolioCaseStudyConfig, "seo" | "faq"> }) {
  return (
    <>
      <SeoReportOverview
        eyebrow={<>{config.seo.eyebrow}</>}
        title={config.seo.title}
        accentTitle={config.seo.accentTitle}
        showSequence={false}
        description={
          <>
            <p>{config.seo.description}</p>
            <PortfolioEnquiryCta />
          </>
        }
      />
      <ProjectEnquiry id="enquiry" />
      <Faq eyebrow={config.faq.eyebrow} title="Before we start." items={config.faq.items} />
      <ManualAdminCta href="#enquiry" label="See our options" />
    </>
  );
}

export function PortfolioCaseStudy({ config }: { config: PortfolioCaseStudyConfig }) {
  return (
    <main className="case-page">
      <PageSchema path={config.path} />
      <PortfolioHero config={config.hero} />
      <ProofStrip id={config.proof.id} stats={config.proof.stats} />
      <PortfolioIntro config={config.intro} />
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
