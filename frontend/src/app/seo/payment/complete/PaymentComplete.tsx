'use client';

import { useCallback } from 'react';

import {
  PaymentConfirmation,
  type ConfirmationResult,
} from '@/components/checkout/PaymentConfirmation';
import { getSeoCheckoutStatus } from '@/lib/seoApi';

/**
 * Back from Stripe. Nobody is signed in yet: the login is made when the
 * payment lands and its temporary password is emailed, so success points at
 * sign-in rather than redirecting into a portal that would bounce them.
 */
export function PaymentComplete({ reference }: { reference: string }) {
  const check = useCallback(async (): Promise<ConfirmationResult> => {
    const status = await getSeoCheckoutStatus(reference);
    if (status.paid) return { status: 'active' };
    if (status.payment_status === 'past_due' || status.payment_status === 'cancelled')
      return { status: 'failed' };
    return { status: 'pending' };
  }, [reference]);

  return (
    <PaymentConfirmation
      check={check}
      copy={{
        checking: [
          'Confirming your payment.',
          'Stripe is securely completing the payment. This usually takes only a few seconds.',
        ],
        active: [
          'Payment confirmed.',
          'We have emailed you a temporary password. Sign in with it to set up your SEO dashboard.',
        ],
        failed: [
          'Payment needs attention.',
          'Stripe could not confirm the payment. You can return to secure payment and try again.',
        ],
        delayed: [
          'Confirmation is taking longer than usual.',
          'Your payment may still go through. If it does, your sign-in details arrive by email.',
        ],
      }}
      retryHref={`/seo/payment?ref=${encodeURIComponent(reference)}`}
      activeLink={{ href: '/login', label: 'Sign in' }}
      portalHref="/login"
      portalLabel="Sign in"
    />
  );
}
