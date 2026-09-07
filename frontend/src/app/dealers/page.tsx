import type { Metadata } from "next";

import { Faq } from "@/components/Faq";
import { PageSchema } from "@/components/PageSchema";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { pageMetadata } from "@/lib/seo";

import { DEALER_FAQS } from "./_lib/copy";

import { AiReadySection } from "./_components/AiReadySection";
import { DealershipAutomation } from "./_components/DealershipAutomation";
import { FlagshipCheckout } from "@/components/marketing/FlagshipCheckout";
import { Hero } from "@/components/marketing/Hero";
import { WebsiteProduct } from "@/components/marketing/WebsiteProduct";
import styles from "@/components/marketing/marketingPage.module.css";

const TITLE = "Dealer Websites & Operations Systems";
const DESCRIPTION = "Dealer websites and operational systems for Australian vehicle, equipment and leisure dealerships.";
const PATH = "/dealers";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const dealerStats: ProofStat[] = [
  { value: "86%", label: "Research online first", description: "Car shoppers who research online before ever visiting." },
  { value: "24 / 7", label: "Always-on operations", description: "Notifications and syncs that don't wait for business hours." },
  { value: "AI", label: "Are you AI ready?", description: "We check four practical foundations for AI and agentic browsing." },
];

export default function Dealers() {
  return (
    <main className={styles.page}>
      <PageSchema title={TITLE} description={DESCRIPTION} path={PATH} />
      <Hero
        eyebrow="Efficiency First Solutions"
        titleLines={["Digital"]}
        accentTitle="dealerships."
        lead="Connected websites and operational systems built for the way modern dealerships sell, service and work."
        primaryHref="/dealership-website-builder"
        primaryLabel="Try the Free Demo"
        secondaryHref="/portfolio/scooter-shop"
        secondaryLabel="See it in action"
        stages={["Search", "Enquire", "Buy", "Service"]}
      />
      <ProofStrip stats={dealerStats} />
      <FlagshipCheckout />
      <WebsiteProduct />
      <DealershipAutomation />
      <AiReadySection />
      <Faq
        eyebrow="Common questions"
        title="Before you get in touch."
        items={DEALER_FAQS}
      />
    </main>
  );
}
