import Link from "next/link";

import styles from "./page.module.css";

type Step = { title: string; caption?: string };

const hostedSteps: Step[] = [
  { title: "Log in to our portal" },
  { title: "Enter the vehicle details" },
  { title: "Send the customer their secure link" },
  { title: "Customer signs online" },
  { title: "Paperwork lands back in your queue" },
];

const builtInSteps: Step[] = [
  { title: "Customer checks out on your website" },
  { title: "Customer signs and pays online" },
  { title: "Paperwork lands in your queue" },
];

function FlowColumn({
  label,
  badge,
  steps,
  highlight,
  eyebrow,
  cta,
}: {
  label: string;
  badge: string;
  steps: Step[];
  highlight?: boolean;
  eyebrow?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className={`${styles.flowColumn} ${highlight ? styles.flowColumnHighlight : ""}`}>
      {eyebrow && <p className={styles.flowEyebrow}>{eyebrow}</p>}
      <header className={styles.flowColumnHead}>
        <span>{label}</span>
        <b>{badge}</b>
      </header>
      <ol className={styles.flowStepsList}>
        {steps.map((step) => (
          <li key={step.title}>
            <span className={styles.flowStepText}>
              <strong>{step.title}</strong>
              {step.caption && <small>{step.caption}</small>}
            </span>
          </li>
        ))}
      </ol>
      {cta && (
        <Link className={styles.flowColumnCta} href={cta.href}>
          {cta.label} <span>↗</span>
        </Link>
      )}
    </div>
  );
}

/** What your team actually does for each setup: the hosted portal (manual entry) vs. built into your website (automatic). */
export function FlowCompare() {
  return (
    <div className={styles.flowCompare}>
      <p className={styles.flowCompareLabel}>What your team does</p>
      <div className={styles.flowGrid}>
        <FlowColumn label="Hosted portal" badge="5 steps, you enter each sale" steps={hostedSteps} />
        <FlowColumn
          label="Built into your website"
          badge="4 steps, nothing to re-key"
          steps={builtInSteps}
          highlight
          eyebrow="Recommended"
          cta={{ href: "/dealership-website-builder", label: "Dealer Web Demo" }}
        />
      </div>
    </div>
  );
}
