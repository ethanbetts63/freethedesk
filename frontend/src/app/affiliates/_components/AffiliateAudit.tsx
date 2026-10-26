import { SplitFeatureSection } from '@/components/SplitFeatureSection';

import { SampleReportLink } from '@/app/seo/_components/SampleReportLink';
import { SeoAnalysisVisual } from '@/app/seo/_components/SeoAnalysisVisual';

/** What the affiliate is selling: the SEO page's own picture of what an audit reads. */
export function AffiliateAudit({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="audit"
      eyebrow={eyebrow}
      title="What you're selling."
      accentTitle="Growth."
      description="Many data sources go in. One ranked list of recommendations comes out. Every call backed by data, third-party studies and experience."
      visual={<SeoAnalysisVisual />}
      textSide="right"
      background="white"
      spacing="joined"
      action={<SampleReportLink />}
    />
  );
}
