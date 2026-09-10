import { formatPrice, type PublicSiteSettings } from "@/lib/api";
import { planByCode, type Plan } from "@/lib/plans";
import type { SeoPlanCode, SeoReportType } from "@/lib/seoApi";

export type { SeoPlanCode, SeoReportType };
export type SeoPlan = Plan<SeoPlanCode>;
export { formatPrice, planByCode };

export const REPORT_TYPES: { code: SeoReportType; name: string }[] = [
  { code: "gbp", name: "One-time GBP audit" },
  { code: "seo", name: "Recurring SEO reports" },
  { code: "both", name: "GBP audit + recurring SEO" },
];

export function reportTypeLabel(reportType: SeoReportType): string {
  return REPORT_TYPES.find(({ code }) => code === reportType)?.name ?? "Report";
}

export function buildSeoPlans(settings: PublicSiteSettings, reportType: SeoReportType = "both"): SeoPlan[] {
  const gbpPrice = Number(settings.gbp_audit_price);
  const reportSummary = {
    gbp: "A one-time Google Business Profile audit and local-search action list.",
    seo: "Recurring website SEO reports with a fresh prioritised action list each cycle.",
    both: "A one-time Google Business Profile audit followed by recurring website SEO reports.",
  }[reportType];
  const features = {
    gbp: ["Google Business Profile review", "Local-search action list"],
    seo: ["Website SEO review", "Human-written action plan"],
    both: ["Recurring website SEO review", "One-time Google Business Profile audit", "Prioritised action plans"],
  }[reportType];

  const recurringFrequencies = [
    ["monthly", "Monthly", settings.seo_monthly_price, "/ report, billed monthly"],
    ["quarterly", "Quarterly", settings.seo_quarterly_price, "/ report, billed quarterly"],
    ["biannual", "Bi-annual", settings.seo_biannual_price, "/ report, billed every 6 months"],
  ] as const;

  if (reportType === "gbp") {
    return [
      {
        code: "oneoff",
        name: "One-time audit",
        price: formatPrice(String(gbpPrice)),
        cadence: "once, no subscription",
        summary: reportSummary,
        features,
        recommended: true,
      },
    ];
  }

  return recurringFrequencies.map(([code, name, seoPrice, cadence]) => {
    const numericSeoPrice = Number(seoPrice);
    const price = reportType === "seo" ? numericSeoPrice : numericSeoPrice + gbpPrice;
    return {
      code,
      name,
      price: formatPrice(String(price)),
      cadence:
        reportType === "both" ? `first payment, then ${formatPrice(String(numericSeoPrice))} ${cadence}` : cadence,
      summary: reportSummary,
      features,
      recommended: code === "quarterly",
    };
  });
}
