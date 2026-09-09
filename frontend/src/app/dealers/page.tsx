import type { Metadata } from "next";

import { Faq } from "@/components/Faq";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { PageSchema } from "@/components/PageSchema";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { metadataFor } from "@/lib/pages";

import { DEALER_FAQS } from "./_lib/copy";

import { AiReadinessBanner } from "@/components/marketing/AiReadinessBanner";
import { DealershipAutomation } from "./_components/DealershipAutomation";
import { FlagshipCheckout } from "@/components/marketing/FlagshipCheckout";
import { Hero } from "@/components/marketing/Hero";
import { ProjectEnquiry } from "@/components/marketing/ProjectEnquiry";
import { WebsiteProduct } from "@/components/marketing/WebsiteProduct";
import styles from "@/components/marketing/marketingPage.module.css";

export const metadata: Metadata = metadataFor("/dealers");

const dealerStats: ProofStat[] = [
  {
    value: "86%",
    label: "Research online first",
    description: "Car shoppers who research online before ever visiting.",
  },
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

export default function Dealers() {
  return (
    <main className={styles.page}>
      <PageSchema path="/dealers" />
      <AiReadinessBanner />
      <Hero
        eyebrow="Efficiency First Solutions"
        titleLines={["Digital"]}
        accentTitle="dealerships."
        lead="Connected websites and operational systems built for the way modern dealerships sell, service and work."
        primaryHref="/dealership-website-builder"
        primaryLabel="Try the free demo"
        secondaryHref="/portfolio/scooter-shop"
        secondaryLabel="See it in action"
      />
      <ProofStrip stats={dealerStats} />
      <FlagshipCheckout />
      <WebsiteProduct />
      <DealershipAutomation />
      <ProjectEnquiry />
      <Faq eyebrow="Common questions" title="Before you get in touch." items={DEALER_FAQS} />
      <ManualAdminCta href="#project-enquiry" buttonLabel="Discuss your dealership" />
    </main>
  );
}
