import { ProcessStepsBar } from "@/components/ProcessStepsBar";

export function AutomationStepsBar() {
  return (
    <ProcessStepsBar
      id="automation-hero-end"
      ariaLabel="Our three-step automation process"
      steps={["Identify", "Budget", "Automate"]}
    />
  );
}
