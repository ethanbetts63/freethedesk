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
      description="Every recommendation you implement becomes an experiment, in your next report. We track our decisions numerically. What earns is kept and built on; what doesn't is dropped."
      visual={<SeoExperimentCard />}
      textSide="left"
      background="white"
      spacing="joined"
      action={<SampleReportLink />}
    />
  );
}
