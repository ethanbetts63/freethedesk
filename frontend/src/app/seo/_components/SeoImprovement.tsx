import { SplitFeatureSection } from '@/components/SplitFeatureSection';

import { SeoExperimentCard } from './SeoExperimentCard';

export function SeoImprovement({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="experiment"
      eyebrow={eyebrow}
      title="Every change is"
      accentTitle="an experiment."
      description="Each recommendation comes with a hypothesis, a metric and a target. Once a change ships it gets a baseline and a date, and the next cycle says whether it worked. What earns is kept and built on; what doesn't is dropped. Nobody has to guess whether the SEO is doing anything."
      visual={<SeoExperimentCard />}
      textSide="left"
      background="white"
      spacing="joined"
    />
  );
}
