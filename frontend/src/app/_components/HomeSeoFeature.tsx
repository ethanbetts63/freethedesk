import { PrimaryButton } from "@/components/PrimaryButton";
import { SeoReportOverview } from "@/components/SeoReportOverview";

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
            Human-written reports that turn your search data into ranked next steps. Choose an ongoing website SEO
            report, a one-time Google Business Profile audit, or use both. The AI readiness check is free.
          </span>
          <PrimaryButton className="self-start tracking-[0.06em]" href="/seo" size="compact">
            Explore SEO reports
          </PrimaryButton>
        </div>
      }
    />
  );
}
