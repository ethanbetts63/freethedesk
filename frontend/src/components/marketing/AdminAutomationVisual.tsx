import { StatusPanelVisual } from "@/components/visuals/StatusPanelVisual";

const jobs = [
  "Lead capture & routing",
  "Customer onboarding",
  "Booking & reminders",
  "CRM & system sync",
  "Invoicing & payments",
] as const;

export function AdminAutomationVisual() {
  return (
    <StatusPanelVisual
      eyebrow="Runs in the background"
      title="Your website"
      countLabel={`${jobs.length} jobs`}
      items={jobs.map((title) => ({ title, tag: "Automated" }))}
      ariaLabel="Examples of administrative work that can be automated"
    />
  );
}
