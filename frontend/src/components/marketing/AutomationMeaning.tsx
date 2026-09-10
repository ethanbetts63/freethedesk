import Link from "next/link";
import type { ReactNode } from "react";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionNumber } from "@/components/SectionNumber";
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
  title?: ReactNode;
  id?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  showPrimaryAction?: boolean;
  jobs?: readonly string[];
  compactTitle?: boolean;
};

export function AutomationMeaning({
  eyebrow,
  description,
  primaryHref,
  primaryLabel,
  panelTitle,
  title = "Automate admin.",
  id,
  secondaryHref,
  secondaryLabel,
  showPrimaryAction = true,
  jobs = AUTOMATION_JOBS,
  compactTitle = false,
}: AutomationMeaningProps) {
  return (
    <section className={`shell ${styles.section}`} id={id}>
      <div className={styles.layout}>
        <div className={`${styles.copy} ${compactTitle ? styles.compactTitle : ""}`}>
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2>{title}</h2>
          <p className={styles.description}>{description}</p>
          {(showPrimaryAction || (secondaryHref && secondaryLabel)) && (
            <div className={styles.actions}>
              {showPrimaryAction && (
                <PrimaryButton href={primaryHref} direction={primaryHref.startsWith("#") ? "down" : "page"}>
                  {primaryLabel}
                </PrimaryButton>
              )}
              {secondaryHref && secondaryLabel && (
                <Link href={secondaryHref}>
                  {secondaryLabel} <span aria-hidden="true">↗</span>
                </Link>
              )}
            </div>
          )}
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
            <span className={styles.panelCount}>{jobs.length} jobs</span>
          </header>
          <ol className={styles.list}>
            {jobs.map((title, index) => (
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
