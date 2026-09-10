import { FlowCardVisual } from "@/components/visuals/FlowCardVisual";

export function AutomationBudgetVisual() {
  return (
    <FlowCardVisual
      browserLabel="automation plan"
      inputs={[
        { label: "Your budget", title: "$5,000", description: "Fixed constraint" },
        { label: "Identified automation", title: "Lead handling", description: "Ranked opportunity" },
      ]}
      result={{
        label: "Highest-value build",
        title: "Automated lead routing",
        description: "Scoped to fit the budget",
      }}
      ariaLabel="How an identified automation becomes a budgeted build"
    />
  );
}
