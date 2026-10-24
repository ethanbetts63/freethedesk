import { SplitFeatureSection } from '@/components/SplitFeatureSection';

import { SampleReportLink } from './SampleReportLink';

import { SeoExperimentCard } from './SeoExperimentCard';

export function SeoImprovement({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="experiment"
      eyebrow={eyebrow}
      title="Every change is"
      accentTitle="an experiment."
      description="Every recommendation you implement becomes an experiment, with a baseline and a ship date. A Complete audit looks again three months on and shows which changes worked, and so does any later audit. What earns is kept and built on; what doesn't is dropped."
      visual={<SeoExperimentCard />}
      textSide="left"
      background="white"
      spacing="joined"
      action={<SampleReportLink />}
    />
  );
}
