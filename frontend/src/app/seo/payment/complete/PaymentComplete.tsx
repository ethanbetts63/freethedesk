'use client';

import { useCallback } from 'react';

import {
  PaymentConfirmation,
  type ConfirmationResult,
} from '@/components/checkout/PaymentConfirmation';
import { trackPurchaseOnce } from '@/lib/analytics';
import { getSeoCheckoutStatus } from '@/lib/seoApi';
import { VerifyEmailForm } from './VerifyEmailForm';

/**
 * Back from Stripe. Nobody is signed in yet: the login is made when the payment lands and its
 * verification code is emailed. Entering the code here with a new password verifies the email,
 * signs the customer in and opens the dashboard. See "Accounts a payment opens" in
 * freetheplatform/_docs/apps/payments.md.
 */
export function PaymentComplete({ reference }: { reference: string }) {
  const check = useCallback(async (): Promise<ConfirmationResult> => {
    const status = await getSeoCheckoutStatus(reference);
    if (status.paid) {
      trackPurchaseOnce(reference, `seo-${reference}`, {
        items: [
          { item_id: `seo_${status.plan}`, item_name: `SEO ${status.plan}`, item_category: 'seo' },
        ],
      });
      return { status: 'active' };
    }
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
          'We have emailed you a verification code. Enter it below with a password of your choice to open your SEO dashboard.',
        ],
        failed: [
          'Payment needs attention.',
          'Stripe could not confirm the payment. You can return to secure payment and try again.',
        ],
        delayed: [
          'Confirmation is taking longer than usual.',
          'Your payment may still go through. If it does, your verification code arrives by email.',
        ],
      }}
      retryHref={`/seo/payment?ref=${encodeURIComponent(reference)}`}
      activeLink={{ href: '/login', label: 'Sign in' }}
      activeContent={<VerifyEmailForm />}
      portalHref="/login"
      portalLabel="Sign in"
    />
  );
}
