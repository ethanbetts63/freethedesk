import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { LicensingSignVisual } from "./LicensingSignVisual";

export function LicensingSign({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="sign-online"
      eyebrow={eyebrow}
      title="Sign online."
      accentTitle="Keep the sale moving."
      description="Customers review the details and sign the required documents online. Your team receives the completed file without another dealership visit."
      visual={<LicensingSignVisual />}
      textSide="left"
      spacing="joined"
    />
  );
}
