"use client";

import { PaymentConfirmation, type ConfirmationResult } from "@/components/checkout/PaymentConfirmation";
import { getSeoAccount } from "@/lib/seoApi";

async function check(): Promise<ConfirmationResult> {
  const account = await getSeoAccount();
  if (account.payment_status === "active" || account.payment_status === "paid") {
    return { status: "active", next: account.has_usable_password ? "/seo-portal/overview" : "/seo-portal/account" };
  }
  if (account.payment_status === "past_due" || account.payment_status === "cancelled") return { status: "failed" };
  return { status: "pending" };
}

export function PaymentComplete() {
  return (
    <PaymentConfirmation
      check={check}
      copy={{
        checking: [
          "Confirming your payment.",
          "Stripe is securely completing the payment. This usually takes only a few seconds.",
        ],
        active: ["Payment confirmed.", "Your SEO account is open. Taking you to the next step now."],
        failed: [
          "Payment needs attention.",
          "Stripe could not confirm the payment. You can return to secure payment and try again.",
        ],
        delayed: [
          "Confirmation is taking longer than usual.",
          "Your payment may still be successful. Open the portal to check the latest account status.",
        ],
      }}
      retryHref="/seo/payment"
      portalHref="/seo-portal/overview"
      portalLabel="Open SEO portal"
    />
  );
}
