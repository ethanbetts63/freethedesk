import type { Metadata } from "next";

import { VortexHero } from "./InteractiveHeroes";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Experiment",
};

export default function ExperimentPage() {
  return (
    <main className={styles.page}>
      <VortexHero />
    </main>
  );
}
