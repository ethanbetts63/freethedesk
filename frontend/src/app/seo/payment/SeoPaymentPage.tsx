'use client';

import { useEffect, useRef, useState } from 'react';
import { ApiError } from '@freetheplatform/web-security';

import { CheckoutPayment, CheckoutShell, CheckoutState } from '@/components/checkout/CheckoutShell';
import { createSeoCheckout, getSeoCheckoutStatus, type SeoCheckoutStatus } from '@/lib/seoApi';
import { getSiteSettings } from '@/lib/api';
import { stripeConfigured } from '@/lib/stripe';
import { buildSeoPlans, planByCode, type SeoPlan } from '../_lib/plans';
import { formatMoney } from '@/lib/formatting';

const SIGN_IN = { href: '/login', label: 'Sign in' };

const NEXT_STEPS = [
  'Pay securely through Stripe.',
  'Your sign-in details arrive by email.',
  'Connect Search Console and your first report begins.',
];

/**
 * Checkout for an SEO signup, found by the reference the signup form handed
 * back. Nobody is signed in here: the login is made once payment lands, and
 * the email with its temporary password follows. The terms were ticked on the
 * signup form, so Stripe's card fields load straight away.
 */
export function SeoPaymentPage({ reference }: { reference: string }) {
  const started = useRef(false);
  const [checkout, setCheckout] = useState<SeoCheckoutStatus | null>(null);
  const [plans, setPlans] = useState<SeoPlan[]>([]);
  const [clientSecret, setClientSecret] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [error, setError] = useState('');
  const [accountExists, setAccountExists] = useState(false);
  const [offerChanged, setOfferChanged] = useState(false);

  useEffect(() => {
    if (started.current || !reference) return;
    started.current = true;

    Promise.all([getSeoCheckoutStatus(reference), getSiteSettings()])
      .then(async ([status, settings]) => {
        setCheckout(status);
        setPlans(buildSeoPlans(settings));
        if (status.paid) return;
        if (!stripeConfigured)
          throw new Error('Stripe is not configured yet. Add the publishable key to continue.');
        const session = await createSeoCheckout(reference);
        setQuotedPrice(session.price);
        setClientSecret(session.client_secret);
      })
      .catch((reason) => {
        if (reason instanceof ApiError && reason.payload?.code === 'account_exists') {
          setAccountExists(true);
        } else if (reason instanceof ApiError && reason.payload?.code === 'offer_changed') {
          setOfferChanged(true);
        } else {
          setError(
            reason instanceof ApiError && reason.status === 404
              ? 'This payment link has expired or is incomplete. Start again from the SEO page.'
              : reason instanceof Error
                ? reason.message
                : 'Unable to prepare payment.',
          );
        }
      });
  }, [reference]);

  const plan = checkout ? planByCode(plans, checkout.plan) : undefined;
  const oneOff = checkout?.plan === 'oneoff';
  const productName = plan?.productName ?? 'Your plan';
  const displayedPrice = quotedPrice ? formatMoney(quotedPrice, { cents: 'auto' }) : plan?.price;

  return (
    <CheckoutShell
      productName={productName}
      order={plan && displayedPrice ? { price: displayedPrice, dueLabel: plan.cadence } : undefined}
      features={plan?.features}
      nextSteps={NEXT_STEPS}
      changeHref="/seo#signup"
    >
      {!reference ? (
        <CheckoutState
          eyebrow="Secure checkout"
          title="Start from the SEO page."
          body="This link is missing your signup. Choose a plan and enter your details to reach payment."
          link={{ href: '/seo#signup', label: 'Choose a plan' }}
        />
      ) : accountExists ? (
        <CheckoutState
          eyebrow="Already signed up"
          title="You already have an account."
          body="This email already has a freethedesk account, so there is nothing to pay here. Sign in to see it."
          link={SIGN_IN}
        />
      ) : offerChanged ? (
        <CheckoutState
          eyebrow="Terms updated"
          title="Our price or terms have changed."
          body="They changed after you signed up, so nothing can be charged on this link. Choose your plan again to see and agree to the current ones."
          link={{ href: '/seo#signup', label: 'Choose a plan' }}
        />
      ) : checkout?.paid ? (
        <CheckoutState
          eyebrow="Already paid"
          title="This plan is paid."
          body="Your sign-in details were emailed to you when the payment went through."
          link={SIGN_IN}
        />
      ) : error ? (
        <CheckoutState
          eyebrow="Checkout unavailable"
          title="We could not load payment."
          body={error}
          onRetry={() => window.location.reload()}
        />
      ) : checkout && plan && clientSecret ? (
        <CheckoutPayment
          heading={
            oneOff ? `Pay for your ${productName}.` : `Start your ${plan.name.toLowerCase()}.`
          }
          submitLabel={oneOff ? 'Pay now' : 'Start subscription'}
          clientSecret={clientSecret}
        />
      ) : (
        <CheckoutState
          eyebrow="Secure checkout"
          title="Preparing payment…"
          body="Connecting your order to Stripe."
        />
      )}
    </CheckoutShell>
  );
}
