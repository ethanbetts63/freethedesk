import { SplitFeatureSection } from '@/components/SplitFeatureSection';

import { SeoAnalysisVisual } from './SeoAnalysisVisual';

export function SeoAnalysis({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="analyse"
      eyebrow={eyebrow}
      title="We look at what"
      accentTitle="Google looks at."
      description="Connect Search Console and we'll tell you what it's saying. We read it alongside your Business Profile, analytics and other data sources, a crawl of the site and what AI answers say about you, then run 23 foundation checks."
      visual={<SeoAnalysisVisual />}
      textSide="left"
      background="white"
      spacing="joined"
    />
  );
}
