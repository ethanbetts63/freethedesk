import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { LicensingVerifyVisual } from "./LicensingVerifyVisual";

export function LicensingVerify({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="identity-verification"
      eyebrow={eyebrow}
      title="Know who's signing."
      accentTitle="Before they sign."
      description="Stripe Identity checks the customer's licence and matches it to a live selfie before the paperwork moves forward."
      visual={<LicensingVerifyVisual />}
      textSide="right"
      spacing="joined"
    />
  );
}
