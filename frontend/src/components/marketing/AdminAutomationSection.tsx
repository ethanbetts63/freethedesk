import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { AdminAutomationVisual } from "./AdminAutomationVisual";

export function AdminAutomationSection({
  eyebrow,
  id,
  spacing = "standard",
}: {
  eyebrow: string;
  id?: string;
  spacing?: "standard" | "joined";
}) {
  return (
    <SplitFeatureSection
      id={id}
      eyebrow={eyebrow}
      title="Let your website"
      accentTitle="automate the admin."
      description="Automation means your website handles the repetitive work around each customer—capturing details, moving them between systems, sending follow-ups and keeping the next step moving without someone doing it by hand."
      visual={<AdminAutomationVisual />}
      textSide="left"
      spacing={spacing}
    />
  );
}
