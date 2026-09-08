"use client";

import { PaymentConfirmation, type ConfirmationResult } from "@/components/checkout/PaymentConfirmation";
import { getDealerAccount } from "@/lib/dealerApi";

async function check(): Promise<ConfirmationResult> {
  const dealer = await getDealerAccount();
  if (dealer.payment_status === "active") return { status: "active", next: "/portal/overview" };
  if (dealer.payment_status === "past_due" || dealer.payment_status === "cancelled") return { status: "failed" };
  return { status: "pending" };
}

export function PaymentComplete() {
  return (
    <PaymentConfirmation
      check={check}
      copy={{
        checking: [
          "Confirming your subscription.",
          "Stripe is securely completing the payment. This usually takes only a few seconds.",
        ],
        active: ["Payment confirmed.", "Your dealer account is open. Taking you to the next setup step now."],
        failed: [
          "Payment needs attention.",
          "Stripe could not activate the subscription. You can return to secure payment and try again.",
        ],
        delayed: [
          "Confirmation is taking longer than usual.",
          "Your payment may still be successful. Open the portal to check the latest account status.",
        ],
      }}
      retryHref="/licensing/payment"
      portalHref="/portal/overview"
      portalLabel="Open dealer portal"
    />
  );
}
