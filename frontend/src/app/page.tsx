import { ProofStrip, type ProofStat } from "@/components/ProofStrip";

import { DealershipAutomation } from "./home-v3/DealershipAutomation";
import { FlagshipCheckout } from "./home-v3/FlagshipCheckout";
import { HomeHero } from "./home-v3/HomeHero";
import { WebsiteProduct } from "./home-v3/WebsiteProduct";
import styles from "./home-v3/page.module.css";

const homeStats: [ProofStat, ProofStat, ProofStat] = [
  { value: "86%", label: "Research online first", description: "Car shoppers who research a dealership online before ever visiting, industry-wide." },
  { value: "24/7", label: "Always-on operations", description: "Notifications, stock syncs and bookings that don't wait for business hours." },
  { value: "01", label: "Connected system", description: "Your website and back office working from the same data." },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <HomeHero />
      <ProofStrip stats={homeStats} />
      <FlagshipCheckout />
      <WebsiteProduct />
      <DealershipAutomation />
    </main>
  );
}
