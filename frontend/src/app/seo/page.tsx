import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Hero } from "@/components/marketing/Hero";
import { Faq } from "@/components/Faq";
import { PageSchema } from "@/components/PageSchema";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { SeoReportOverview } from "@/components/SeoReportOverview";
import { ServiceScroll } from "@/components/ServiceScroll";
import { pageMetadata } from "@/lib/seo";

import { SEO_FAQS } from "./_lib/copy";
import { formatPrice, getSiteSettingsServer } from "@/lib/serverApi";
import { SeoPlans } from "./_components/SeoPlans";
import { seoServices } from "./_components/seoServices";
import styles from "./page.module.css";

const TITLE = "Your Next SEO Move, Made Clear";
const DESCRIPTION = "See what is working, what is holding your website back and where the best search opportunities are.";
const PATH = "/seo";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const pipelineSteps = [
  ["Machine sweep", "Pre-written crawl code, benchmark data from past projects and pre-planned AI search routines run over your site and your Search Console data."],
  ["Human judgement", "The machines produce a long list of maybes. We cut what doesn't hold up, and add what only experience catches."],
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
    { value: "AI", label: "Are you AI ready?", description: "Every report includes our four-point AI readiness check." },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Quarterly SEO Reports",
    serviceType: "SEO consulting and reporting",
    areaServed: { "@type": "Country", name: "Australia" },
    provider: { "@type": "Organization", name: "Free the Desk", url: "https://freethedesk.com.au" },
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
      <PageSchema title={TITLE} description={DESCRIPTION} path={PATH} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Hero
        eyebrow="Practical SEO reporting"
        titleLines={["Data Driven,"]}
        accentTitle="SEO."
        lead="See what's working, what's holding you back and where the best opportunities are."
        primaryHref="/contact"
        primaryLabel="Get your first report"
        secondaryHref="#report"
        secondaryLabel="See what you get"
        stages={["Connect", "Study", "Report", "Repeat"]}
      />

      <ProofStrip stats={seoStats} />

      <SeoReportOverview
        id="report"
        eyebrow={<>01 / What you&apos;re buying</>}
        description={<p>Not a dashboard. An emailed report you can read in ten minutes and act on immediately.</p>}
      />

      <section className={`shell ${styles.plansSection}`} id="plans">
        <p className={styles.label}>02 / Plans</p>
        <h2>Pick how often you want to hear from us.</h2>
        <p className={styles.introLead}>Every plan is the same report and the same attention—the cadence is the only variable. Cancel or change any time.</p>
        <SeoPlans settings={settings} />
      </section>

      <section className={styles.compareSection}>
        <div className={`shell ${styles.compareInner}`}>
          <div className={styles.compareCopy}>
            <p className={styles.label}>03 / Why it&apos;s cheap</p>
            <h2>Two hours of human judgement. That&apos;s what you&apos;re paying for.</h2>
            <p>Most of an SEO audit is collection work—crawling pages, pulling data, checking the same hundred things. We&apos;ve automated that, so you don&apos;t pay agency prices for it.</p>
            <p>It&apos;s the same process we run internally on every website we build. What can&apos;t be automated is deciding what&apos;s actually worth your time—and that&apos;s the two hours you&apos;re buying.</p>
            <p className={styles.priceHonesty}>Still sounds too cheap? It is. We&apos;re betting some subscribers will eventually want a site built by us.</p>
          </div>
          <div className={styles.pipelineCard}>
            <header className={styles.pipelineHead}>
              <span className="moving-colour-text">How a report gets made</span>
            </header>
            <ol className={styles.pipelineSteps}>
              {pipelineSteps.map(([title, body], index) => (
                <li key={title}>
                  <span>0{index + 1}</span>
                  <div><h3>{title}</h3><p>{body}</p></div>
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

      <section className={`shell ${styles.introSection}`}>
        <p className={styles.label}>04 / What recommendations look like</p>
        <h2>The thinking that shows up in every report.</h2>
        <p className={styles.introLead}>Four examples of the kind of recommendation the report makes—and the standard each one has to meet before it&apos;s allowed to cost you time.</p>
      </section>

      <section className="shell">
        <ServiceScroll services={seoServices} showCustomRow={false} />
      </section>

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
                <div className="case-phone-menu" aria-hidden="true"><i /><i /><i /></div>
                <Image src="/case-studies/scooter-shop/inventory-mobile.png" alt="Scooter Shop inventory page on mobile" width={390} height={844} />
              </div>
            </div>
          </div>
          <div className={styles.caseCopy}>
            <p className={`${styles.label} ${styles.labelLight}`}>05 / Proof this works</p>
            <h2>Scooter Shop, Perth.</h2>
            <p>Scooter Shop&apos;s website was built the way our reports recommend: fast structured pages, indexable stock, and focused pages for the searches customers actually make—&ldquo;Vespa service Perth&rdquo;, &ldquo;50cc scooters Perth&rdquo;, &ldquo;SYM parts&rdquo;. Google Search Console recorded organic clicks up 200% in 6 months.</p>
            <p>That&apos;s the loop this service runs on your site: find the gap in the data, build the thing that fills it, then measure whether it earned its place.</p>
            <div className={styles.casePoints}>
              {casePoints.map((point) => <span key={point}>{point}</span>)}
            </div>
            <Link href="/portfolio/scooter-shop">Read the full case study <span>→</span></Link>
          </div>
        </div>
      </section>

      <Faq
        eyebrow="06 / Common questions"
        title="Before you connect your data."
        items={SEO_FAQS}
      />

      <section className={`shell ${styles.closing}`}>
        <p className={styles.label}>Start with your own data</p>
        <h2>What is search actually costing you right now?</h2>
        <p>Connect Google Search Console and your first report arrives within the week—ranked, plain-English, and honest about whether you should keep paying us.</p>
        <Link href="/contact">Get your first report <span>↗</span></Link>
      </section>
    </main>
  );
}
