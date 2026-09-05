"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckoutElementsProvider, PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout";

import { SignalFlow } from "../../home-v3/SignalFlow";
import { useAuth } from "@/context/AuthContext";
import { acceptDealerSubscriptionTerms, createSubscriptionCheckout, getDealerAccount, type DealerAccount } from "@/lib/dealerApi";
import { getLicensingSettings } from "@/lib/api";
import { stripeConfigured, stripePromise } from "@/lib/stripe";
import { buildDealerPlans, planByCode, type DealerPlan } from "../plans";
import styles from "./page.module.css";

function PaymentForm({ planName }: { planName: string }) {
  const result = useCheckoutElements();
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (result.type !== "success" || !result.checkout.canConfirm || !accepted) return;
    setSubmitting(true);
    setError("");
    try {
      await acceptDealerSubscriptionTerms();
      const confirmed = await result.checkout.confirm({
        returnUrl: `${window.location.origin}/licensing/payment/complete`,
      });
      if (confirmed.type === "error") setError(confirmed.error.message || "Payment could not be confirmed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Payment could not be confirmed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result.type === "loading") return <div className={styles.paymentLoading}>Loading secure card entry…</div>;
  if (result.type === "error") return <p className={styles.paymentError}>{result.error.message}</p>;

  return (
    <form className={styles.paymentForm} onSubmit={submit}>
      <div className={styles.paymentHeading}>
        <span>Secure payment</span>
        <h2>Start {planName}.</h2>
        <p>Your card details are encrypted and handled directly by Stripe.</p>
      </div>
      <PaymentElement />
      <label className={styles.consent}>
        <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
        <span>I agree to the <Link href="/legal/dealer-subscription-terms" target="_blank">Dealer Subscription Terms</Link>, acknowledge the <Link href="/legal/privacy" target="_blank">Privacy Policy</Link>, and authorise this monthly subscription.</span>
      </label>
      {error && <p className={styles.paymentError} role="alert">{error}</p>}
      <button className={styles.payButton} disabled={!result.checkout.canConfirm || !accepted || submitting}>
        <span>{submitting ? "Confirming…" : "Start subscription"}</span><b>→</b>
      </button>
      <p className={styles.paymentFineprint}>Prices include GST. Your account opens immediately after Stripe confirms payment.</p>
    </form>
  );
}

export function SubscriptionPaymentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const started = useRef(false);
  const [dealer, setDealer] = useState<DealerAccount | null>(null);
  const [plans, setPlans] = useState<DealerPlan[]>([]);
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "dealer") {
      router.replace(`/login?next=${encodeURIComponent("/licensing/payment")}`);
      return;
    }
    if (started.current) return;
    started.current = true;

    Promise.all([getDealerAccount(), getLicensingSettings()])
      .then(async ([account, settings]) => {
        setDealer(account);
        setPlans(buildDealerPlans(settings));
        if (account.plan === "demo") {
          router.replace("/portal/overview");
          return;
        }
        if (account.payment_status === "active") {
          router.replace("/portal/overview");
          return;
        }
        if (!stripeConfigured) throw new Error("Stripe is not configured yet. Add the publishable key to continue.");
        const checkout = await createSubscriptionCheckout();
        setClientSecret(checkout.client_secret);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to prepare payment."));
  }, [authLoading, router, user]);

  const plan = dealer ? planByCode(plans, dealer.plan) : undefined;

  return (
    <main className={styles.checkoutPage}>
      <section className={styles.summarySide}>
        <div className={styles.signal}><SignalFlow /></div>
        <div className={styles.summaryContent}>
          <Link className={styles.brand} href="/">free<span>the</span>desk<i>.</i></Link>
          <Link className={styles.back} href="/licensing">← Change plan</Link>
          <div className={styles.summaryCopy}>
            <p>Selected product</p>
            <h1>{plan?.name ?? "Your subscription"}</h1>
            <span>{plan?.summary ?? "Preparing your secure checkout."}</span>
          </div>
          {plan && (
            <div className={styles.orderSummary}>
              <div><span>Monthly subscription</span><strong>{plan.price}</strong></div>
              <div><span>GST</span><strong>Included</strong></div>
              <div className={styles.orderTotal}><span>Due monthly</span><strong>{plan.price} <small>GST inc.</small></strong></div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.paymentSide}>
        {error ? (
          <div className={styles.checkoutState}>
            <span>Checkout unavailable</span><h2>We could not load payment.</h2><p>{error}</p>
            <button onClick={() => window.location.reload()}>Try again</button>
          </div>
        ) : clientSecret && plan ? (
          <CheckoutElementsProvider
            stripe={stripePromise}
            options={{
              clientSecret,
              elementsOptions: {
                appearance: {
                  theme: "stripe",
                  variables: { colorPrimary: "#247ec9", colorText: "#0d1c29", borderRadius: "0px", fontFamily: "Arial, sans-serif" },
                },
              },
            }}
          >
            <PaymentForm planName={plan.name} />
          </CheckoutElementsProvider>
        ) : (
          <div className={styles.checkoutState}><span>Secure checkout</span><h2>Preparing payment…</h2><p>Connecting your dealer account to Stripe.</p></div>
        )}
      </section>
    </main>
  );
}
