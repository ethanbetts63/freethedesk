"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SignalFlow } from "@/components/visuals/SignalFlow";
import { getSeoAccount } from "@/lib/seoApi";
import styles from "../page.module.css";

type ConfirmationState = "checking" | "active" | "failed" | "delayed";

export function PaymentComplete() {
  const router = useRouter();
  const [state, setState] = useState<ConfirmationState>("checking");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const check = async () => {
      try {
        const account = await getSeoAccount();
        if (cancelled) return;
        if (account.payment_status === "active" || account.payment_status === "paid") {
          setState("active");
          timeout = setTimeout(
            () => router.replace(account.has_usable_password ? "/seo-portal/overview" : "/seo-portal/account"),
            900,
          );
          return;
        }
        if (account.payment_status === "past_due" || account.payment_status === "cancelled") {
          setState("failed");
          return;
        }
      } catch {

      }
      attempts += 1;
      if (attempts >= 15) setState("delayed");
      else timeout = setTimeout(check, 2000);
    };

    check();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [router]);

  const copy =
    state === "active"
      ? ["Payment confirmed.", "Your SEO account is open. Taking you to the next step now."]
      : state === "failed"
        ? [
            "Payment needs attention.",
            "Stripe could not confirm the payment. You can return to secure payment and try again.",
          ]
        : state === "delayed"
          ? [
              "Confirmation is taking longer than usual.",
              "Your payment may still be successful. Open the portal to check the latest account status.",
            ]
          : [
              "Confirming your payment.",
              "Stripe is securely completing the payment. This usually takes only a few seconds.",
            ];

  return (
    <main className={styles.completePage}>
      <div className={styles.completeSignal}>
        <SignalFlow />
      </div>
      <section className={styles.completeCard}>
        <span>{state === "active" ? "✓" : "···"}</span>
        <h1>{copy[0]}</h1>
        <p>{copy[1]}</p>
        {state === "failed" && <Link href="/seo/payment">Return to payment</Link>}
        {state === "delayed" && <Link href="/seo-portal/overview">Open SEO portal</Link>}
      </section>
    </main>
  );
}
