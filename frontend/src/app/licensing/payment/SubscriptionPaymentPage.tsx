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
import { createSubscriptionCheckout, getDealerAccount, type DealerAccount } from "@/lib/dealerApi";
import { getSiteSettings } from "@/lib/api";
import { stripeConfigured, stripePromise, STRIPE_ELEMENTS_OPTIONS } from "@/lib/stripe";
import { buildDealerPlans, planByCode, type DealerPlan } from "../_lib/plans";

const RETURN_PATH = "/licensing/payment/complete";

export function SubscriptionPaymentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const started = useRef(false);
  const [dealer, setDealer] = useState<DealerAccount | null>(null);
  const [plans, setPlans] = useState<DealerPlan[]>([]);
  const [clientSecret, setClientSecret] = useState("");
  const [quotedMonthlyPrice, setQuotedMonthlyPrice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "dealer") {
      router.replace(`/login?next=${encodeURIComponent("/licensing/payment")}`);
      return;
    }
    if (started.current) return;
    started.current = true;

    Promise.all([getDealerAccount(), getSiteSettings()])
      .then(([account, settings]) => {
        setDealer(account);
        setPlans(buildDealerPlans(settings));
        if (account.payment_status === "active") {
          router.replace("/portal/overview");
          return;
        }
        if (!stripeConfigured) throw new Error("Stripe is not configured yet. Add the publishable key to continue.");
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to prepare payment."));
  }, [authLoading, router, user]);

  const plan = dealer ? planByCode(plans, dealer.plan) : undefined;
  const displayedPrice = quotedMonthlyPrice
    ? `$${Number(quotedMonthlyPrice).toLocaleString("en-AU", { maximumFractionDigits: 2 })}`
    : plan?.price;

  async function prepareCheckout() {
    setError("");
    try {
      const checkout = await createSubscriptionCheckout();
      setQuotedMonthlyPrice(checkout.monthly_price);
      setClientSecret(checkout.client_secret);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to prepare payment.");
    }
  }

  return (
    <CheckoutShell
      productLabel="Selected product"
      productName={plan?.name ?? "Your subscription"}
      productSummary={plan?.summary ?? "Preparing your secure checkout."}
      order={
        plan && displayedPrice
          ? { lineLabel: "Monthly subscription", price: displayedPrice, dueLabel: "Due monthly" }
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
            heading={`Start ${plan.name}.`}
            submitLabel="Start subscription"
            returnPath={RETURN_PATH}
          />
        </CheckoutElementsProvider>
      ) : dealer && plan ? (
        <CheckoutTermsForm
          priceNote="Your GST-inclusive monthly price and the exact terms accepted are saved with this checkout."
          termsHref="/legal/dealer-subscription-terms"
          termsLabel="Dealer Subscription Terms"
          authorisation="authorise this monthly subscription."
          onConfirm={prepareCheckout}
        />
      ) : (
        <CheckoutState
          eyebrow="Secure checkout"
          title="Preparing payment…"
          body="Connecting your dealer account to Stripe."
        />
      )}
    </CheckoutShell>
  );
}
