import { PrimaryButton } from "@/components/PrimaryButton";
import { SeoReportOverview } from "@/components/SeoReportOverview";
import styles from "@/components/marketing/marketingPage.module.css";

export function HomeSeoFeature() {
  return (
    <SeoReportOverview
      id="seo-reporting"
      className={styles.seoSection}
      eyebrow="SEO reporting"
      title="A ranked SEO action plan."
      accentTitle="Written for humans."
      description={
        <div className={styles.seoSummary}>
          <span>
            Human-written reports that turn your search data into ranked next steps. Choose an ongoing website SEO
            report, a one-time Google Business Profile audit, or use both. The AI readiness check is free.
          </span>
          <PrimaryButton className={styles.seoSummaryCta} href="/seo" size="compact">
            Explore SEO reports
          </PrimaryButton>
        </div>
      }
    />
  );
}
