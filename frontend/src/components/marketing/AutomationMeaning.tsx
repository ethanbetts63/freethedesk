import Link from "next/link";

import { PrimaryButton } from "@/components/PrimaryButton";
import styles from "./AutomationMeaning.module.css";

const AUTOMATION_JOBS = [
  "Lead capture & routing",
  "Customer onboarding",
  "Booking & reminders",
  "CRM & system sync",
  "Invoicing & payments",
  "Document generation",
];

type AutomationMeaningProps = {
  eyebrow: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  panelTitle: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function AutomationMeaning({
  eyebrow,
  description,
  primaryHref,
  primaryLabel,
  panelTitle,
  secondaryHref,
  secondaryLabel,
}: AutomationMeaningProps) {
  return (
    <section className={`shell ${styles.section}`}>
      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className={styles.label}>{eyebrow}</p>
          <h2>Automate admin.</h2>
          <p className={styles.description}>{description}</p>
          <div className={styles.actions}>
            <PrimaryButton href={primaryHref} direction={primaryHref.startsWith("#") ? "down" : "page"}>
              {primaryLabel}
            </PrimaryButton>
            {secondaryHref && secondaryLabel && (
              <Link href={secondaryHref}>
                {secondaryLabel} <span aria-hidden="true">↗</span>
              </Link>
            )}
          </div>
        </div>

        <div className={styles.panel} aria-label="Examples of administrative work that can be automated">
          <header className={styles.panelHead}>
            <div>
              <span className={styles.panelDot} aria-hidden="true" />
              <span>
                <small>Runs in the background</small>
                <strong>{panelTitle}</strong>
              </span>
            </div>
            <span className={styles.panelCount}>{AUTOMATION_JOBS.length} jobs</span>
          </header>
          <ol className={styles.list}>
            {AUTOMATION_JOBS.map((title, index) => (
              <li key={title}>
                <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.check} aria-hidden="true">
                  ✓
                </span>
                <strong className={styles.itemTitle}>{title}</strong>
                <span className={styles.tag}>Automated</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
