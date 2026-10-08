'use client';

import { useCallback } from 'react';

import {
  PaymentConfirmation,
  type ConfirmationResult,
} from '@/components/checkout/PaymentConfirmation';
import { trackPurchaseOnce } from '@/lib/analytics';
import { getPackageOrderStatus } from '@/lib/packageOrderApi';

/**
 * Back from Stripe. An order opens no account, so confirming it is the end of the online part:
 * the receipt is emailed, and staff get in touch about the work.
 */
export function OrderPaymentComplete({ reference }: { reference: string }) {
  const check = useCallback(async (): Promise<ConfirmationResult> => {
    const order = await getPackageOrderStatus(reference);
    if (order.paid) {
      trackPurchaseOnce(reference, `order-${reference}`, {
        value: Number(order.due_now),
        items: [
          {
            item_id: order.package,
            item_name: order.package_name,
            item_category: order.package === 'automation_discovery' ? 'automation' : 'website',
            price: Number(order.due_now),
          },
        ],
      });
      return { status: 'active' };
    }
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
          "Thanks for your order. Your receipt is on its way by email, and we'll be in touch about what happens next.",
        ],
        failed: [
          'Payment needs attention.',
          'Stripe could not confirm the payment. You can return to secure payment and try again.',
        ],
        delayed: [
          'Confirmation is taking longer than usual.',
          'Your payment may still go through. If it does, your receipt arrives by email.',
        ],
      }}
      retryHref={`/order/payment?ref=${encodeURIComponent(reference)}`}
      portalHref="/"
      portalLabel="Back to the site"
    />
  );
}
