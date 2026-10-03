import type { Metadata } from 'next';

import { SeoPaymentPage } from './SeoPaymentPage';

export const metadata: Metadata = {
  title: 'Secure SEO Checkout',
  robots: { index: false, follow: false },
};

/* `ref` is the signup's checkout reference. There is no login before payment,
   so the link the signup form sends here is what finds the purchase. */
export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return <SeoPaymentPage reference={ref ?? ''} />;
}
