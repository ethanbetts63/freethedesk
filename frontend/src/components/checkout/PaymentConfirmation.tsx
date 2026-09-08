"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SignalFlow } from "@/components/visuals/SignalFlow";
import styles from "./checkout.module.css";

type ConfirmationState = "checking" | "active" | "failed" | "delayed";

export type ConfirmationResult = { status: "active"; next: string } | { status: "failed" } | { status: "pending" };

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 15;
const REDIRECT_DELAY_MS = 900;

/**
 * Post-Stripe return screen. Stripe redirects here before the webhook has
 * necessarily landed, so the account is polled until it activates, fails, or
 * we give up and point the customer at their portal.
 */
export function PaymentConfirmation({
  check,
  copy,
  retryHref,
  portalHref,
  portalLabel,
}: {
  check: () => Promise<ConfirmationResult>;
  copy: Record<ConfirmationState, readonly [string, string]>;
  retryHref: string;
  portalHref: string;
  portalLabel: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<ConfirmationState>("checking");
  const checkRef = useRef(check);
  useEffect(() => {
    checkRef.current = check;
  }, [check]);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const result = await checkRef.current();
        if (cancelled) return;
        if (result.status === "active") {
          setState("active");
          timeout = setTimeout(() => router.replace(result.next), REDIRECT_DELAY_MS);
          return;
        }
        if (result.status === "failed") {
          setState("failed");
          return;
        }
      } catch {
        // A transient error is indistinguishable from "not settled yet"; retry.
      }
      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) setState("delayed");
      else timeout = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [router]);

  const [title, body] = copy[state];

  return (
    <main className={styles.completePage}>
      <div className={styles.completeSignal}>
        <SignalFlow />
      </div>
      <section className={styles.completeCard}>
        <span>{state === "active" ? "✓" : "···"}</span>
        <h1>{title}</h1>
        <p>{body}</p>
        {state === "failed" && <Link href={retryHref}>Return to payment</Link>}
        {state === "delayed" && <Link href={portalHref}>{portalLabel}</Link>}
      </section>
    </main>
  );
}
