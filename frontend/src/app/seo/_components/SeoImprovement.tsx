import { SplitFeatureSection } from '@/components/SplitFeatureSection';

import { SeoExperimentCard } from './SeoExperimentCard';

export function SeoImprovement({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="experiment"
      eyebrow={eyebrow}
      title="Every change is"
      accentTitle="an experiment."
      description="Every recommendation you implement becomes an experiment. It gets a baseline and a ship date, and the next cycle shows whether it worked. What earns is kept and built on; what doesn't is dropped."
      visual={<SeoExperimentCard />}
      textSide="left"
      background="white"
      spacing="joined"
    />
  );
}
