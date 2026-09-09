import { loadStripe } from "@stripe/stripe-js";

import { BRAND_ACCENT, BRAND_INK } from "./brand";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export const stripeConfigured = Boolean(publishableKey);
export const stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null);

export const STRIPE_ELEMENTS_OPTIONS = {
  appearance: {
    theme: "stripe",
    variables: {
      colorPrimary: BRAND_ACCENT,
      colorText: BRAND_INK,
      borderRadius: "0px",
      fontFamily: "Arial, sans-serif",
    },
  },
} as const;
