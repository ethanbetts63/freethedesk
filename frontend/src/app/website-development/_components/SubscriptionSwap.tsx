import { PrimaryButton } from "@/components/PrimaryButton";
import styles from "./SubscriptionSwap.module.css";

   
                                                                               
                                                                                
                                                                    
   
const steps: [string, string][] = [
  ["Add up the bill", "Every tool you pay for monthly or annually, including the ones nobody remembers signing up for."],
  [
    "Find what you actually use",
    "It is usually a fraction of what you are paying for. That fraction is the specification for the build.",
  ],
  [
    "Price a build against it",
    "If it will not come out cheaper to run, or genuinely better to use, we tell you that instead.",
  ],
];

export function SubscriptionSwap() {
  return (
    <section className={styles.section} id="subscriptions">
      <div className="shell">
        <div className={styles.heading}>
          <p className={styles.label}>03 / What you&apos;re paying for</p>
          <h2>
            Stop renting features <span className="moving-colour-text">you don&apos;t use.</span>
          </h2>
          <p className={styles.lead}>
            Most businesses pay for four or five tools every month and use one feature from each. We add up what that
            costs, work out which parts you actually touch, and price a build against the bill. The answer is different
            every time—which is why this starts as a conversation, not a package.
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

        <PrimaryButton className={styles.cta} href="#enquiry" direction="down">
          Tell us what you&apos;re paying for
        </PrimaryButton>
      </div>
    </section>
  );
}
