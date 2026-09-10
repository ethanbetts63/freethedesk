import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { LicensingFillVisual } from "./LicensingFillVisual";

export function LicensingFill({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="licensing-details"
      eyebrow={eyebrow}
      title="Dealer starts it."
      accentTitle="Customer finishes it."
      description="Your team enters the vehicle details and sends a secure link. The customer opens it and fills in their own details—no retyping or dealership visit required."
      visual={<LicensingFillVisual />}
      textSide="left"
      spacing="joined"
    />
  );
}
