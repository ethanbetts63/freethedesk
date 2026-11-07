import { SplitFeatureSection } from '@/components/SplitFeatureSection';

import { SampleReportLink } from './SampleReportLink';
import { SeoAnalysisVisual } from './SeoAnalysisVisual';

export function SeoAnalysis({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="analyse"
      eyebrow={eyebrow}
      title="What the audit checks:"
      accentTitle="technical SEO, local SEO and AI search."
      description="Whether Google can reach and index every page, how fast the pages load on a phone, structured data, broken links and redirects, your Google Business Profile and reviews, and whether AI crawlers can read the site. Many sources go in; one ranked list of recommendations comes out."
      visual={<SeoAnalysisVisual />}
      textSide="left"
      background="white"
      spacing="joined"
      action={<SampleReportLink />}
    />
  );
}
