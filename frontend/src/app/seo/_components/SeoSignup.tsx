import { SectionNumber } from "@/components/SectionNumber";
import { type PublicSiteSettings } from "@/lib/api";
import { SeoSignupPanel } from "./SeoSignupPanel";
import styles from "../page.module.css";

/* Server shell: only the report chooser and the form need to hydrate. */
export function SeoSignup({ settings, eyebrow }: { settings: PublicSiteSettings; eyebrow: string }) {
  return (
    <section className={`shell ${styles.plansSection}`} id="signup">
      <SeoSignupPanel
        settings={settings}
        heading={
          <>
            <SectionNumber>{eyebrow}</SectionNumber>
            <h2>Choose your report.</h2>
          </>
        }
      />
    </section>
  );
}
