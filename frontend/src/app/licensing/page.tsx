import type { Metadata } from "next";
import Link from "next/link";

import { Hero } from "@/components/marketing/Hero";
import { Faq } from "@/components/Faq";
import { PageSchema } from "@/components/PageSchema";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { metadataFor } from "@/lib/pages";
import { getSiteSettingsServer } from "@/lib/serverApi";

import { LICENSING_FAQS } from "./_lib/copy";
import { FlowCompare } from "./_components/FlowCompare";
import { IdentityVerification } from "./_components/IdentityVerification";
import { LicensingNextStepPhone } from "./_components/LicensingNextStepPhone";
import { LoginPreviewPhone } from "./_components/LoginPreviewPhone";
import { SignupPlans } from "./_components/SignupPlans";
import styles from "./page.module.css";

const licensingStats: ProofStat[] = [
  {
    value: "72%",
    label: "Want licensing online",
    description: "Of car buyers say they'd rather complete paperwork online, per Cox Automotive research.",
  },
  {
    value: "45 min",
    label: "Saved per customer",
    description: "Average time saved at the dealership when paperwork starts online.",
  },
  {
    value: "24 / 7",
    label: "Always available",
    description: "Customers can verify, sign and pay at any time, without booking a dealership appointment.",
  },
];

export const metadata: Metadata = metadataFor("/licensing");

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
        stages={["Choose", "Sign", "Pay", "Delivery / pickup"]}
      />

      <ProofStrip stats={licensingStats} />

      <section className={styles.comparisonSection}>
        <div className={`shell ${styles.comparison}`}>
          <div className={styles.comparisonCopy}>
            <p className={styles.sectionLabel}>02 / A shorter path to sold</p>
            <h2>Keep the momentum.</h2>
            <p>Remove the steps that add effort without adding value to the customer or the dealership.</p>
            <PrimaryButton className={styles.sectionCta} href="#signup" direction="down">
              Choose your plan
            </PrimaryButton>
          </div>
          <div className={styles.paths}>
            <article>
              <header>
                <span>Traditional</span>
                <b>6 steps</b>
              </header>
              <div>
                <span>Ready to buy</span>
                <i /> <span>Arrange visit</span>
                <i /> <span>Travel</span>
                <i /> <span>Wait</span>
                <i /> <span>Sign</span>
                <i /> <strong>Handover</strong>
              </div>
            </article>
            <article className={styles.onlinePath}>
              <header>
                <span>Online</span>
                <b>4 steps</b>
              </header>
              <div>
                <span>Choose</span>
                <i /> <span>Sign</span>
                <i /> <span>Pay</span>
                <i /> <strong>Delivery / pickup</strong>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.optionsSection} id="configuration-options">
        <div className={`shell ${styles.optionsLayout}`}>
          <div className={styles.optionsHeading}>
            <p className={styles.sectionLabel}>03 / Two ways to use it</p>
            <h2>Our portal or part of your website.</h2>
            <p>
              Use the hosted product with the website you already have, or make it a seamless part of a dealership site
              we build.
            </p>
            <PrimaryButton className={styles.sectionCta} href="#signup" direction="down">
              Choose your plan
            </PrimaryButton>
          </div>
          <div className={styles.optionPhones}>
            <div className={styles.optionPhoneTile}>
              <LoginPreviewPhone />
              <p className={styles.optionPhoneCaption}>Hosted portal</p>
              <Link href="#signup">
                Choose a plan <b>↓</b>
              </Link>
            </div>
            <div className={styles.optionPhoneTile}>
              <LicensingNextStepPhone />
              <p className={styles.optionPhoneCaption}>Built into your website</p>
              <Link href="/portfolio/scooter-shop">
                See the Scooter Shop approach <b>→</b>
              </Link>
            </div>
          </div>
        </div>
        <div className="shell">
          <FlowCompare />
        </div>
      </section>

      <IdentityVerification />

      <SignupPlans settings={settings} eyebrow="06 / Choose your plan" />

      <Faq eyebrow="07 / Common questions" title="Before you sign up." items={LICENSING_FAQS} />

      <section className={`shell ${styles.closing}`}>
        <p className={styles.sectionLabel}>04 / Remove the barrier</p>
        <h2>A signature shouldn&apos;t require an appointment.</h2>
        <p>Let customers verify, sign and pay from wherever they are. The paperwork travels—not the customer.</p>
        <PrimaryButton className={styles.closingCta} href="#signup" direction="up">
          Choose your plan
        </PrimaryButton>
      </section>
    </main>
  );
}
