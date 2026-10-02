import { SplitFeatureSection } from '@/components/SplitFeatureSection';

import { SeoImprovementVisual } from './SeoImprovementVisual';

export function SeoImprovement({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="improve"
      eyebrow={eyebrow}
      title="Make the change."
      accentTitle="Measure what it earned."
      description="SEO compounds through iteration. Once a change is live, fresh data shows whether it worked and which clicks it brought in. The next report starts from there, so every cycle builds on the last."
      visual={<SeoImprovementVisual />}
      textSide="left"
      background="white"
      spacing="joined"
    />
  );
}
