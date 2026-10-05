'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { CheckoutForm, CheckoutShell, CheckoutState } from '@/components/checkout/CheckoutShell';
import { useAuth } from '@/context/AuthContext';
import { createSubscriptionCheckout, getDealerAccount, type DealerAccount } from '@/lib/dealerApi';
import { getSiteSettings } from '@/lib/api';
import { stripeConfigured } from '@/lib/stripe';
import { buildDealerPlans, planByCode, type DealerPlan } from '../_lib/plans';
import { formatMoney } from '@/lib/formatting';

export function SubscriptionPaymentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const started = useRef(false);
  const [dealer, setDealer] = useState<DealerAccount | null>(null);
  const [plans, setPlans] = useState<DealerPlan[]>([]);
  const [clientSecret, setClientSecret] = useState('');
  const [quotedMonthlyPrice, setQuotedMonthlyPrice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'dealer') {
      router.replace(`/login?next=${encodeURIComponent('/licensing/payment')}`);
      return;
    }
    if (started.current) return;
    started.current = true;

    Promise.all([getDealerAccount(), getSiteSettings()])
      .then(([account, settings]) => {
        setDealer(account);
        setPlans(buildDealerPlans(settings));
        if (account.payment_status === 'active') {
          router.replace('/portal/overview');
          return;
        }
        if (!stripeConfigured)
          throw new Error('Stripe is not configured yet. Add the publishable key to continue.');
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Unable to prepare payment.'),
      );
  }, [authLoading, router, user]);

  const plan = dealer ? planByCode(plans, dealer.plan) : undefined;
  const displayedPrice = quotedMonthlyPrice
    ? formatMoney(quotedMonthlyPrice, { cents: 'auto' })
    : plan?.price;

  async function prepareCheckout() {
    setError('');
    try {
      const checkout = await createSubscriptionCheckout();
      setQuotedMonthlyPrice(checkout.monthly_price);
      setClientSecret(checkout.client_secret);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to prepare payment.');
    }
  }

  return (
    <CheckoutShell
      productName={plan?.name ?? 'Your subscription'}
      order={plan && displayedPrice ? { price: displayedPrice, dueLabel: 'per month' } : undefined}
      features={plan?.features}
    >
      {error ? (
        <CheckoutState
          eyebrow="Checkout unavailable"
          title="We could not load payment."
          body={error}
          onRetry={() => window.location.reload()}
        />
      ) : dealer && plan ? (
        <CheckoutForm
          heading={`Start ${plan.name}.`}
          submitLabel="Start subscription"
          termsHref="/legal/dealer-subscription-terms"
          termsLabel="Dealer Subscription Terms"
          authorisation="authorise this monthly subscription."
          clientSecret={clientSecret}
          onAccept={prepareCheckout}
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
