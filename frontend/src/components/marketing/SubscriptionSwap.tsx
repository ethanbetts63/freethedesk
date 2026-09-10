import { PrimaryButton } from "@/components/PrimaryButton";
import { IndexedFeatureSection, type IndexedFeature } from "./IndexedFeatureSection";
import styles from "./SubscriptionSwap.module.css";

const defaultSteps: readonly IndexedFeature[] = [
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

const defaultLead =
  "Most businesses pay for four or five tools every month and use one feature from each. We add up what that costs, work out which parts you actually touch, and price a build against the bill. Stop renting. Own the tools you use.";

export function SubscriptionSwap({
  eyebrow,
  showCta = true,
  lead = defaultLead,
  steps = defaultSteps,
}: {
  eyebrow: string;
  showCta?: boolean;
  lead?: string;
  steps?: readonly IndexedFeature[];
}) {
  return (
    <IndexedFeatureSection
      id="subscriptions"
      eyebrow={eyebrow}
      title="Not another"
      accentTitle="****ing subscription."
      lead={lead}
      items={steps}
      footer={
        showCta ? (
          <PrimaryButton className={styles.cta} href="#enquiry" direction="down">
            Discuss your website
          </PrimaryButton>
        ) : undefined
      }
    />
  );
}
