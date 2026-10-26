import type { Metadata } from 'next';

import { AuthCard } from '@/components/auth/AuthCard';
import { VerifyEmailCodeForm } from '@/components/auth/VerifyEmailCodeForm';

export const metadata: Metadata = {
  title: 'Verify Your Email',
  robots: { index: false, follow: false },
};

/**
 * Where the affiliate sign-up sends a new host, and where the welcome email links. The code in
 * that email is the account's first password: entering it here with a password of their own
 * verifies the address and opens the portal. See "Accounts opened by an emailed code" in
 * freetheplatform/_docs/apps/auth.md.
 */
export default async function AffiliateVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <AuthCard
      kicker="Affiliate program"
      heading="Verify your email"
      intro="We have emailed you a verification code."
      wordmark={false}
    >
      <VerifyEmailCodeForm
        destination="/affiliate-portal"
        defaultEmail={email ?? ''}
        busyLabel="Opening your portal…"
      />
    </AuthCard>
  );
}
