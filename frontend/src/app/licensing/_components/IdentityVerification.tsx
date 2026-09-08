import Image from "next/image";

import { PrimaryButton } from "@/components/PrimaryButton";
import styles from "../page.module.css";

const steps = [
  {
    title: "Upload their license",
    detail: "Clear photos of the front and back",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6h18v12H3zM7.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM5 15.5c.4-1.6 1.9-2.5 2.5-2.5s2.1.9 2.5 2.5M13 9h6M13 13h4" />
      </svg>
    ),
  },
  {
    title: "Take a selfie",
    detail: "A live photo, matched against the ID",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 8a2 2 0 0 1 2-2h1l1-2h8l1 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8ZM12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
      </svg>
    ),
  },
  {
    title: "Verified automatically",
    detail: "Stripe checks the document and face in seconds",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3ZM9 12l2 2 4-4" />
      </svg>
    ),
  },
];

                                                                                                         
export function IdentityVerification() {
  return (
    <section className={`shell ${styles.verify}`}>
      <div className={styles.verifyCopy}>
        <p className={styles.sectionLabel}>05 / Know who&apos;s signing</p>
        <h2>Identity verification by Stripe.</h2>
        <p>
          Anyone can type a name into a form. Before the paperwork goes through, we confirm the person on the other end
          really is who they say they are.
        </p>
        <p>
          Verification runs on Stripe Identity, part of Stripe — one of the world&apos;s largest and most trusted
          payment platforms, used by millions of businesses globally.
        </p>
        <PrimaryButton className={styles.sectionCta} href="#signup" direction="down">
          Choose your plan
        </PrimaryButton>
      </div>

      <div className={styles.verifyCard}>
        <header className={styles.verifyCardHead}>
          <span>How it works</span>
          <b>~60 seconds</b>
        </header>
        <ol className={styles.verifySteps}>
          {steps.map((step, index) => (
            <li key={step.title}>
              <div className={styles.verifyIcon}>{step.icon}</div>
              <div>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.title}</strong>
                <small>{step.detail}</small>
              </div>
            </li>
          ))}
        </ol>
        <div className={styles.verifyFooter}>
          <span>Identity Verification by</span>
          <Image className={styles.verifyLogo} src="/stripe-ar21.svg" alt="Stripe" width={120} height={60} />
        </div>
      </div>
    </section>
  );
}
