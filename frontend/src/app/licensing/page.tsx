import type { Metadata } from "next";
import Link from "next/link";

import { FlowHeroConcept } from "../home-v3/FlowHeroConcept";
import { Faq } from "@/components/Faq";
import { PageSchema } from "@/components/PageSchema";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { pageMetadata } from "@/lib/seo";
import { FlowCompare } from "./FlowCompare";
import { IdentityVerification } from "./IdentityVerification";
import { LicensingNextStepPhone } from "./LicensingNextStepPhone";
import { LoginPreviewPhone } from "./LoginPreviewPhone";
import { SignupPlans } from "./SignupPlans";
import styles from "./page.module.css";

const TITLE = "Online Vehicle Licensing";
const DESCRIPTION = "Let customers verify their identity, complete vehicle licensing and sign paperwork online without an unnecessary dealership visit.";
const PATH = "/licensing";

const questions = [
  ["Do I need a new website to use this?", "No. Choose the hosted portal and keep your current site, or have it built directly into a dealership website we design for you."],
  ["How does the customer actually pay?", "Online, as part of the same flow—card payment for a plan, or the BSB details shown when licensing is built into a vehicle purchase on your website."],
  ["What happens once the customer signs?", "The completed paperwork lands straight back in your dealer queue—no scanning, printing or chasing an emailed PDF."],
  ["Can I try it before signing up?", "Yes. The demo plan is free, no card required, and walks through the same dealer and customer journey as a live account."],
  ["Do I need both licensing and contracts?", "No—pick whichever you need. Online licensing and online contracts are priced separately, or combined at a lower combined rate."],
];

const licensingStats: [ProofStat, ProofStat, ProofStat] = [
  { value: "72%", label: "Want licensing online", description: "Of car buyers say they'd rather complete paperwork online, per Cox Automotive research." },
  { value: "45 min", label: "Saved per customer", description: "Average time saved at the dealership when paperwork starts online." },
  { value: "24 / 7", label: "Always available", description: "Customers can verify, sign and pay at any time, without booking a dealership appointment." },
];

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function LicensingPage() {
  return (
    <main className={styles.page}>
      <PageSchema title={TITLE} description={DESCRIPTION} path={PATH} />
      <FlowHeroConcept
        eyebrow="Online vehicle licensing"
        title="License online."
        accentTitle="Lose the visit."
        lead="Use our portal or build it into your website. Customers verify and sign online—no dealership visit required."
        primaryHref="#signup"
        primaryLabel="Choose your plan"
        secondaryHref="/contact"
        secondaryLabel="Talk to us"
        stages={["Choose", "Sign", "Pay", "Delivery / pickup"]}
      />

      <ProofStrip stats={licensingStats} />

      <SignupPlans />

      <section className={styles.comparisonSection}>
        <div className={`shell ${styles.comparison}`}>
          <div className={styles.comparisonCopy}>
            <p className={styles.sectionLabel}>02 / A shorter path to sold</p>
            <h2>Keep the momentum.</h2>
            <p>Remove the steps that add effort without adding value to the customer or the dealership.</p>
          </div>
          <div className={styles.paths}>
            <article>
              <header><span>Traditional</span><b>6 steps</b></header>
              <div><span>Ready to buy</span><i /> <span>Arrange visit</span><i /> <span>Travel</span><i /> <span>Wait</span><i /> <span>Sign</span><i /> <strong>Handover</strong></div>
            </article>
            <article className={styles.onlinePath}>
              <header><span>Online</span><b>4 steps</b></header>
              <div><span>Choose</span><i /> <span>Sign</span><i /> <span>Pay</span><i /> <strong>Delivery / pickup</strong></div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.optionsSection} id="configuration-options">
        <div className={`shell ${styles.optionsLayout}`}>
          <div className={styles.optionsHeading}>
            <p className={styles.sectionLabel}>03 / Two ways to use it</p>
            <h2>Our portal or part of your website.</h2>
            <p>Use the hosted product with the website you already have, or make it a seamless part of a dealership site we build.</p>
          </div>
          <div className={styles.optionPhones}>
            <div className={styles.optionPhoneTile}>
              <LoginPreviewPhone />
              <p className={styles.optionPhoneCaption}>Hosted portal</p>
              <Link href="#signup">Choose a plan <b>↗</b></Link>
            </div>
            <div className={styles.optionPhoneTile}>
              <LicensingNextStepPhone />
              <p className={styles.optionPhoneCaption}>Built into your website</p>
              <Link href="/portfolio/scooter-shop">See the Scooter Shop approach <b>→</b></Link>
            </div>
          </div>
        </div>
        <div className="shell">
          <FlowCompare />
        </div>
      </section>

      <section className={`shell ${styles.problem}`}>
        <div>
          <p className={styles.sectionLabel}>04 / Remove the barrier</p>
          <h2>A signature should not require a showroom appointment.</h2>
        </div>
        <div className={styles.problemCopy}>
          <p>
            A customer can be ready to buy and still be stopped by the practical friction of getting to your store. Distance, work, family and opening hours all become reasons to delay.
          </p>
          <p>
            Let the paperwork do the travelling, not your customers.
          </p>
        </div>
      </section>

      <IdentityVerification />

      <Faq
        eyebrow="06 / Common questions"
        title="Before you sign up."
        items={questions.map(([question, answer]) => ({ question, answer }))}
      />
    </main>
  );
}
