import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Hero } from "@/components/marketing/Hero";
import { Faq } from "@/components/Faq";
import { PageSchema } from "@/components/PageSchema";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { SectionNumber } from "@/components/SectionNumber";
import { SeoReportOverview } from "@/components/SeoReportOverview";
import { ServiceScroll } from "@/components/ServiceScroll";
import { metadataFor } from "@/lib/pages";
import { numberSections } from "@/lib/sectionNumbers";
import { PUBLIC_SITE_URL } from "@/lib/siteConfig";

import { SEO_FAQS } from "./_lib/copy";
import { formatPrice, getSiteSettingsServer } from "@/lib/serverApi";
import { AiReadinessBanner } from "@/components/marketing/AiReadinessBanner";
import { GoogleBusinessProfileAudit } from "./_components/GoogleBusinessProfileAudit";
import { SeoSignup } from "./_components/SeoSignup";
import { seoServices } from "./_components/seoServices";
import styles from "./page.module.css";

/* Section eyebrows, in the order they appear on the page. */
const sections = numberSections([
  "What you're buying",
  "Proof this works",
  "Why it's cheap",
  "What recommendations look like",
  "Choose your plan",
  "Common questions",
] as const);

export const metadata: Metadata = metadataFor("/seo");

/* Pricing comes from the admin, so this page renders per request. */
export const dynamic = "force-dynamic";

const pipelineSteps = [
  [
    "Machine sweep",
    "Pre-written crawl code, benchmark data from past projects and pre-planned AI search routines run over your site and your Search Console data.",
  ],
  [
    "Human judgement",
    "The machines produce a long list of maybes. We cut what doesn't hold up, and add what only experience catches.",
  ],
  ["Your report", "What survives becomes a ranked, plain-English list of issues and opportunities."],
];

const casePoints = ["Indexable stock", "Intent-focused pages", "Structured data", "Measured in Search Console"];

export default async function SeoPage() {
  const settings = await getSiteSettingsServer();

  const seoStats: ProofStat[] = [
    {
      value: formatPrice(settings.seo_monthly_price),
      label: "SEO Report",
      description: `From ${formatPrice(settings.seo_monthly_price)}. No setup fee, no lock-in contracts.`,
    },
    {
      value: "~2 hrs",
      label: "Human Labour",
      description: "Not AI generated. A real experienced human crafts your report.",
    },
    {
      value: "AI",
      label: "Are you AI ready?",
      description: "Run our four-point AI readiness check free, with no plan required.",
    },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Quarterly SEO Reports",
    serviceType: "SEO consulting and reporting",
    areaServed: { "@type": "Country", name: "Australia" },
    provider: { "@type": "Organization", name: "Free the Desk", url: PUBLIC_SITE_URL },
    offers: {
      "@type": "Offer",
      price: settings.seo_quarterly_price,
      priceCurrency: "AUD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: settings.seo_quarterly_price,
        priceCurrency: "AUD",
        unitText: "QUARTER",
      },
    },
  };

  return (
    <main className={styles.page}>
      <PageSchema path="/seo" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <AiReadinessBanner />
      <Hero
        eyebrow="Practical SEO reporting"
        titleLines={["Data Driven,"]}
        accentTitle="SEO."
        lead="See what's working, what's holding you back and where the best opportunities are."
        primaryHref="#signup"
        primaryLabel="Choose a Report"
        secondaryHref="#report"
        secondaryLabel="See what you get"
        stages={["Connect", "Study", "Report", "Repeat"]}
      />

      <ProofStrip stats={seoStats} />

      <SeoReportOverview
        id="report"
        eyebrow={sections["What you're buying"]}
        description={
          <div className={styles.reportDescription}>
            <p>Not a dashboard. An emailed report you can read in ten minutes and act on immediately.</p>
            <PrimaryButton className={styles.sectionCta} href="#signup" direction="down">
              Choose a Report
            </PrimaryButton>
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
            <SectionNumber onDark>{sections["Proof this works"]}</SectionNumber>
            <h2>Scooter Shop, Perth.</h2>
            <p>
              Scooter Shop&apos;s website was built the way our reports recommend: fast structured pages, indexable
              stock, and focused pages for the searches customers actually make—&ldquo;Vespa service Perth&rdquo;,
              &ldquo;50cc scooters Perth&rdquo;, &ldquo;SYM parts&rdquo;. Google Search Console recorded organic clicks
              up 200% in 6 months.
            </p>
            <p>
              That&apos;s the loop this service runs on your site: find the gap in the data, build the thing that fills
              it, then measure whether it earned its place.
            </p>
            <div className={styles.casePoints}>
              {casePoints.map((point) => (
                <span key={point}>{point}</span>
              ))}
            </div>
            <div className={styles.caseActions}>
              <PrimaryButton className={styles.casePrimary} href="#signup" direction="down">
                Choose a Report
              </PrimaryButton>
              <Link href="/portfolio/scooter-shop">
                Read the full case study <span>↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.compareSection}>
        <div className={`shell ${styles.compareInner}`}>
          <div className={styles.compareCopy}>
            <SectionNumber>{sections["Why it's cheap"]}</SectionNumber>
            <h2>Two hours of human judgement. That&apos;s what you&apos;re paying for.</h2>
            <p>
              Most of an SEO audit is collection work—crawling pages, pulling data, checking the same hundred things.
              We&apos;ve automated that, so you don&apos;t pay agency prices for it.
            </p>
            <p>It&apos;s the same process we run internally on every website we build.</p>
            <p className={styles.priceHonesty}>
              Still sounds too cheap? It is. We&apos;re betting some subscribers will eventually want a site built by
              us.
            </p>
            <PrimaryButton className={styles.sectionCta} href="#signup" direction="down">
              Choose a Report
            </PrimaryButton>
          </div>
          <div className={styles.pipelineCard}>
            <header className={styles.pipelineHead}>
              <span className="moving-colour-text">How a report gets made</span>
            </header>
            <ol className={styles.pipelineSteps}>
              {pipelineSteps.map(([title, body], index) => (
                <li key={title}>
                  <span>0{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <footer className={styles.pipelineFoot}>
              <strong className="moving-colour-text">~2 hrs</strong>
              <span>of experienced human labour per report.</span>
            </footer>
          </div>
        </div>
      </section>

      <section className="shell">
        <ServiceScroll
          services={seoServices}
          customHref="#signup"
          eyebrow={sections["What recommendations look like"]}
          title="The thinking that shows up in every report."
          ctaLabel="Choose a Report"
          showCustomService={false}
        />
      </section>

      <GoogleBusinessProfileAudit ctaHref="#google-business-profile-audit" ctaLabel="Choose a Report" />

      <SeoSignup settings={settings} eyebrow={sections["Choose your plan"]} />

      <Faq eyebrow={sections["Common questions"]} title="Before you connect your data." items={SEO_FAQS} />

      <section className={`shell ${styles.closing}`}>
        <SectionNumber>Start with your own data</SectionNumber>
        <h2>What is search actually costing you right now?</h2>
        <p>
          Connect Google Search Console and your first report arrives within the week—ranked, plain-English, and honest
          about whether you should keep paying us.
        </p>
        <PrimaryButton className={styles.closingCta} href="#signup" direction="up">
          Choose a Report
        </PrimaryButton>
      </section>
    </main>
  );
}
