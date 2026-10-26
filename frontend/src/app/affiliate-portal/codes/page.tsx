'use client';

import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';

import { AffiliateCodes } from '../_components/AffiliateCodes';
import { useAffiliateAccount } from '../_lib/useAffiliateAccount';

export default function AffiliatePortalCodesPage() {
  const { account, setAccount, error, loading } = useAffiliateAccount();

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading your codes…</p>
      </div>
    );
  if (error && !account)
    return (
      <div className={pageClassName}>
        <Notice tone="danger">{error}</Notice>
      </div>
    );
  if (!account) return null;

  return (
    <div className={pageClassName}>
      <PageHeader
        title="Your codes"
        subtitle="What listeners type at checkout. Add as many as you like, one for each place you share."
      />
      <AffiliateCodes account={account} onChange={setAccount} />
    </div>
  );
}
