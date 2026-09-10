import type { Metadata } from "next";

import { Faq } from "@/components/Faq";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { PageSchema } from "@/components/PageSchema";
import { PageOverview } from "@/components/PageOverview";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProcessBar } from "@/components/ProcessBar";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { SeoReportOverview } from "@/components/SeoReportOverview";
import { metadataFor } from "@/lib/pages";

import { HOME_FAQS } from "./_lib/copy";

import { AiReadinessBanner } from "@/components/marketing/AiReadinessBanner";
import { AutomationFeature } from "./_components/AutomationFeature";
import { DealerWebsiteBuilderSection } from "@/components/marketing/DealerWebsiteBuilderSection";
import { FlagshipCheckout } from "@/components/marketing/FlagshipCheckout";
import { Hero } from "@/components/marketing/Hero";
import { ProjectEnquiry } from "@/components/marketing/ProjectEnquiry";
import { WebsiteDevelopmentFeature } from "./_components/WebsiteDevelopmentFeature";
import styles from "@/components/marketing/marketingPage.module.css";

export const metadata: Metadata = metadataFor("/");

const homeStats: ProofStat[] = [
  {
    value: "+300%",
    label: "Organic clicks",
    description: "Recorded for Scooter Shop in Google Search Console over six months.",
  },
  {
    value: "08",
    label: "Connected capabilities",
    description: "Sales, parts, service, hire and more working through one dealership website.",
  },
  {
    value: "01",
    label: "Connected system",
    description: "The customer experience and the work behind it designed together.",
  },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <PageSchema path="/" />
      <AiReadinessBanner />
      <Hero
        eyebrow="Online Automation Services Australia"
        titleLines={["Digital", "automation"]}
        accentTitle="solutions."
        lead="Connected websites and automation systems built to reduce the workload of modern businesses."
        primaryHref="/contact"
        primaryLabel="Get in touch"
        secondaryHref="/portfolio/scooter-shop"
        secondaryLabel="See it in action"
      />

      <ProcessBar
        label="How we make work easier"
        steps={[
          { label: "Find the friction", description: "Start with the work slowing you down", href: "#overview" },
          { label: "Build the fix", description: "A website, workflow or useful tool", href: "#websites" },
          { label: "Connect the systems", description: "Move information where it is needed", href: "#automation" },
          { label: "Keep improving", description: "Measure what works and refine it", href: "#seo-reporting" },
        ]}
      />

      <PageOverview
        id="overview"
        eyebrow="What we do"
        title="Four ways we make work easier."
        description={
          <p>
            We build the customer-facing website and the systems behind it, so people can take action online and your
            team has less repetitive work to do afterwards.
          </p>
        }
        items={[
          { title: "Websites", description: "Convert visitors and handle useful work.", href: "#websites" },
          { title: "Business automation", description: "Move information without copy-paste.", href: "#automation" },
          { title: "Online licensing", description: "Verify, sign and pay online.", href: "#online-purchasing" },
          { title: "SEO reporting", description: "Find the next best improvement.", href: "#seo-reporting" },
        ]}
      />

      <ProofStrip stats={homeStats} />
      <div id="websites">
        <WebsiteDevelopmentFeature />
      </div>
      <div id="automation">
        <AutomationFeature />
      </div>
      <FlagshipCheckout />
      <SeoReportOverview
        id="seo-reporting"
        className={styles.seoSection}
        eyebrow="SEO reporting"
        title="A ranked SEO action plan."
        accentTitle="Written for humans."
        description={
          <div className={styles.seoSummary}>
            <span>
              Human-written reports that turn your search data into ranked next steps. Choose an ongoing website SEO
              report, a one-time Google Business Profile audit, or use both. The AI readiness check is free.
            </span>
            <PrimaryButton className={styles.seoSummaryCta} href="/seo" size="compact">
              Explore SEO reports
            </PrimaryButton>
          </div>
        }
      />
      <DealerWebsiteBuilderSection eyebrow="Interactive dealership builder" id="dealership-builder" />
      <ProjectEnquiry />
      <Faq eyebrow="Common questions" title="Questions about working with us." items={HOME_FAQS} />
      <ManualAdminCta buttonLabel="Get in touch" />
    </main>
  );
}
