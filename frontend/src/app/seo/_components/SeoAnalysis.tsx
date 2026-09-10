import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { SeoAnalysisVisual } from "./SeoAnalysisVisual";

export function SeoAnalysis({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="analyze"
      eyebrow={eyebrow}
      title="Start with evidence."
      accentTitle="Not assumptions."
      description="We combine live search data with a technical review of your site, then use human judgement to separate real opportunities from automated noise."
      visual={<SeoAnalysisVisual />}
      textSide="left"
      background="white"
      spacing="joined"
    />
  );
}
