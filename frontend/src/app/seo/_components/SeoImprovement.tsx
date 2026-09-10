import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { SeoImprovementVisual } from "./SeoImprovementVisual";

export function SeoImprovement({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="improve"
      eyebrow={eyebrow}
      title="Make the change."
      accentTitle="Measure what happens."
      description="SEO compounds through iteration. Act on the best opportunity, let new data collect, then use the next report to decide what deserves attention."
      visual={<SeoImprovementVisual />}
      textSide="left"
      background="white"
      spacing="joined"
    />
  );
}
