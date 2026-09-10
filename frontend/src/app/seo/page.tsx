import type { Metadata } from "next";

import { Hero } from "@/components/marketing/Hero";
import { CaseStudyTeaser } from "@/components/marketing/CaseStudyTeaser";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { ExpandableServiceList } from "@/components/ExpandableServiceList";
import { Faq } from "@/components/Faq";
import { PageOverview } from "@/components/PageOverview";
import { PageSchema } from "@/components/PageSchema";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProcessBar } from "@/components/ProcessBar";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { SectionNumber } from "@/components/SectionNumber";
import { SeoReportOverview } from "@/components/SeoReportOverview";
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

/* Section eyebrows in page order. */
const sections = numberSections([
  "Choose the right report",
  "What you're buying",
  "Google Business Profile audit",
  "Proof this works",
  "Why it's cheap",
  "What we inspect",
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
      value: formatPrice(settings.gbp_audit_price),
      label: "One-time GBP audit",
      description: "A single review and prioritised action list for your Google Business Profile.",
    },
    {
      value: formatPrice(settings.seo_monthly_price),
      label: "Recurring SEO report",
      description: `From ${formatPrice(settings.seo_monthly_price)} per report, with no lock-in contract.`,
    },
    {
      value: "~2 hrs",
      label: "Human judgement",
      description: "A real, experienced person reviews the findings and ranks what matters.",
    },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Quarterly SEO Reports",
    serviceType: "SEO consulting and reporting",
    areaServed: { "@type": "Country", name: "Australia" },
    provider: { "@id": `${PUBLIC_SITE_URL}/#organization` },
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
      <Hero
        eyebrow="Practical SEO reporting"
        titleLines={["Data Driven,"]}
        accentTitle="SEO."
        lead="See what's working, what's holding you back and where the best opportunities are."
        primaryHref="#signup"
        primaryLabel="Choose a Report"
        secondaryHref="#report"
        secondaryLabel="See what you get"
      />

      <ProcessBar
        label="How recurring SEO compounds"
        steps={[
          { label: "Measure", description: "Read the latest search data", href: "#report" },
          { label: "Prioritise", description: "Find the highest-value gap", href: "#issues-we-check" },
          { label: "Improve", description: "Fix, build or test the next thing", href: "#issues-we-check" },
          { label: "Repeat", description: "Use fresh data to choose again", href: "#signup" },
        ]}
      />

      <PageOverview
        id="seo-overview"
        eyebrow={sections["Choose the right report"]}
        title="One-off local audit or ongoing SEO."
        description={
          <p>
            These are two different services. Fix your Google Business Profile with a one-time audit, or use recurring
            SEO reports to find, test and compound improvements across your website.
          </p>
        }
        items={[
          {
            meta: "Recurring",
            title: "Website SEO reports",
            description: "A fresh, ranked action plan every cycle.",
            href: "#report",
          },
          {
            meta: "One-time",
            title: "Google Business Profile audit",
            description: "Fix the profile customers see in local search.",
            href: "#gbp-audit",
          },
        ]}
      />

      <ProofStrip stats={seoStats} />

      <SeoReportOverview
        id="report"
        eyebrow={sections["What you're buying"]}
        title="A clear SEO action plan."
        accentTitle="Delivered every cycle."
        description={
          <div className={styles.reportDescription}>
            <p>Not a dashboard. An emailed report you can read in ten minutes and act on immediately.</p>
            <PrimaryButton className={styles.sectionCta} href="#signup" direction="down" size="compact">
              Choose a Report
            </PrimaryButton>
          </div>
        }
      />

      <GoogleBusinessProfileAudit
        eyebrow={sections["Google Business Profile audit"]}
        ctaHref="#google-business-profile-audit"
        ctaLabel="Choose a Report"
      />

      <CaseStudyTeaser
        eyebrow={sections["Proof this works"]}
        title="The result: 200% more organic clicks."
        points={casePoints}
        primaryHref="#signup"
        primaryLabel="Choose a Report"
      >
        <p>
          Scooter Shop&apos;s website was built the way our reports recommend: fast structured pages, indexable stock,
          and focused pages for the searches customers actually make—&ldquo;Vespa service Perth&rdquo;, &ldquo;50cc
          scooters Perth&rdquo;, &ldquo;SYM parts&rdquo;. Google Search Console recorded organic clicks up 200% in 6
          months.
        </p>
        <p>
          That&apos;s the loop this service runs on your site: find the gap in the data, build the thing that fills it,
          then measure whether it earned its place.
        </p>
      </CaseStudyTeaser>

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
            <PrimaryButton className={styles.sectionCta} href="#signup" direction="down" size="compact">
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

      <ExpandableServiceList
        id="issues-we-check"
        services={seoServices}
        eyebrow={sections["What we inspect"]}
        title="What we inspect in every SEO report."
        description="These are examples of the issues and opportunities we look for. Open a category to see the kinds of checks that can appear in your report."
      />

      <AiReadinessBanner id="ai-readiness" />

      <SeoSignup settings={settings} eyebrow={sections["Choose your plan"]} />

      <Faq eyebrow={sections["Common questions"]} title="SEO report and audit questions." items={SEO_FAQS} />

      <ManualAdminCta
        eyebrow="Start with your own data"
        title="What is search actually costing you right now?"
        href="#signup"
        buttonLabel="Choose a Report"
      >
        Connect Google Search Console and your first report arrives within the week—ranked, plain-English, and honest
        about whether you should keep paying us.
      </ManualAdminCta>
    </main>
  );
}
