import { SplitFeatureSection } from '@/components/SplitFeatureSection';

import { SeoAnalysisVisual } from './SeoAnalysisVisual';

export function SeoAnalysis({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="analyze"
      eyebrow={eyebrow}
      title="Find the growth."
      accentTitle="Not just the errors."
      description="We combine your live Search Console data with a technical review of your site and what Perth customers actually search for, then use human judgement to keep the opportunities worth your time and drop the noise."
      visual={<SeoAnalysisVisual />}
      textSide="left"
      background="white"
      spacing="joined"
    />
  );
}
