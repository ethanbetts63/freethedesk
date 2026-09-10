import type { Metadata } from "next";

import { Faq } from "@/components/Faq";
import { FloatingPageCta } from "@/components/FloatingPageCta";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { Hero } from "@/components/marketing/Hero";
import { PageSchema } from "@/components/PageSchema";
import { metadataFor } from "@/lib/pages";
import { numberSections } from "@/lib/sectionNumbers";
import { getSiteSettingsServer } from "@/lib/serverApi";

import { LicensingChoose } from "./_components/LicensingChoose";
import { LicensingComplete } from "./_components/LicensingComplete";
import { LicensingConfigurationOptions } from "./_components/LicensingConfigurationOptions";
import { LicensingIntroduction } from "./_components/LicensingIntroduction";
import { LicensingStepsBar } from "./_components/LicensingStepsBar";
import { LicensingVerify } from "./_components/LicensingVerify";
import { SignupPlans } from "./_components/SignupPlans";
import { LICENSING_FAQS } from "./_lib/copy";
import styles from "./page.module.css";

const sections = numberSections([
  "Choose",
  "Verify",
  "Complete",
  "Two ways to use it",
  "Choose your plan",
  "Common questions",
  "Remove the barrier",
] as const);

export const metadata: Metadata = metadataFor("/licensing");

/* Pricing comes from the admin, so this page renders per request. */
export const dynamic = "force-dynamic";

export default async function LicensingPage() {
  const settings = await getSiteSettingsServer();

  return (
    <main className={styles.page}>
      <PageSchema path="/licensing" />
      <Hero
        path="/licensing"
        eyebrow="Online vehicle licensing"
        titleLines={["License online."]}
        accentTitle="Lose the visit."
        lead="Use our portal or build it into your website. Customers verify and sign online—no dealership visit required."
        primaryHref="#signup"
        primaryLabel="Choose your plan"
        secondaryHref="/contact"
        secondaryLabel="Talk to us"
      />

      <LicensingStepsBar />

      <LicensingIntroduction />

      <LicensingChoose eyebrow={sections["Choose"]} />
      <LicensingVerify eyebrow={sections["Verify"]} />
      <LicensingComplete eyebrow={sections["Complete"]} />

      <LicensingConfigurationOptions eyebrow={sections["Two ways to use it"]} />
      <SignupPlans settings={settings} eyebrow={sections["Choose your plan"]} />

      <FloatingPageCta label="Choose your plan" href="#signup" showAfterId="licensing-hero-end" hideAtId="signup" />

      <Faq eyebrow={sections["Common questions"]} title="Online licensing questions." items={LICENSING_FAQS} />

      <ManualAdminCta
        eyebrow={sections["Remove the barrier"]}
        title="A signature shouldn't require an appointment."
        href="#signup"
        buttonLabel="Choose your plan"
      >
        Let customers verify, sign and pay from wherever they are. The paperwork travels—not the customer.
      </ManualAdminCta>
    </main>
  );
}
