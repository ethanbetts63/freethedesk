"use client";

import { FormEvent, ReactNode, useState } from "react";
import Link from "next/link";
import { PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout";

import { SignalFlow } from "@/components/visuals/SignalFlow";
import styles from "./checkout.module.css";

/**
 * Layout and lifecycle chrome shared by every checkout (dealer subscriptions,
 * SEO reports). Each product supplies its own account loading, plan lookup and
 * copy; everything visual lives here so the two flows cannot drift apart.
 */

export type CheckoutOrder = {
  lineLabel: string;
  price: string;
  dueLabel: string;
};

export function CheckoutShell({
  productLabel,
  productName,
  productSummary,
  order,
  children,
}: {
  productLabel: string;
  productName: string;
  productSummary: string;
  order?: CheckoutOrder;
  children: ReactNode;
}) {
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
            <p>{productLabel}</p>
            <h1>{productName}</h1>
            <span>{productSummary}</span>
          </div>
          {order && (
            <div className={styles.orderSummary}>
              <div>
                <span>{order.lineLabel}</span>
                <strong>{order.price}</strong>
              </div>
              <div>
                <span>GST</span>
                <strong>Included</strong>
              </div>
              <div className={styles.orderTotal}>
                <span>{order.dueLabel}</span>
                <strong>
                  {order.price} <small>GST inc.</small>
                </strong>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.paymentSide}>{children}</section>
    </main>
  );
}

export function CheckoutState({
  eyebrow,
  title,
  body,
  onRetry,
}: {
  eyebrow: string;
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div className={styles.checkoutState}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{body}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

/**
 * Step one: record the accepted terms before any card details are collected.
 * Owns its own checkbox and in-flight state so the pages stay declarative.
 */
export function CheckoutTermsForm({
  priceNote,
  termsHref,
  termsLabel,
  authorisation,
  onConfirm,
}: {
  priceNote: string;
  termsHref: string;
  termsLabel: string;
  authorisation: string;
  onConfirm: () => Promise<void>;
}) {
  const [accepted, setAccepted] = useState(false);
  const [preparing, setPreparing] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accepted || preparing) return;
    setPreparing(true);
    try {
      await onConfirm();
    } finally {
      setPreparing(false);
    }
  }

  return (
    <form className={styles.paymentForm} onSubmit={submit}>
      <div className={styles.paymentHeading}>
        <span>Before payment</span>
        <h2>Confirm the offer.</h2>
        <p>{priceNote}</p>
      </div>
      <label className={styles.consent}>
        <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
        <span>
          I agree to the{" "}
          <Link href={termsHref} target="_blank">
            {termsLabel}
          </Link>
          , acknowledge the{" "}
          <Link href="/legal/privacy" target="_blank">
            Privacy Policy
          </Link>
          , and {authorisation}
        </span>
      </label>
      <button type="submit" className={styles.payButton} disabled={!accepted || preparing}>
        <span>{preparing ? "Preparing secure payment…" : "Continue to secure payment"}</span>
        <b>→</b>
      </button>
    </form>
  );
}

/** Step two: the Stripe Payment Element and its confirmation. */
export function CheckoutPaymentForm({
  heading,
  submitLabel,
  returnPath,
}: {
  heading: string;
  submitLabel: string;
  returnPath: string;
}) {
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
        returnUrl: `${window.location.origin}${returnPath}`,
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
        <h2>{heading}</h2>
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
        <span>{submitting ? "Confirming…" : submitLabel}</span>
        <b>→</b>
      </button>
      <p className={styles.paymentFineprint}>
        Prices include GST. Your account opens immediately after Stripe confirms payment.
      </p>
    </form>
  );
}
