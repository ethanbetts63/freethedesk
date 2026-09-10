import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionNumber } from "@/components/SectionNumber";
import styles from "./SubscriptionSwap.module.css";

const steps: [string, string][] = [
  [
    "Add up the bill",
    "Every tool you pay for monthly or annually, including the ones nobody remembers signing up for.",
  ],
  ["Find what you actually use", "Every subscription comes with features. We only have to rebuild the ones you use."],
  [
    "Price a build against it",
    "If it will not come out cheaper to run, or genuinely better to use, we tell you that instead.",
  ],
];

export function SubscriptionSwap({ eyebrow, showCta = true }: { eyebrow: string; showCta?: boolean }) {
  return (
    <section className={styles.section} id="subscriptions">
      <div className="shell">
        <div className={styles.heading}>
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2>
            Not another <span className="moving-colour-text">****ing subscription.</span>
          </h2>
          <p className={styles.lead}>
            Most businesses pay for four or five tools every month and use one feature from each. We add up what that
            costs, work out which parts you actually touch, and price a build against the bill. Stop renting. Own the
            tools you use.
          </p>
        </div>

        <ol className={styles.steps}>
          {steps.map(([title, body], index) => (
            <li key={title}>
              <span className={styles.stepIndex}>{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <p>{body}</p>
            </li>
          ))}
        </ol>

        {showCta && (
          <PrimaryButton className={styles.cta} href="#enquiry" direction="down">
            Discuss your website
          </PrimaryButton>
        )}
      </div>
    </section>
  );
}
