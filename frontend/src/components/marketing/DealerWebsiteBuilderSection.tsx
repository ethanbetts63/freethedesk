import { PrimaryButton } from "@/components/PrimaryButton";
import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { WebsiteProductVisual } from "./WebsiteProductVisual";

const bullets = [
  "Inventory, vehicle, parts and service pages",
  "Online purchasing, licensing and contract signing",
  "A live builder you can explore before we talk",
] as const;

export function DealerWebsiteBuilderSection({ eyebrow, id = "customer-journeys" }: { eyebrow: string; id?: string }) {
  return (
    <SplitFeatureSection
      id={id}
      eyebrow={eyebrow}
      title="Build your dealership"
      accentTitle="website live."
      description="Shape a complete dealership website around your brand. Choose the capabilities you need, then explore every page as the demo changes in real time."
      bullets={bullets}
      action={
        <PrimaryButton href="/dealership-website-builder" size="compact">
          Try the free demo
        </PrimaryButton>
      }
      visual={<WebsiteProductVisual />}
      textSide="right"
      spacing="joined"
    />
  );
}
