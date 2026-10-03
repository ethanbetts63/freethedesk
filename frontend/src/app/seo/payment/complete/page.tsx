import type { Metadata } from 'next';

import { PaymentComplete } from './PaymentComplete';

export const metadata: Metadata = {
  title: 'Confirming SEO Subscription',
  robots: { index: false, follow: false },
};

export default async function CompletePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return <PaymentComplete reference={ref ?? ''} />;
}
