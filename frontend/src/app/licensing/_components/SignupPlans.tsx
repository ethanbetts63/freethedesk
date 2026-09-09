import Link from "next/link";

import { SectionNumber } from "@/components/SectionNumber";
import type { LicensingPrices } from "../_lib/plans";
import { SignupPlansPanel } from "./SignupPlansPanel";
import styles from "../page.module.css";

/* Server shell: only the plan chooser and the form need to hydrate, so the
   section, its heading and the closing note render here. */
export function SignupPlans({ settings, eyebrow }: { settings: LicensingPrices; eyebrow: string }) {
  return (
    <section className={`shell ${styles.signupSection}`} id="signup">
      <SignupPlansPanel
        settings={settings}
        heading={
          <>
            <SectionNumber>{eyebrow}</SectionNumber>
            <h2>Choose what you need.</h2>
          </>
        }
      />

      <p className={styles.customBuildNote}>
        Want this built into a custom dealership website instead?{" "}
        <Link href="/dealership-website-builder">See the website builder ↗</Link>
      </p>
    </section>
  );
}
