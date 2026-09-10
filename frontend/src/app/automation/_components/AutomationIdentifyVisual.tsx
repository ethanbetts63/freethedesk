import { ReportCardVisual } from "@/components/visuals/ReportCardVisual";

const signals = [
  ["Repeats often", "The task happens every day or every week.", "Repeat"],
  ["Follows rules", "The next action can be clearly defined.", "Rules"],
  ["Moves information", "Details are copied between people or systems.", "Handoff"],
  ["Has a measurable cost", "Time, delays or mistakes can be compared.", "Measure"],
] as const;

export function AutomationIdentifyVisual() {
  return (
    <ReportCardVisual
      title="Automation opportunity scan"
      subtitle="Your business · current workflow"
      badge="4 signals"
      items={signals.map(([title, description, tag]) => ({ title, description, tag }))}
      footerItems={["Frequent", "Predictable", "Worth fixing"]}
      ariaLabel="Signals that identify a useful automation opportunity"
    />
  );
}
