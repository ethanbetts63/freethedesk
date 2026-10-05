'use client';

import { useCallback } from 'react';

import {
  PaymentConfirmation,
  type ConfirmationResult,
} from '@/components/checkout/PaymentConfirmation';
import { getSeoCheckoutStatus } from '@/lib/seoApi';
import { ChoosePasswordForm } from './ChoosePasswordForm';

/**
 * Back from Stripe. Nobody is signed in yet: the login is made when the
 * payment lands and its temporary password is emailed. The browser that signed
 * up (`canChoosePassword`) chooses the account's own password here, which signs
 * it in and opens the dashboard; any other browser is pointed at sign-in.
 */
export function PaymentComplete({
  reference,
  canChoosePassword,
}: {
  reference: string;
  canChoosePassword: boolean;
}) {
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
        active: canChoosePassword
          ? ['Payment confirmed.', 'Choose a password to open your SEO dashboard.']
          : [
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
      activeContent={canChoosePassword ? <ChoosePasswordForm reference={reference} /> : undefined}
      portalHref="/login"
      portalLabel="Sign in"
    />
  );
}
