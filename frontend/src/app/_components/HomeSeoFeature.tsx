import { CtaButton } from '@/components/CtaButton';
import { SeoReportOverview } from '@/components/SeoReportOverview';

export function HomeSeoFeature() {
  return (
    <SeoReportOverview
      id="seo-reporting"
      className="my-3xl mb-2xl bg-surface-tint py-section"
      eyebrow="SEO reporting"
      title="A ranked SEO action plan."
      accentTitle="Written for humans."
      description={
        <div className="flex flex-col gap-l [&>span]:block">
          <span>
            Human-written reports that show where Perth customers search and don&apos;t find you,
            then rank the fixes by value. Choose an ongoing SEO report, a one-time Google Business
            Profile audit, or both. The AI readiness check is free.
          </span>
          <CtaButton className="self-start tracking-label-tight" href="/seo" size="compact">
            Explore SEO reports
          </CtaButton>
        </div>
      }
    />
  );
}
