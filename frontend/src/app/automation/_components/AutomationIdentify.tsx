import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { AutomationIdentifyVisual } from "./AutomationIdentifyVisual";

export function AutomationIdentify({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="identify"
      eyebrow={eyebrow}
      title="Identify the busywork."
      accentTitle="Automate it."
      description="We look for repetitive, rules-based admin that costs time every week. The best first automation is easy to define and useful enough to measure."
      visual={<AutomationIdentifyVisual />}
      textSide="left"
      background="white"
      spacing="joined"
    />
  );
}
