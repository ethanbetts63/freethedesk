export type DealerPlanCode = "demo" | "licensing" | "contracts" | "complete";

export type DealerPlan = {
  code: DealerPlanCode;
  name: string;
  price: string;
  cadence: string;
  summary: string;
  features: string[];
  recommended?: boolean;
};

export interface LicensingSettings {
  licensing_price: string;
  contracts_price: string;
  complete_price: string;
  updated_at: string;
}

function formatPrice(value: string): string {
  const amount = Number(value);
  return `$${amount.toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/** Plan copy and features are static; prices come from LicensingSettings so they can be edited from the admin dashboard. */
export function buildDealerPlans(settings: LicensingSettings): DealerPlan[] {
  const plans = [
    {
      code: "demo" as const,
      name: "Try the licensing demo",
      amount: 0,
      price: "$0",
      cadence: "No card required",
      summary: "Explore the dealer and customer journey before going live.",
      features: ["Dealer licensing demo access", "Sample customer journey", "No live transactions"],
    },
    {
      code: "licensing" as const,
      name: "Online licensing",
      amount: Number(settings.licensing_price),
      price: formatPrice(settings.licensing_price),
      cadence: "/ month, GST inc.",
      summary: "Move vehicle licensing out of the showroom and onto any device.",
      features: ["Online licensing journey", "Dealer and customer portals", "Delivery or pickup handover"],
    },
    {
      code: "contracts" as const,
      name: "Online contracts",
      amount: Number(settings.contracts_price),
      price: formatPrice(settings.contracts_price),
      cadence: "/ month, GST inc.",
      summary: "Prepare and sign your dealership sales contracts online.",
      features: ["Online sales contracts", "Secure customer signing", "Completed records for your team"],
    },
    {
      code: "complete" as const,
      name: "Licensing + contracts",
      amount: Number(settings.complete_price),
      price: formatPrice(settings.complete_price),
      cadence: "/ month, GST inc.",
      summary: "The complete path from customer decision to ready for handover.",
      features: ["Everything in online licensing", "Everything in online contracts", "One connected customer journey"],
      recommended: true,
    },
  ];

  return plans
    .sort((a, b) => a.amount - b.amount)
    .map(({ amount: _amount, ...plan }) => plan);
}

export function planByCode(plans: DealerPlan[], code: string) {
  return plans.find((plan) => plan.code === code);
}
