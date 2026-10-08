import type { Metadata } from 'next';

import { OrderPaymentComplete } from './OrderPaymentComplete';

export const metadata: Metadata = {
  title: 'Confirming Your Order',
  robots: { index: false, follow: false },
};

export default async function CompletePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return <OrderPaymentComplete reference={ref ?? ''} />;
}
