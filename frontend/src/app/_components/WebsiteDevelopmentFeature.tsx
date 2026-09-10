import { PrimaryButton } from "@/components/PrimaryButton";
import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { WebsiteDevelopmentFeatureVisual } from "./WebsiteDevelopmentFeatureVisual";

const bullets = [
  "Conversion-first customer journeys",
  "Useful tools for customers and staff",
  "Integrations that remove repeated admin",
] as const;

export function WebsiteDevelopmentFeature() {
  return (
    <SplitFeatureSection
      id="websites"
      eyebrow="Website development"
      title="Websites should"
      accentTitle="work harder."
      description="Custom websites that convert users and automate the repetitive work behind your business."
      bullets={bullets}
      action={
        <PrimaryButton href="/website-development" size="compact">
          Explore website development
        </PrimaryButton>
      }
      visual={<WebsiteDevelopmentFeatureVisual />}
      textSide="left"
    />
  );
}
