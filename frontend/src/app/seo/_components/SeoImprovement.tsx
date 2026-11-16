import { SplitFeatureSection } from '@/components/SplitFeatureSection';

import type { SeoPageCopy } from '../_lib/pageCopy';
import { SampleReportLink } from './SampleReportLink';
import { SeoExperimentCard } from './SeoExperimentCard';

export function SeoImprovement({
  eyebrow,
  copy,
}: {
  eyebrow: string;
  copy: SeoPageCopy['experiment'];
}) {
  return (
    <SplitFeatureSection
      id="experiment"
      eyebrow={eyebrow}
      title={copy.title}
      accentTitle={copy.accentTitle}
      description={copy.description}
      visual={<SeoExperimentCard />}
      textSide="left"
      background="white"
      spacing="joined"
      action={<SampleReportLink />}
    />
  );
}
