import type { Metadata } from 'next';

import { AuthCard } from '@/components/auth/AuthCard';
import { UnsubscribeForm } from './_components/UnsubscribeForm';

export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false, follow: false },
};

/**
 * Where the unsubscribe link in every podcast pitch lands. The token is checked
 * and the address suppressed by Django (`/api/outreach/unsubscribe/<token>/`);
 * this page only puts a button in front of it. Disallowed in robots.txt.
 */
export default async function UnsubscribePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <AuthCard
      kicker="freethedesk emails"
      heading="Stop emails from freethedesk"
      intro="Press the button and we won't write to this address again. If you change your mind, the affiliate page is always open."
    >
      <UnsubscribeForm token={token} />
    </AuthCard>
  );
}
