import { SplitFeatureSection } from '@/components/SplitFeatureSection';

import { SampleReportLink } from './SampleReportLink';

import { SeoAnalysisVisual } from './SeoAnalysisVisual';

export function SeoAnalysis({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="analyse"
      eyebrow={eyebrow}
      title="We look at what"
      accentTitle="Google looks at."
      description="Many data sources go in. One ranked list of recommendations comes out. Every call backed by data, third-party studies and experience."
      visual={<SeoAnalysisVisual />}
      textSide="left"
      background="white"
      spacing="joined"
      action={<SampleReportLink />}
    />
  );
}
