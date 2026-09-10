import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { LicensingChooseVisual } from "./LicensingChooseVisual";

export function LicensingChoose({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="licensing-details"
      eyebrow={eyebrow}
      title="Start with the sale."
      accentTitle="Not another form."
      description="Vehicle, purchaser and transaction details become one licensing file. Information already captured stays captured instead of being typed again."
      visual={<LicensingChooseVisual />}
      textSide="left"
      spacing="joined"
    />
  );
}
