import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { passwordClaimCookie } from '../../_lib/passwordClaim';
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
  const reference = ref ?? '';
  // Read here because the cookie is httpOnly. Django still decides on submit.
  const canChoosePassword = Boolean(
    reference && (await cookies()).get(passwordClaimCookie(reference)),
  );
  return <PaymentComplete reference={reference} canChoosePassword={canChoosePassword} />;
}
