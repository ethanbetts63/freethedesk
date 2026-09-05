"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SignalFlow } from "../../../home-v3/SignalFlow";
import { getDealerAccount } from "@/lib/dealerApi";
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
        const dealer = await getDealerAccount();
        if (cancelled) return;
        if (dealer.payment_status === "active") {
          setState("active");
          timeout = setTimeout(() => router.replace("/portal/overview"), 900);
          return;
        }
        if (dealer.payment_status === "past_due" || dealer.payment_status === "cancelled") {
          setState("failed");
          return;
        }
      } catch {
        // Brief API or webhook timing gaps are retried below.
      }
      attempts += 1;
      if (attempts >= 15) setState("delayed");
      else timeout = setTimeout(check, 2000);
    };

    check();
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [router]);

  const copy = state === "active"
    ? ["Payment confirmed.", "Your dealer account is open. Taking you to the next setup step now."]
    : state === "failed"
      ? ["Payment needs attention.", "Stripe could not activate the subscription. You can return to secure payment and try again."]
      : state === "delayed"
        ? ["Confirmation is taking longer than usual.", "Your payment may still be successful. Open the portal to check the latest account status."]
        : ["Confirming your subscription.", "Stripe is securely completing the payment. This usually takes only a few seconds."];

  return (
    <main className={styles.completePage}>
      <div className={styles.completeSignal}><SignalFlow /></div>
      <section className={styles.completeCard}>
        <span>{state === "active" ? "✓" : "···"}</span>
        <h1>{copy[0]}</h1>
        <p>{copy[1]}</p>
        {state === "failed" && <Link href="/licensing/payment">Return to payment</Link>}
        {state === "delayed" && <Link href="/portal/overview">Open dealer portal</Link>}
      </section>
    </main>
  );
}
