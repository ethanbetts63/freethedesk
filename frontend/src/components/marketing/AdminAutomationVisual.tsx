import { StatusPanelVisual } from "@/components/visuals/StatusPanelVisual";

const defaultJobs = [
  "Lead capture & routing",
  "Customer onboarding",
  "Booking & reminders",
  "CRM & system sync",
  "Invoicing & payments",
] as const;

export function AdminAutomationVisual({
  jobs = defaultJobs,
  eyebrow = "Runs in the background",
  title = "Your website",
}: {
  jobs?: readonly string[];
  eyebrow?: string;
  title?: string;
}) {
  return (
    <StatusPanelVisual
      eyebrow={eyebrow}
      title={title}
      countLabel={`${jobs.length} jobs`}
      items={jobs.map((title) => ({ title, tag: "Automated" }))}
      ariaLabel="Examples of administrative work that can be automated"
    />
  );
}
