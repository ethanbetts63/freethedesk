import type { Metadata } from "next";

import { Faq } from "@/components/Faq";
import { FloatingPageCta } from "@/components/FloatingPageCta";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { Hero } from "@/components/marketing/Hero";
import { PageOverview } from "@/components/PageOverview";
import { PageSchema } from "@/components/PageSchema";
import { ProcessBar } from "@/components/ProcessBar";
import { metadataFor } from "@/lib/pages";
import { numberSections } from "@/lib/sectionNumbers";
import { getSiteSettingsServer } from "@/lib/serverApi";

import { IdentityVerification } from "./_components/IdentityVerification";
import { LicensingConfigurationOptions } from "./_components/LicensingConfigurationOptions";
import { LicensingJourneyComparison } from "./_components/LicensingJourneyComparison";
import { SignupPlans } from "./_components/SignupPlans";
import { LICENSING_FAQS } from "./_lib/copy";
import styles from "./page.module.css";

const sections = numberSections([
  "What you get",
  "A shorter path to sold",
  "Two ways to use it",
  "Know who's signing",
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
        eyebrow="Online vehicle licensing"
        titleLines={["License online."]}
        accentTitle="Lose the visit."
        lead="Use our portal or build it into your website. Customers verify and sign online—no dealership visit required."
        primaryHref="#signup"
        primaryLabel="Choose your plan"
        secondaryHref="/contact"
        secondaryLabel="Talk to us"
      />

      <ProcessBar
        id="licensing-hero-end"
        label="The online licensing journey"
        steps={[
          { label: "Choose", description: "Start from the vehicle or sale", href: "#shorter-path" },
          { label: "Verify", description: "Confirm the customer's identity", href: "#identity-verification" },
          { label: "Sign and pay", description: "Complete paperwork from anywhere", href: "#configuration-options" },
          { label: "Finish the handover", description: "Arrange delivery or pickup", href: "#signup" },
        ]}
      />

      <PageOverview
        id="licensing-overview"
        eyebrow={sections["What you get"]}
        title="Put the whole licensing journey online."
        description={
          <p>
            Use our hosted portal with your current website, or build the flow directly into a dealership site. Either
            way, customers verify, sign and complete the paperwork remotely.
          </p>
        }
        items={[
          { title: "The shorter journey", description: "See which customer steps disappear.", href: "#shorter-path" },
          {
            title: "Two setup options",
            description: "Hosted portal or built into your website.",
            href: "#configuration-options",
          },
          {
            title: "Identity verification",
            description: "Stripe checks the document and the person.",
            href: "#identity-verification",
          },
          { title: "Plans and pricing", description: "Choose the setup that fits.", href: "#signup" },
        ]}
      />

      <LicensingJourneyComparison eyebrow={sections["A shorter path to sold"]} />
      <LicensingConfigurationOptions eyebrow={sections["Two ways to use it"]} />
      <IdentityVerification id="identity-verification" eyebrow={sections["Know who's signing"]} />
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
