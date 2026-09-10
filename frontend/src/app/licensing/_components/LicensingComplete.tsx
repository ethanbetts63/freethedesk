import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { LicensingCompleteVisual } from "./LicensingCompleteVisual";

export function LicensingComplete({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="complete-online"
      eyebrow={eyebrow}
      title="Sign and pay."
      accentTitle="Keep the sale moving."
      description="Customers review the details, sign the required documents and make any agreed payment online. Your team receives a complete file ready for handover."
      visual={<LicensingCompleteVisual />}
      textSide="left"
      spacing="joined"
    />
  );
}
