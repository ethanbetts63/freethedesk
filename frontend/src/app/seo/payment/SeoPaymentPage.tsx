"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckoutElementsProvider } from "@stripe/react-stripe-js/checkout";

import {
  CheckoutPaymentForm,
  CheckoutShell,
  CheckoutState,
  CheckoutTermsForm,
} from "@/components/checkout/CheckoutShell";
import { useAuth } from "@/context/AuthContext";
import { createSeoCheckout, getSeoAccount, type SeoAccount } from "@/lib/seoApi";
import { getSiteSettings } from "@/lib/api";
import { stripeConfigured, stripePromise, STRIPE_ELEMENTS_OPTIONS } from "@/lib/stripe";
import { buildSeoPlans, planByCode, reportTypeLabel, type SeoPlan } from "../_lib/plans";

const RETURN_PATH = "/seo/payment/complete";

const DUE_LABELS: Record<string, string> = {
  monthly: "Due monthly",
  quarterly: "Due every 3 months",
  biannual: "Due every 6 months",
  oneoff: "One-time payment",
};

export function SeoPaymentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const started = useRef(false);
  const [account, setAccount] = useState<SeoAccount | null>(null);
  const [plans, setPlans] = useState<SeoPlan[]>([]);
  const [clientSecret, setClientSecret] = useState("");
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

  async function prepareCheckout() {
    setError("");
    try {
      const checkout = await createSeoCheckout();
      setQuotedPrice(checkout.price);
      setClientSecret(checkout.client_secret);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to prepare payment.");
    }
  }

  return (
    <CheckoutShell
      productLabel={`Selected ${isAudit ? "product" : "plan"}`}
      productName={productName}
      productSummary={plan?.summary ?? "Preparing your secure checkout."}
      order={
        plan && displayedPrice
          ? {
              lineLabel: productName,
              price: displayedPrice,
              dueLabel: DUE_LABELS[account?.plan ?? "quarterly"] ?? "Due on checkout",
            }
          : undefined
      }
    >
      {error ? (
        <CheckoutState
          eyebrow="Checkout unavailable"
          title="We could not load payment."
          body={error}
          onRetry={() => window.location.reload()}
        />
      ) : clientSecret && plan ? (
        <CheckoutElementsProvider
          stripe={stripePromise}
          options={{ clientSecret, elementsOptions: STRIPE_ELEMENTS_OPTIONS }}
        >
          <CheckoutPaymentForm
            heading={oneOff ? `Pay for ${productName}.` : `Start ${productName}.`}
            submitLabel={isAudit ? "Pay for audit" : oneOff ? "Pay for report" : "Start subscription"}
            returnPath={RETURN_PATH}
          />
        </CheckoutElementsProvider>
      ) : account && plan ? (
        <CheckoutTermsForm
          priceNote="Your GST-inclusive price and the exact terms accepted are saved with this checkout."
          termsHref="/legal/seo-subscription-terms"
          termsLabel="SEO Reporting & Audit Terms"
          authorisation={`authorise this ${oneOff ? "payment" : "recurring subscription"}.`}
          onConfirm={prepareCheckout}
        />
      ) : (
        <CheckoutState
          eyebrow="Secure checkout"
          title="Preparing payment…"
          body="Connecting your SEO account to Stripe."
        />
      )}
    </CheckoutShell>
  );
}
