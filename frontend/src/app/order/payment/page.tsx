import type { Metadata } from 'next';

import { OrderPaymentPage } from './OrderPaymentPage';

export const metadata: Metadata = {
  title: 'Secure Checkout',
  robots: { index: false, follow: false },
};

/* `ref` is the order's checkout reference. Nobody signs in to buy a package, so the link the
   order form sends here is what finds the purchase. */
export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return <OrderPaymentPage reference={ref ?? ''} />;
}
