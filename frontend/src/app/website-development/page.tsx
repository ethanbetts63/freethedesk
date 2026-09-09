import type { Metadata } from "next";

import { SectionNumber } from "@/components/SectionNumber";
import { AiReadinessBanner } from "@/components/marketing/AiReadinessBanner";
import { AutomationMeaning } from "@/components/marketing/AutomationMeaning";
import { Hero } from "@/components/marketing/Hero";
import { ProjectEnquiry } from "@/components/marketing/ProjectEnquiry";
import { SubscriptionSwap } from "@/components/marketing/SubscriptionSwap";
import { Faq } from "@/components/Faq";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { CaseStudyTeaser } from "@/components/marketing/CaseStudyTeaser";
import { PageSchema } from "@/components/PageSchema";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { SeoReportOverview } from "@/components/SeoReportOverview";
import { ServiceScroll } from "@/components/ServiceScroll";
import { metadataFor } from "@/lib/pages";
import { numberSections } from "@/lib/sectionNumbers";

import { WEBSITE_DEV_FAQS } from "./_lib/copy";
import { websiteServices } from "./_components/websiteServices";
import styles from "./page.module.css";

const websiteDevStats: ProofStat[] = [
  { value: "36%", label: "Of the work week", description: "Time small business owners lose to manual admin tasks." },
  {
    value: "4",
    label: "Stages, every project",
    description: "Understand, design, build, improve—the same process each time.",
  },
  {
    value: "AI",
    label: "Are you AI ready?",
    description: "We check four practical foundations for AI and agentic browsing.",
  },
];

/* Section eyebrows in page order. */
const sections = numberSections([
  "Conversion funnels",
  "What automation means",
  "What you're paying for",
  "What we build",
  "SEO after launch",
  "Proof this works",
  "Common questions",
] as const);

export const metadata: Metadata = metadataFor("/website-development");

const casePoints = ["Indexable stock", "Intent-focused pages", "Structured data", "Measured in Search Console"];

export default function WebsiteDevelopmentPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Website Development Perth",
    serviceType: "Website development and web application development",
    areaServed: { "@type": "City", name: "Perth" },
    provider: { "@type": "Organization", name: "Free the Desk", url: "https://freethedesk.com.au" },
  };

  return (
    <main className={styles.page}>
      <PageSchema path="/website-development" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <AiReadinessBanner />
      <Hero
        eyebrow="Website development Perth"
        titleLines={["Websites should"]}
        accentTitle="work harder."
        lead="Custom websites that convert users and automate the repetitive work behind your business."
        primaryHref="#enquiry"
        primaryLabel="Discuss your website"
        secondaryHref="/portfolio/scooter-shop"
        secondaryLabel="See what we build"
        stages={["Understand", "Design", "Build", "Improve"]}
      />

      <ProofStrip stats={websiteDevStats} />

      <section className={`shell ${styles.systemSection}`}>
        <div className={styles.systemVisual} aria-hidden="true">
          <div className={styles.browser}>
            <i />
            <i />
            <i />
            <span>customer journey</span>
          </div>
          <div className={styles.funnelBody}>
            <div className={styles.funnelStart}>
              <span>Point A</span>
              <strong>Interested visitor</strong>
              <small>Intent captured</small>
            </div>
            <ol className={styles.funnelSteps}>
              <li>
                <span>01</span>
                <strong>Find the path</strong>
                <small>One clear route forward</small>
              </li>
              <li>
                <span>02</span>
                <strong>Understand the offer</strong>
                <small>The right detail, in the right order</small>
              </li>
              <li>
                <span>03</span>
                <strong>Take action</strong>
                <small>Only the essential effort</small>
              </li>
            </ol>
            <div className={styles.funnelResult}>
              <span className={styles.funnelResultTick} aria-hidden="true">
                ✓
              </span>
              <span>Point B</span>
              <strong>Action complete</strong>
              <small>Next step confirmed</small>
            </div>
          </div>
        </div>
        <div className={styles.systemCopy}>
          <SectionNumber>{sections["Conversion funnels"]}</SectionNumber>
          <h2>Make the next step obvious.</h2>
          <p>
            A good funnel doesn&apos;t pressure people. It removes the uncertainty, unnecessary choices and repeated
            effort between arriving with intent and completing the thing they came to do.
          </p>
          <ul>
            <li>One clear action at every stage</li>
            <li>Fewer fields, choices and dead ends</li>
            <li>A clear confirmation and handoff at the end</li>
          </ul>
          <PrimaryButton href="#enquiry" direction="down">
            Plan your customer journey
          </PrimaryButton>
        </div>
      </section>

      <AutomationMeaning
        eyebrow={sections["What automation means"]}
        description="Automation means your website handles the repetitive work around each customer—capturing details, moving them between systems, sending follow-ups and keeping the next step moving without someone doing it by hand."
        primaryHref="#enquiry"
        primaryLabel="Discuss your website"
        panelTitle="Your website"
        secondaryHref="/automation"
        secondaryLabel="Want to know more about automation?"
      />

      <SubscriptionSwap eyebrow={sections["What you're paying for"]} />

      <section className={styles.servicesSection} id="services">
        <div className="shell">
          <ServiceScroll
            services={websiteServices}
            customHref="#enquiry"
            eyebrow={sections["What we build"]}
            title="The website is the easy part."
            ctaLabel="Discuss what you need"
          />
        </div>
      </section>

      <SeoReportOverview
        id="seo"
        className={styles.seoSection}
        eyebrow={sections["SEO after launch"]}
        showSequence={false}
        description={
          <div className={styles.seoReportSummary}>
            <span>
              We build SEO in from day one. Then, on your schedule, we report on the next opportunities for growth.
            </span>
            <div className={styles.seoReportActions}>
              <PrimaryButton className={styles.seoReportCta} href="#enquiry" direction="down" size="compact">
                Discuss your website
              </PrimaryButton>
              <PrimaryButton className={styles.seoReportCta} href="/seo" appearance="ghost" size="compact">
                Explore SEO reports
              </PrimaryButton>
            </div>
          </div>
        }
      />

      <CaseStudyTeaser
        eyebrow={sections["Proof this works"]}
        points={casePoints}
        primaryHref="#enquiry"
        primaryLabel="Discuss your website"
      >
        <p>
          Scooter Shop&apos;s website combines inventory, parts, purchasing and service journeys in one connected
          experience. Fast structured pages and focused search content helped organic clicks grow by 200% in six months.
        </p>
        <p>
          It is a practical example of what happens when the public website and the work behind it are designed as one
          system.
        </p>
      </CaseStudyTeaser>

      <ProjectEnquiry id="enquiry" />

      <Faq eyebrow={sections["Common questions"]} title="Before we begin." items={WEBSITE_DEV_FAQS} />

      <ManualAdminCta
        eyebrow="Start with the useful part"
        title="What should your website make easier?"
        href="#enquiry"
        buttonLabel="Talk about your project"
      >
        Tell us what you sell, who the site is for and where the current process gets in the way.
      </ManualAdminCta>
    </main>
  );
}
