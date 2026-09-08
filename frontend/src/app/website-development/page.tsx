import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AiReadinessBanner } from "@/components/marketing/AiReadinessBanner";
import { SubscriptionSwap } from "./_components/SubscriptionSwap";
import { Hero } from "@/components/marketing/Hero";
import { ProjectEnquiry } from "@/components/marketing/ProjectEnquiry";
import { Faq } from "@/components/Faq";
import { PageSchema } from "@/components/PageSchema";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { SeoReportOverview } from "@/components/SeoReportOverview";
import { ServiceScroll } from "@/components/ServiceScroll";
import { metadataFor } from "@/lib/pages";

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

export const metadata: Metadata = metadataFor("/website-development");

const process = [
  [
    "Understand",
    "We learn the offer, audience, existing systems and commercial goal before deciding what belongs in the build.",
  ],
  [
    "Design",
    "We shape the structure and important interactions first, with mobile treated as the main experience—not an afterthought.",
  ],
  ["Build", "We develop the production site, connect the necessary systems and test the complete customer journey."],
  [
    "Improve",
    "Launch is the start of useful evidence. We monitor, maintain and refine the site from how people actually use it.",
  ],
];

const processIcons = [
  <svg key="understand" viewBox="0 0 24 24" width="24" height="24" fill="none">
    <circle cx="10" cy="10" r="6" stroke="#fff" strokeWidth="1.6" />
    <path d="M14.5 14.5 20 20" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
  </svg>,
  <svg key="design" viewBox="0 0 24 24" width="24" height="24" fill="none">
    <path
      d="M4 20l1-4L15 6l3 3-10 10-4 1Z"
      stroke="#fff"
      strokeWidth="1.6"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>,
  <svg key="build" viewBox="0 0 24 24" width="24" height="24" fill="none">
    <path
      d="M14.7 6.3a3.5 3.5 0 0 0-4.6 4.6L4 17l3 3 6.1-6.1a3.5 3.5 0 0 0 4.6-4.6l-2.3 2.3-2-2 2.3-2.3Z"
      stroke="#fff"
      strokeWidth="1.6"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>,
  <svg key="improve" viewBox="0 0 24 24" width="24" height="24" fill="none">
    <path d="M4 17l5-5 4 4 7-7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 8h5v5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
];

