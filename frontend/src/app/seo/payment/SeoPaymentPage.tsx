"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckoutElementsProvider, PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout";

import { SignalFlow } from "@/components/visuals/SignalFlow";
import { useAuth } from "@/context/AuthContext";
import { createSeoCheckout, getSeoAccount, type SeoAccount } from "@/lib/seoApi";
import { getSiteSettings } from "@/lib/api";
import { stripeConfigured, stripePromise, STRIPE_ELEMENTS_OPTIONS } from "@/lib/stripe";
import { buildSeoPlans, planByCode, reportTypeLabel, type SeoPlan } from "../_lib/plans";
import styles from "./page.module.css";

function PaymentForm({ planName, oneOff, isAudit }: { planName: string; oneOff: boolean; isAudit: boolean }) {
  const result = useCheckoutElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (result.type !== "success" || !result.checkout.canConfirm) return;
    setSubmitting(true);
    setError("");
    try {
      const confirmed = await result.checkout.confirm({
        returnUrl: `${window.location.origin}/seo/payment/complete`,
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
        <h2>{oneOff ? `Pay for ${planName}.` : `Start ${planName}.`}</h2>
        <p>Your card details are encrypted and handled directly by Stripe.</p>
      </div>
      <PaymentElement />
      <p className={styles.paymentFineprint}>The selected offer and accepted terms are recorded with this checkout.</p>
      {error && (
        <p className={styles.paymentError} role="alert">
          {error}
        </p>
      )}
      <button type="submit" className={styles.payButton} disabled={!result.checkout.canConfirm || submitting}>
        <span>
          {submitting ? "Confirming…" : isAudit ? "Pay for audit" : oneOff ? "Pay for report" : "Start subscription"}
        </span>
        <b>→</b>
      </button>
      <p className={styles.paymentFineprint}>
        Prices include GST. Your account opens immediately after Stripe confirms payment.
      </p>
    </form>
  );
}

export function SeoPaymentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const started = useRef(false);
  const [account, setAccount] = useState<SeoAccount | null>(null);
  const [plans, setPlans] = useState<SeoPlan[]>([]);
  const [clientSecret, setClientSecret] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [quotedPrice, setQuotedPrice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "seo") {
      router.replace(`/login?next=${encodeURIComponent("/seo/payment")}`);
      return;
    }
    if (started.current) return;
    started.current = true;

    Promise.all([getSeoAccount(), getSiteSettings()])
      .then(([seoAccount, settings]) => {
        setAccount(seoAccount);
        setPlans(buildSeoPlans(settings, seoAccount.report_type));
        if (seoAccount.payment_status === "active" || seoAccount.payment_status === "paid") {
          router.replace("/seo-portal/overview");
          return;
        }
        if (!stripeConfigured) throw new Error("Stripe is not configured yet. Add the publishable key to continue.");
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to prepare payment."));
  }, [authLoading, router, user]);

  const plan = account ? planByCode(plans, account.plan) : undefined;
  const isAudit = account?.report_type === "gbp";
  const oneOff = account?.plan === "oneoff";
  const productName = account && plan ? `${reportTypeLabel(account.report_type)} · ${plan.name}` : "Your report";
  const displayedPrice = quotedPrice
    ? `$${Number(quotedPrice).toLocaleString("en-AU", { maximumFractionDigits: 2 })}`
    : plan?.price;
  const dueLabel = {
    monthly: "Due monthly",
    quarterly: "Due every 3 months",
    biannual: "Due every 6 months",
    oneoff: "One-time payment",
  }[account?.plan ?? "quarterly"];

  async function prepareCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!termsAccepted || preparing) return;
    setPreparing(true);
    setError("");
    try {
      const checkout = await createSeoCheckout();
      setQuotedPrice(checkout.price);
      setClientSecret(checkout.client_secret);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to prepare payment.");
    } finally {
      setPreparing(false);
    }
  }

  return (
    <main className={styles.checkoutPage}>
      <section className={styles.summarySide}>
        <div className={styles.signal}>
          <SignalFlow />
        </div>
        <div className={styles.summaryContent}>
          <Link className={styles.brand} href="/">
            free<span>the</span>desk<i>.</i>
          </Link>
          <div className={styles.summaryCopy}>
            <p>Selected {isAudit ? "product" : "plan"}</p>
            <h1>{productName}</h1>
            <span>{plan?.summary ?? "Preparing your secure checkout."}</span>
          </div>
          {plan && (
            <div className={styles.orderSummary}>
              <div>
                <span>{productName}</span>
                <strong>{displayedPrice}</strong>
              </div>
              <div>
                <span>GST</span>
                <strong>Included</strong>
              </div>
              <div className={styles.orderTotal}>
                <span>{dueLabel}</span>
                <strong>
                  {displayedPrice} <small>GST inc.</small>
                </strong>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.paymentSide}>
        {error ? (
          <div className={styles.checkoutState}>
            <span>Checkout unavailable</span>
            <h2>We could not load payment.</h2>
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        ) : clientSecret && plan ? (
          <CheckoutElementsProvider
            stripe={stripePromise}
            options={{ clientSecret, elementsOptions: STRIPE_ELEMENTS_OPTIONS }}
          >
            <PaymentForm planName={productName} oneOff={oneOff} isAudit={isAudit} />
          </CheckoutElementsProvider>
        ) : account && plan ? (
          <form className={styles.paymentForm} onSubmit={prepareCheckout}>
            <div className={styles.paymentHeading}>
              <span>Before payment</span>
              <h2>Confirm the offer.</h2>
              <p>Your GST-inclusive price and the exact terms accepted are saved with this checkout.</p>
            </div>
            <label className={styles.consent}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
              />
              <span>
                I agree to the{" "}
                <Link href="/legal/seo-subscription-terms" target="_blank">
                  SEO Reporting &amp; Audit Terms
                </Link>
                , acknowledge the{" "}
                <Link href="/legal/privacy" target="_blank">
                  Privacy Policy
                </Link>
                , and authorise this {oneOff ? "payment" : "recurring subscription"}.
              </span>
            </label>
            <button type="submit" className={styles.payButton} disabled={!termsAccepted || preparing}>
              <span>{preparing ? "Preparing secure payment…" : "Continue to secure payment"}</span>
              <b>→</b>
            </button>
          </form>
        ) : (
          <div className={styles.checkoutState}>
            <span>Secure checkout</span>
            <h2>Preparing payment…</h2>
            <p>Connecting your SEO account to Stripe.</p>
          </div>
        )}
      </section>
    </main>
  );
}
