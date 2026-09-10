import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { AutomationBudgetVisual } from "./AutomationBudgetVisual";

export function AutomationBudgetSplit({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="budget"
      eyebrow={eyebrow}
      title="Bring us the budget."
      accentTitle="We'll bring you the plan."
      description="You give us the constraint. We compare the opportunities we identified and recommend the most valuable automation we can complete within it."
      visual={<AutomationBudgetVisual />}
      textSide="right"
      background="white"
      spacing="joined"
    />
  );
}