const automationJobs: [string, string][] = [
  ["Lead capture & routing", "Enquiries arrive with context, reach the right person, and get chased if they go cold"],
  ["Customer onboarding", "Welcome, forms and deposit request sent the moment a deal is won"],
  ["Booking & reminders", "Customers book themselves in; confirmations and no-show follow-ups send themselves"],
  ["CRM & system sync", "Contacts and status changes flow into your CRM, accounts and email tool—entered once"],
  ["Invoicing & payments", "Invoices raised from the order, overdue accounts chased, payments reconciled"],
  ["Document generation", "Quotes, contracts and paperwork built from details already entered"],
];

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

      <section className={`shell ${styles.introSection}`}>
        <div className={styles.pitch}>
          <div className={styles.pitchCopy}>
            <p className={styles.label}>01 / What you&apos;re buying</p>
            <h2>Not just a website.</h2>
            <p className={styles.pitchIntro}>
              A basic website is a brochure: a handful of pages that look fine on launch day and do nothing after that.
            </p>
            <p className={styles.pitchIntro}>
              What we build is closer to custom software. The pages your customers see are the tip of the
              iceberg—underneath, the site runs the repetitive jobs your team currently does by hand.
            </p>
            <div className={styles.pitchActions}>
              <Link href="#enquiry">
                Discuss your website <span aria-hidden="true">↓</span>
              </Link>
              <Link href="/automation">
                Want to know more about automation? <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>

          <div className={styles.pitchPanel} aria-label="Automation jobs your website can run">
            <header className={styles.pitchPanelHead}>
              <div>
                <span className={styles.pitchPanelDot} aria-hidden="true" />
                <span>
                  <small>Runs in the background</small>
                  <strong>Your website</strong>
                </span>
              </div>
              <span className={styles.pitchPanelCount}>6 jobs</span>
            </header>
            <ol className={styles.pitchList}>
              {automationJobs.map(([title, desc], index) => (
                <li key={title}>
                  <span className={styles.pitchIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.pitchCheck} aria-hidden="true">
                    ✓
                  </span>
                  <span className={styles.pitchItemCopy}>
                    <strong>{title}</strong>
                    <small>{desc}</small>
                  </span>
                  <span className={styles.pitchTag}>Automated</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={styles.servicesSection} id="services">
        <div className="shell">
          <ServiceScroll
            services={websiteServices}
            customHref="#enquiry"
            eyebrow="02 / What we build"
            title="The website is the easy part."
            lead="Anyone can put your stock on a nice-looking page. We build the parts behind it that save you actual hours."
            ctaLabel="Discuss what you need"
          />
        </div>
      </section>

      <SubscriptionSwap />

      <SeoReportOverview
        id="seo"
        className={styles.seoSection}
        eyebrow={<>04 / SEO after launch</>}
        description={
          <div className={styles.seoReportSummary}>
            <span>
              An SEO report subscription for what comes after launch—with a Google Business Profile audit and AI
              readiness audit included.
            </span>
            <div className={styles.seoReportActions}>
              <PrimaryButton className={styles.seoReportCta} href="#enquiry" direction="down">
                Discuss your website
              </PrimaryButton>
              <PrimaryButton className={`${styles.seoReportCta} ${styles.seoSecondary}`} href="/seo">
                Explore SEO reports
              </PrimaryButton>
            </div>
          </div>
        }
      />

      <section className={styles.caseSection}>
        <div className={`shell ${styles.caseInner}`}>
          <div className={styles.casePhone}>
            <div className={styles.caseStatOverlay}>
              <small>Google Search Console</small>
              <strong>+200%</strong>
              <span>organic clicks</span>
            </div>
            <div className={styles.casePhoneFrame}>
              <div className="case-mobile-phone">
                <span />
                <div className="case-phone-menu" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <Image
                  src="/case-studies/scooter-shop/inventory-mobile.png"
                  alt="Scooter Shop inventory page on mobile"
                  width={390}
                  height={844}
                />
              </div>
            </div>
          </div>
          <div className={styles.caseCopy}>
            <p className={`${styles.label} ${styles.labelLight}`}>05 / Proof this works</p>
            <h2>Scooter Shop, Perth.</h2>
            <p>
              Scooter Shop&apos;s website combines inventory, parts, purchasing and service journeys in one connected
              experience. Fast structured pages and focused search content helped organic clicks grow by 200% in six
              months.
            </p>
            <p>
              It is a practical example of what happens when the public website and the work behind it are designed as
              one system.
            </p>
            <div className={styles.casePoints}>
              {casePoints.map((point) => (
                <span key={point}>{point}</span>
              ))}
            </div>
            <div className={styles.caseActions}>
              <PrimaryButton className={styles.casePrimary} href="#enquiry" direction="down">
                Discuss your website
              </PrimaryButton>
              <Link href="/portfolio/scooter-shop">
                Read the full case study <span>↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

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
              <span>Point B</span>
              <strong>Action complete</strong>
              <small>Next step confirmed</small>
            </div>
          </div>
        </div>
        <div className={styles.systemCopy}>
          <p className={styles.label}>06 / Conversion funnels</p>
          <h2>Make the next step feel obvious.</h2>
          <p>
            A good funnel does not pressure people into acting. It removes the uncertainty, unnecessary choices and
            repeated effort between arriving with intent and completing the thing they came to do.
          </p>
          <ul>
            <li>One clear action at every stage</li>
            <li>Fewer fields, choices and dead ends</li>
            <li>Context carried from the page into the form</li>
            <li>A clear confirmation and handoff at the end</li>
          </ul>
          <PrimaryButton href="#enquiry" direction="down">
            Plan your customer journey
          </PrimaryButton>
        </div>
      </section>

      <section className="approach-section">
        <div className={`shell approach-inner ${styles.approachInner}`}>
          <p className={styles.label}>07 / How we work</p>
          <h2>
            Same process.
            <br />
            <span className="moving-colour-text">Every project.</span>
          </h2>
          <p className="approach-lead">
            Clear stages keep every build moving predictably—from understanding the business through to a site your team
            can actually run.
          </p>
          <ol className="approach-steps">
            {process.map(([title, body], index) => (
              <li className="approach-step" key={title}>
                <div className="approach-step-rail">
                  <span className="approach-step-icon" aria-hidden="true">
                    {processIcons[index]}
                  </span>
                  {index < process.length - 1 && <span className="approach-step-line" />}
                </div>
                <div className="approach-step-body">
                  <span className="approach-step-index">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link className="button button-light approach-cta" href="#enquiry">
            Discuss your website <span>↓</span>
          </Link>
        </div>
      </section>

      <ProjectEnquiry id="enquiry" />

      <Faq eyebrow="08 / Common questions" title="Before we begin." items={WEBSITE_DEV_FAQS} />

      <section className={`shell ${styles.closing}`}>
        <p className={styles.label}>Start with the useful part</p>
        <h2>What should your website make easier?</h2>
        <p>Tell us what you sell, who the site is for and where the current process gets in the way.</p>
        <PrimaryButton className={styles.closingCta} href="#enquiry" direction="up">
          Talk about your project
        </PrimaryButton>
      </section>
    </main>
  );
}
