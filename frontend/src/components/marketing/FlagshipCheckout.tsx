import { PrimaryButton } from "@/components/PrimaryButton";
import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { FlagshipCheckoutVisual } from "./FlagshipCheckoutVisual";

const bullets = [
  "Licensing & sales documents",
  "Identity verification",
  "Optional payment & delivery handling",
] as const;

export function FlagshipCheckout() {
  return (
    <SplitFeatureSection
      id="online-purchasing"
      eyebrow="Online vehicle licensing"
      title="Sell & License."
      accentTitle="Entirely online."
      description="Let customers purchase, complete their paperwork and arrange handover without needing to visit the dealership."
      bullets={bullets}
      action={
        <PrimaryButton href="/licensing" size="compact">
          Explore online licensing
        </PrimaryButton>
      }
      visual={<FlagshipCheckoutVisual />}
      textSide="right"
      background="tint"
    />
  );
}
