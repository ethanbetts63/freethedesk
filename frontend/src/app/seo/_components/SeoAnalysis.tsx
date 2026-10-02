import { SplitFeatureSection } from '@/components/SplitFeatureSection';

import { SeoAnalysisVisual } from './SeoAnalysisVisual';

export function SeoAnalysis({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="analyse"
      eyebrow={eyebrow}
      title="We look at what"
      accentTitle="Google looks at."
      description="Search Console, your Google Business Profile, your analytics and your enquiries, read together with a crawl of the site, a walk through it as a customer, page speed and what AI answers say about you. Then 23 foundation checks, each a pass, warn or fail, and a person to separate real opportunities from noise."
      visual={<SeoAnalysisVisual />}
      textSide="left"
      background="white"
      spacing="joined"
    />
  );
}
