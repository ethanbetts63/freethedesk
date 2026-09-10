import { PrimaryButton } from "@/components/PrimaryButton";
import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { AutomationFeatureVisual } from "./AutomationFeatureVisual";

export function AutomationFeature() {
  return (
    <SplitFeatureSection
      id="automation"
      eyebrow="Business automation"
      title="Automation built"
      accentTitle="around your business."
      description="We connect the systems you already use and build the missing pieces, so information moves without your team moving it by hand."
      action={
        <PrimaryButton href="/automation" size="compact">
          Explore business automation
        </PrimaryButton>
      }
      visual={<AutomationFeatureVisual />}
      textSide="right"
    />
  );
}
