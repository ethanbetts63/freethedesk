import Link from "next/link";

import type { PublicSiteSettings } from "@/lib/api";
import { formatPrice } from "@/lib/serverApi";
import { AiReadinessAudit } from "./AiReadinessAudit";
import { GoogleBusinessProfileAudit } from "./GoogleBusinessProfileAudit";
import styles from "../page.module.css";

type PlanCopy = {
  field: keyof PublicSiteSettings;
  name: string;
  cadence: string;
  summary: string;
  recommended?: boolean;
};

const PLANS: PlanCopy[] = [
  {
    field: "seo_monthly_price",
    name: "Monthly",
    cadence: "/ report, billed monthly",
    summary: "For a new site, a migration or a competitive push. We'll tell you when to slow down.",
  },
  {
    field: "seo_quarterly_price",
    name: "Quarterly",
    cadence: "/ report, billed quarterly",
    summary: "Long enough for a change to show its full effect. Report, implement, measure, repeat.",
    recommended: true,
  },
  {
    field: "seo_biannual_price",
    name: "Bi-annual",
    cadence: "/ report, billed every 6 months",
    summary: "Two check-ins a year for a stable site that just needs watching.",
  },
  {
    field: "seo_oneoff_price",
    name: "One-off report",
    cadence: "once, no subscription",
    summary: "A single deep-dive. Costs the most per report, because it only happens once.",
  },
];

/** Prices come from SiteSettings so they can be edited from the admin dashboard. */
export function SeoPlans({ settings }: { settings: PublicSiteSettings }) {
  return (
    <>
      <div className={styles.planGrid}>
        {PLANS.map((plan) => (
          <article className={`${styles.planCard} ${plan.recommended ? styles.planRecommended : ""}`} key={plan.field}>
            <span className={`${styles.planTopline} ${plan.recommended ? "moving-colour-text" : ""}`}>{plan.recommended ? "Recommended" : "Report plan"}</span>
            <strong>{plan.name}</strong>
            <span className={styles.planPrice}>
              {formatPrice(settings[plan.field])} <small>{plan.cadence}</small>
            </span>
            <p>{plan.summary}</p>
            <ul className={styles.planIncluded}>
              <li>Free Google Business Profile audit</li>
              <li>Free AI readiness check</li>
            </ul>
            <Link className={styles.planCta} href="/contact">Get started <span>→</span></Link>
          </article>
        ))}
      </div>

      <GoogleBusinessProfileAudit standalonePrice={formatPrice(settings.gbp_audit_price)} />
      <AiReadinessAudit standalonePrice={formatPrice(settings.ai_readiness_audit_price)} />
    </>
  );
}
