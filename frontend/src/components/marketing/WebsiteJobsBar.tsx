import { ProcessStepsBar } from "@/components/ProcessStepsBar";

const jobs = ["Get found", "Get customers", "Get time back"] as const;

export function WebsiteJobsBar({ id = "website-hero-end" }: { id?: string }) {
  return <ProcessStepsBar id={id} ariaLabel="Three jobs your website should do" steps={jobs} />;
}
