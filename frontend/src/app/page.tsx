import type { Metadata } from "next";

import { Faq } from "@/components/Faq";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { PageSchema } from "@/components/PageSchema";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { SeoReportOverview } from "@/components/SeoReportOverview";
import { metadataFor } from "@/lib/pages";

import { HOME_FAQS } from "./_lib/copy";

import { AiReadinessBanner } from "@/components/marketing/AiReadinessBanner";
import { AutomationFeature } from "./_components/AutomationFeature";
import { FlagshipCheckout } from "@/components/marketing/FlagshipCheckout";
import { Hero } from "@/components/marketing/Hero";
import { ProjectEnquiry } from "@/components/marketing/ProjectEnquiry";
import { WebsiteDevelopmentFeature } from "./_components/WebsiteDevelopmentFeature";
import { WebsiteProduct } from "@/components/marketing/WebsiteProduct";
import styles from "@/components/marketing/marketingPage.module.css";

export const metadata: Metadata = metadataFor("/");

const homeStats: ProofStat[] = [
  { value: "36%", label: "Of the work week", description: "Time small business owners lose to manual admin tasks." },
  {
    value: "24 / 7",
    label: "Always-on operations",
    description: "Notifications and syncs that don't wait for business hours.",
  },
  {
    value: "AI",
    label: "Are you AI ready?",
    description: "We check four practical foundations for AI and agentic browsing.",
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
      <ProofStrip stats={homeStats} />
      <WebsiteDevelopmentFeature />
      <AutomationFeature />
      <SeoReportOverview
        id="seo-reporting"
        className={styles.seoSection}
        eyebrow="SEO reporting"
        description={
          <div className={styles.seoSummary}>
            <span>
              Human-written reports that turn your search data into ranked next steps. Every subscription includes a
              Choose website SEO, a Google Business Profile report, or combine both. The AI readiness check is free.
            </span>
            <PrimaryButton className={styles.seoSummaryCta} href="/seo" size="compact">
              Explore SEO reports
            </PrimaryButton>
          </div>
        }
      />
      <FlagshipCheckout />
      <WebsiteProduct />
      <ProjectEnquiry />
      <Faq eyebrow="Common questions" title="A useful place to start." items={HOME_FAQS} />
      <ManualAdminCta buttonLabel="Get in touch" />
    </main>
  );
}
