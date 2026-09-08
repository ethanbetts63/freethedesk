import { formatPrice, type PublicSiteSettings } from "@/lib/api";
import { planByCode, type Plan } from "@/lib/plans";
import type { SeoPlanCode, SeoReportType } from "@/lib/seoApi";

export type { SeoPlanCode, SeoReportType };
export type SeoPlan = Plan<SeoPlanCode>;
export { formatPrice, planByCode };

export const REPORT_TYPES: { code: SeoReportType; name: string }[] = [
  { code: "gbp", name: "GBP report" },
  { code: "seo", name: "SEO report" },
  { code: "both", name: "GBP + SEO" },
];

export function reportTypeLabel(reportType: SeoReportType): string {
  return REPORT_TYPES.find(({ code }) => code === reportType)?.name ?? "Report";
}

export function buildSeoPlans(settings: PublicSiteSettings, reportType: SeoReportType = "both"): SeoPlan[] {
  const gbpPrice = Number(settings.gbp_audit_price);
  const reportSummary = {
    gbp: "A focused Google Business Profile and local-search report.",
    seo: "A focused website SEO report and prioritised action list.",
    both: "Your website SEO report and Google Business Profile report together.",
  }[reportType];
  const features = {
    gbp: ["Google Business Profile review", "Local-search action list"],
    seo: ["Website SEO review", "Human-written action plan"],
    both: ["Website SEO review", "Google Business Profile review", "One prioritised action plan"],
  }[reportType];

  const frequencies = [
    ["monthly", "Monthly", settings.seo_monthly_price, "/ report, billed monthly"],
    ["quarterly", "Quarterly", settings.seo_quarterly_price, "/ report, billed quarterly"],
    ["biannual", "Bi-annual", settings.seo_biannual_price, "/ report, billed every 6 months"],
    ["oneoff", "One-off", settings.seo_oneoff_price, "once, no subscription"],
  ] as const;

  return frequencies.map(([code, name, seoPrice, cadence]) => {
    const numericSeoPrice = Number(seoPrice);
    const price =
      reportType === "gbp" ? gbpPrice : reportType === "seo" ? numericSeoPrice : numericSeoPrice + gbpPrice;
    return {
      code,
      name,
      price: formatPrice(String(price)),
      cadence,
      summary: reportSummary,
      features,
      recommended: code === "quarterly",
    };
  });
}
