import type { Metadata } from "next";
import Link from "next/link";

import { FlowHeroConcept } from "../home-v3/FlowHeroConcept";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { FlowCompare } from "./FlowCompare";
import { LicensingNextStepPhone } from "./LicensingNextStepPhone";
import { LoginPreviewPhone } from "./LoginPreviewPhone";
import { SignupPlans } from "./SignupPlans";
import styles from "./page.module.css";

const licensingStats: [ProofStat, ProofStat, ProofStat] = [
  { value: "72%", label: "Want licensing online", description: "Of car buyers say they'd rather complete paperwork online, per Cox Automotive research." },
  { value: "45 min", label: "Saved per customer", description: "Average time saved at the dealership when paperwork starts online." },
  { value: "24 / 7", label: "Always available", description: "Customers can verify, sign and pay at any time, without booking a dealership appointment." },
];

export const metadata: Metadata = {
  title: "Online Vehicle Licensing",
  description: "Let customers verify their identity, complete vehicle licensing and sign paperwork online without an unnecessary dealership visit.",
};

const outcomes = [
  ["Fewer barriers to a sale", "The customer can keep moving while their decision is fresh, even when they live nowhere near the dealership."],
  ["Less administration", "Information flows into the paperwork once, reducing re-keying, follow-up calls and incomplete forms."],
  ["A better customer experience", "A clear guided journey replaces appointments, printing, scanning and long email chains."],
];

export default function LicensingPage() {
  return (
    <main className={styles.page}>
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
            <p className={styles.sectionLabel}>A shorter path to sold</p>
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
            <p className={styles.sectionLabel}>01 / Two ways to use it</p>
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
          <p className={styles.sectionLabel}>02 / Remove the barrier</p>
          <h2>A signature should not require a showroom appointment.</h2>
        </div>
        <div className={styles.problemCopy}>
          <p>
            A customer can be ready to buy and still be stopped by the practical friction of getting to your store. Distance, work, family and opening hours all become reasons to delay.
          </p>
          <p>
            Online licensing removes that dead time. The paperwork reaches the customer, the completed sale returns to your team, and delivery can become the final step instead of another obstacle.
          </p>
        </div>
      </section>

      <section className={`shell ${styles.outcomesSection}`}>
        <div className={styles.sectionHeading}>
          <p className={styles.sectionLabel}>03 / What changes</p>
          <h2>Better for the customer. Better for the desk.</h2>
        </div>
        <div className={styles.outcomeGrid}>
          {outcomes.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className={`shell ${styles.closing}`}>
        <p className={styles.sectionLabel}>Make the next sale easier</p>
        <h2>Let the paperwork travel.<br />Not the customer.</h2>
        <p>We will map the licensing flow to your dealership, your vehicles and the way your team already works.</p>
        <div>
          <Link href="/contact">Talk about online licensing <span>↗</span></Link>
          <Link href="/dealership-website-builder">Try the Licensing Demo <span>→</span></Link>
        </div>
      </section>
    </main>
  );
}
