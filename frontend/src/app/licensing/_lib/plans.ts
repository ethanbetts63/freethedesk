import { formatPrice, type PublicSiteSettings } from "@/lib/api";
import { planByCode, type Plan } from "@/lib/plans";
import type { DealerPlanCode } from "@/lib/dealerApi";

export type { DealerPlanCode };
export type DealerPlan = Plan<DealerPlanCode>;
export { formatPrice, planByCode };

export type LicensingPrices = Pick<PublicSiteSettings, "licensing_price" | "contracts_price" | "complete_price">;

function priceAmount(value: string): number {
  if (!value.trim()) return Number.MAX_SAFE_INTEGER;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : Number.MAX_SAFE_INTEGER;
}

const PRICE_FIELD: Record<DealerPlanCode, keyof LicensingPrices> = {
  licensing: "licensing_price",
  contracts: "contracts_price",
  complete: "complete_price",
};

const PLAN_COPY: Omit<DealerPlan, "price">[] = [
  {
    code: "licensing",
    name: "Online licensing",
    cadence: "/ month, GST inc.",
    summary: "Move vehicle licensing out of the showroom and onto any device.",
    features: ["Online licensing journey", "Dealer and customer portals", "Delivery or pickup handover"],
  },
  {
    code: "contracts",
    name: "Online contracts",
    cadence: "/ month, GST inc.",
    summary: "Prepare and sign your dealership sales contracts online.",
    features: ["Online sales contracts", "Secure customer signing", "Completed records for your team"],
  },
  {
    code: "complete",
    name: "Licensing + contracts",
    cadence: "/ month, GST inc.",
    summary: "The complete path from customer decision to ready for handover.",
    features: ["Everything in online licensing", "Everything in online contracts", "One connected customer journey"],
    recommended: true,
  },
];

export function buildDealerPlans(settings: LicensingPrices): DealerPlan[] {
  return PLAN_COPY.map((plan) => ({ ...plan, price: formatPrice(settings[PRICE_FIELD[plan.code]]) })).sort(
    (a, b) => priceAmount(settings[PRICE_FIELD[a.code]]) - priceAmount(settings[PRICE_FIELD[b.code]]),
  );
}
