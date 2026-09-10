import { ProcessIntroduction } from "@/components/ProcessIntroduction";

const steps = [
  { title: "Identify", description: "Find the repetitive admin costing your team time every week." },
  { title: "Budget", description: "Set the constraint so we can prioritise the most valuable automation." },
  { title: "Automate", description: "Connect the tools and automate work that does not need human judgement." },
] as const;

export function AutomationIntroduction() {
  return (
    <ProcessIntroduction
      id="automation-overview"
      eyebrow="How we work"
      title="Three steps."
      accentTitle="Countless hours automated."
      items={steps}
    />
  );
}
