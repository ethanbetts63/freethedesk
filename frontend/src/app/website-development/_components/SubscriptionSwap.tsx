import { PrimaryButton } from "@/components/PrimaryButton";
import styles from "./SubscriptionSwap.module.css";

/**
 * Reframes the build cost as a payback against the customer's existing monthly
 * tool spend. Deliberately sells the conversation rather than a fixed outcome —
 * every stack is different, and some of them are better left alone.
 */
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

const worthALook = [
  "Booking and enquiry widgets bolted onto your site",
  "Form builders, popups and review collectors",
  "Per-seat tools where you only use one feature",
  "Single-job plugins carrying a monthly fee",
  "Email tools you keep for one automated message",
];

const leaveAlone = [
  ["Payments", "Stripe and anything else moving money"],
  ["Accounting", "Xero, MYOB and your bookkeeper's workflow"],
  ["Email and files", "Google Workspace, Microsoft 365"],
  ["Anything regulated", "Systems holding records you are required to keep"],
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

        <div className={styles.split}>
          <div className={styles.worth}>
            <h3>Usually worth a look</h3>
            <ul>
              {worthALook.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.keep}>
            <h3>We&apos;d leave alone</h3>
            <dl>
              {leaveAlone.map(([term, detail]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>
            <p>Replacing these is a bad idea. If you ask us to, we will say so and explain why.</p>
          </div>
        </div>

        <p className={styles.footnote}>
          Custom software is not free to run—there is still hosting and maintenance, and we would rather say that up
          front. The goal is not zero subscriptions. It is fewer of them, better connected to everything else, and the
          ones left over being ones you would happily keep.
        </p>

        <PrimaryButton className={styles.cta} href="#enquiry">
          Tell us what you&apos;re paying for
        </PrimaryButton>
      </div>
    </section>
  );
}
