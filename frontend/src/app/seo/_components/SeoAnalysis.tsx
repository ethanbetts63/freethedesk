import { SplitFeatureSection } from '@/components/SplitFeatureSection';

import type { SeoPageCopy } from '../_lib/pageCopy';
import { SampleReportLink } from './SampleReportLink';
import { SeoAnalysisVisual } from './SeoAnalysisVisual';

export function SeoAnalysis({ eyebrow, copy }: { eyebrow: string; copy: SeoPageCopy['analyse'] }) {
  return (
    <SplitFeatureSection
      id="analyse"
      eyebrow={eyebrow}
      title={copy.title}
      accentTitle={copy.accentTitle}
      description={copy.description}
      visual={<SeoAnalysisVisual />}
      textSide="left"
      background="white"
      spacing="joined"
      action={<SampleReportLink />}
    />
  );
}
