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
      description="Connect Search Console and we'll tell you what it's saying. We read it alongside your site as a visitor uses it, the sites that outrank you and what AI answers say about you, and check the SEO fundamentals the research backs. Plus adds your Business Profile and analytics; Complete adds your ads and the rest."
      visual={<SeoAnalysisVisual />}
      textSide="left"
      background="white"
      spacing="joined"
      action={<SampleReportLink />}
    />
  );
}
