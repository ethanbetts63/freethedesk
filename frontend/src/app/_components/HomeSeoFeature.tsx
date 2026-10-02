import { CtaButton } from '@/components/CtaButton';
import { SeoReportOverview } from '@/components/SeoReportOverview';

export function HomeSeoFeature() {
  return (
    <SeoReportOverview
      id="seo-reporting"
      className="my-3xl mb-2xl bg-surface-tint py-section"
      eyebrow="SEO Perth"
      title="A ranked SEO action plan."
      accentTitle="Written for humans."
      description={
        <div className="flex flex-col gap-l [&>span]:block">
          <span>
            We find where Perth customers search and don&apos;t find you, rank what to change by
            value, and measure every change as an experiment. One-off or ongoing; the AI readiness
            check is free.
          </span>
          <CtaButton className="self-start tracking-label-tight" href="/seo" size="compact">
            Explore SEO
          </CtaButton>
        </div>
      }
    />
  );
}
