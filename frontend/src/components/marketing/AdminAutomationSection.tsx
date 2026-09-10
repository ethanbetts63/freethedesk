import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { AdminAutomationVisual } from "./AdminAutomationVisual";

const defaultDescription =
  "Automation means your website handles the repetitive work around each customer—capturing details, moving them between systems, sending follow-ups and keeping the next step moving without someone doing it by hand.";

export function AdminAutomationSection({
  eyebrow,
  id,
  spacing = "standard",
  description = defaultDescription,
  jobs,
  panelEyebrow,
  panelTitle,
}: {
  eyebrow: string;
  id?: string;
  spacing?: "standard" | "joined";
  description?: string;
  jobs?: readonly string[];
  panelEyebrow?: string;
  panelTitle?: string;
}) {
  return (
    <SplitFeatureSection
      id={id}
      eyebrow={eyebrow}
      title="Let your website"
      accentTitle="automate the admin."
      description={description}
      visual={<AdminAutomationVisual jobs={jobs} eyebrow={panelEyebrow} title={panelTitle} />}
      textSide="left"
      spacing={spacing}
    />
  );
}
