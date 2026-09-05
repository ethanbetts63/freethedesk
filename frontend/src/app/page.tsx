import { ProofStrip, type ProofStat } from "@/components/ProofStrip";

import { AiReadySection } from "./home-v3/AiReadySection";
import { DealershipAutomation } from "./home-v3/DealershipAutomation";
import { FlagshipCheckout } from "./home-v3/FlagshipCheckout";
import { HomeHero } from "./home-v3/HomeHero";
import { WebsiteProduct } from "./home-v3/WebsiteProduct";
import styles from "./home-v3/page.module.css";

const homeStats: [ProofStat, ProofStat, ProofStat] = [
  { value: "86%", label: "Research online first", description: "Car shoppers who research online before ever visiting." },
  { value: "24/7", label: "Always-on operations", description: "Notifications and syncs that don't wait for business hours." },
  { value: "AI", label: "Are you AI ready?", description: "At a minimum you should meet Google's 3 recommendations." },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <HomeHero />
      <ProofStrip stats={homeStats} />
      <FlagshipCheckout />
      <WebsiteProduct />
      <DealershipAutomation />
      <AiReadySection />
    </main>
  );
}
