import type { Metadata } from "next";

import { ExpandableServiceList } from "@/components/ExpandableServiceList";
import { Faq } from "@/components/Faq";
import { FloatingPageCta } from "@/components/FloatingPageCta";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { AiReadinessBanner } from "@/components/marketing/AiReadinessBanner";
import { CaseStudyTeaser } from "@/components/marketing/CaseStudyTeaser";
import { Hero } from "@/components/marketing/Hero";
import { PageSchema } from "@/components/PageSchema";
import { SeoReportOverview } from "@/components/SeoReportOverview";
import { metadataFor } from "@/lib/pages";
import { numberSections } from "@/lib/sectionNumbers";
import { getSiteSettingsServer } from "@/lib/serverApi";
import { PUBLIC_SITE_URL } from "@/lib/siteConfig";

import { GoogleBusinessProfileAudit } from "./_components/GoogleBusinessProfileAudit";
import { SeoAnalysis } from "./_components/SeoAnalysis";
import { SeoImprovement } from "./_components/SeoImprovement";
import { SeoIntroduction } from "./_components/SeoIntroduction";
import { SeoSignup } from "./_components/SeoSignup";
import { SeoStepsBar } from "./_components/SeoStepsBar";
import { seoServices } from "./_components/seoServices";
import { SEO_FAQS } from "./_lib/copy";
import styles from "./page.module.css";

const sections = numberSections([
  "Analyze",
  "Report",
  "Improve",
  "Google Business Profile audit",
  "What we inspect",
  "Proof this works",
  "Choose your plan",
  "Common questions",
] as const);

export const metadata: Metadata = metadataFor("/seo");

/* Pricing comes from the admin, so this page renders per request. */
export const dynamic = "force-dynamic";

const casePoints = ["Indexable stock", "Intent-focused pages", "Structured data", "Measured in Search Console"];

export default async function SeoPage() {
  const settings = await getSiteSettingsServer();

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
        path="/seo"
        eyebrow="Practical SEO reporting"
        titleLines={["Data Driven,"]}
        accentTitle="SEO."
        lead="See what's working, what's holding you back and where the best opportunities are."
        primaryHref="#signup"
        primaryLabel="Choose a Report"
        secondaryHref="#report"
        secondaryLabel="See what you get"
      />

      <SeoStepsBar />

      <SeoIntroduction />

      <SeoAnalysis eyebrow={sections["Analyze"]} />

      <SeoReportOverview
        id="report"
        eyebrow={sections["Report"]}
        title="See what changed."
        accentTitle="Know what to do next."
        description="Each report turns fresh search data into a ranked, plain-English action plan: what improved, what is holding you back and where the next opportunity sits."
        spacing="joined"
        textSide="right"
      />

      <SeoImprovement eyebrow={sections["Improve"]} />

      <GoogleBusinessProfileAudit eyebrow={sections["Google Business Profile audit"]} />

      <ExpandableServiceList
        id="issues-we-check"
        services={seoServices}
        eyebrow={sections["What we inspect"]}
        title="What we inspect in every SEO report."
        description="These are examples of the issues and opportunities we look for. Open a category to see the kinds of checks that can appear in your report."
      />

      <CaseStudyTeaser
        eyebrow={sections["Proof this works"]}
        title="A website that grew organic clicks 300%."
        points={casePoints}
        primaryHref="#signup"
        primaryLabel="Choose a Report"
        showPrimaryAction={false}
      >
        <p>
          Scooter Shop&apos;s website combines inventory, parts, purchasing and service journeys in one connected
          experience. Fast structured pages and focused search content helped organic clicks grow by 300% in six months.
        </p>
        <p>
          It is a practical example of what happens when the public website and the work behind it are designed as one
          system.
        </p>
      </CaseStudyTeaser>

      <AiReadinessBanner id="ai-readiness" />
      <SeoSignup settings={settings} eyebrow={sections["Choose your plan"]} />

      <FloatingPageCta label="Choose a Report" href="#signup" showAfterId="seo-hero-end" hideAtId="signup" />

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
