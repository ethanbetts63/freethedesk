import type { Metadata } from "next";
import Link from "next/link";

import { Faq } from "@/components/Faq";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { PageSchema } from "@/components/PageSchema";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { SeoReportOverview } from "@/components/SeoReportOverview";
import { pageMetadata } from "@/lib/seo";

import { HOME_FAQS } from "./_lib/copy";

import { AiReadinessAudit } from "@/app/seo/_components/AiReadinessAudit";
import { AutomationFeature } from "./_components/AutomationFeature";
import { FlagshipCheckout } from "@/components/marketing/FlagshipCheckout";
import { Hero } from "@/components/marketing/Hero";
import { WebsiteDevelopmentFeature } from "./_components/WebsiteDevelopmentFeature";
import { WebsiteProduct } from "@/components/marketing/WebsiteProduct";
import styles from "@/components/marketing/marketingPage.module.css";

const TITLE = "Free the Desk | Dealer Operations Systems";
const DESCRIPTION = "Dealer websites and operational systems for Australian vehicle, equipment and leisure dealerships.";
const PATH = "/";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, absoluteTitle: true });

const homeStats: ProofStat[] = [
  { value: "36%", label: "Of the work week", description: "Time small business owners lose to manual admin tasks." },
  { value: "24 / 7", label: "Always-on operations", description: "Notifications and syncs that don't wait for business hours." },
  { value: "AI", label: "Are you AI ready?", description: "We check four practical foundations for AI and agentic browsing." },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <PageSchema title={TITLE} description={DESCRIPTION} path={PATH} />
      <Hero
        eyebrow="Online Automation Services Australia"
        titleLines={["Digital", "automation"]}
        accentTitle="solutions."
        lead="Connected websites and automation systems built to reduce the workload of modern businesses."
        primaryHref="/contact"
        primaryLabel="Get in touch"
        secondaryHref="/portfolio/scooter-shop"
        secondaryLabel="See it in action"
        stages={["Understand", "Build", "Connect", "Improve"]}
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
            <span>Human-written reports that turn your search data into ranked next steps. Every subscription includes a Google Business Profile audit and AI readiness audit.</span>
            <Link href="/seo">Explore SEO reports <span>→</span></Link>
          </div>
        }
      />
      <div className="shell">
        <AiReadinessAudit className={styles.aiAuditFlush} />
      </div>
      <FlagshipCheckout />
      <WebsiteProduct />
      <Faq
        eyebrow="Common questions"
        title="A useful place to start."
        items={HOME_FAQS}
      />
      <ManualAdminCta label="Get in contact" />
    </main>
  );
}
