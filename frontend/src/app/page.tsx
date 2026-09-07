import type { Metadata } from "next";
import Link from "next/link";

import { Faq } from "@/components/Faq";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { PageSchema } from "@/components/PageSchema";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { SeoReportOverview } from "@/components/SeoReportOverview";
import { pageMetadata } from "@/lib/seo";

import { AutomationFeature } from "./home-v3/AutomationFeature";
import { FlagshipCheckout } from "./home-v3/FlagshipCheckout";
import { HomeHero } from "./home-v3/HomeHero";
import { WebsiteDevelopmentFeature } from "./home-v3/WebsiteDevelopmentFeature";
import { WebsiteProduct } from "./home-v3/WebsiteProduct";
import styles from "./home-v3/page.module.css";

const TITLE = "Free the Desk | Dealer Operations Systems";
const DESCRIPTION = "Dealer websites and operational systems for Australian vehicle, equipment and leisure dealerships.";
const PATH = "/";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, absoluteTitle: true });

const homeStats: [ProofStat, ProofStat, ProofStat] = [
  { value: "86%", label: "Research online first", description: "Car shoppers who research online before ever visiting." },
  { value: "24 / 7", label: "Always-on operations", description: "Notifications and syncs that don't wait for business hours." },
  { value: "AI", label: "Are you AI ready?", description: "We check four practical foundations for AI and agentic browsing." },
];

const questions = [
  ["What does Free the Desk actually build?", "Custom websites, workflow automations, practical SEO reports and online systems for dealerships. Each can stand alone, or connect into one larger system around how your business works."],
  ["Do you only work with dealerships?", "No. Our dealership products are specialised, but we build websites and business automations for service, retail, equipment, trade and other Australian businesses."],
  ["Where should we start?", "Start with the outcome or the repeated task—not a technical specification. Show us what takes too long, gets copied by hand or makes customers work harder than they should, and we'll help define the useful first step."],
  ["Can we choose just one service?", "Yes. A website, automation project, SEO report or licensing product can be bought on its own. We only connect services where the connection genuinely removes work or improves the customer journey."],
  ["Do you work outside Perth?", "Yes. We're Perth-based and work with businesses across Australia."],
];

export default function Home() {
  return (
    <main className={styles.page}>
      <PageSchema title={TITLE} description={DESCRIPTION} path={PATH} />
      <HomeHero />
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
      <FlagshipCheckout />
      <WebsiteProduct />
      <Faq
        eyebrow="Common questions"
        title="A useful place to start."
        items={questions.map(([question, answer]) => ({ question, answer }))}
      />
      <ManualAdminCta label="Get in contact" />
    </main>
  );
}
