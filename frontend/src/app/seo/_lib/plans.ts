import { formatPrice, type PublicSiteSettings } from "@/lib/api";
import { planByCode, type Plan } from "@/lib/plans";
import type { SeoPlanCode } from "@/lib/seoApi";

export type { SeoPlanCode };
export type SeoPlan = Plan<SeoPlanCode>;
export { formatPrice, planByCode };

/** Every plan bundles these; only the cadence line differs. */
const INCLUDED = ["Google Business Profile audit included", "AI readiness check included"];

/** Plan copy and features are static; prices come from SiteSettings so they can be edited from the admin dashboard. */
export function buildSeoPlans(settings: PublicSiteSettings): SeoPlan[] {
  return [
    {
      code: "monthly",
      name: "Monthly",
      price: formatPrice(settings.seo_monthly_price),
      cadence: "/ report, billed monthly",
      summary: "For a new site, a migration or a competitive push. We'll tell you when to slow down.",
      features: ["A report every month", ...INCLUDED],
    },
    {
      code: "quarterly",
      name: "Quarterly",
      price: formatPrice(settings.seo_quarterly_price),
      cadence: "/ report, billed quarterly",
      summary: "Long enough for a change to show its full effect. Report, implement, measure, repeat.",
      features: ["A report every three months", ...INCLUDED],
      recommended: true,
    },
    {
      code: "biannual",
      name: "Bi-annual",
      price: formatPrice(settings.seo_biannual_price),
      cadence: "/ report, billed every 6 months",
      summary: "Two check-ins a year for a stable site that just needs watching.",
      features: ["A report every six months", ...INCLUDED],
    },
    {
      code: "oneoff",
      name: "One-off report",
      price: formatPrice(settings.seo_oneoff_price),
      cadence: "once, no subscription",
      summary: "A single deep-dive. Costs the most per report, because it only happens once.",
      features: ["One report, paid once", ...INCLUDED],
    },
  ];
}
