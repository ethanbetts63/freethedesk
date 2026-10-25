'use client';

import { useEffect, useState } from 'react';

import { getAffiliateAccount, type AffiliateAccount } from '@/lib/affiliateApi';

/** The signed-in affiliate's account, loaded once per page. */
export function useAffiliateAccount() {
  const [account, setAccount] = useState<AffiliateAccount | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAffiliateAccount()
      .then(setAccount)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Your account could not be loaded.'),
      )
      .finally(() => setLoading(false));
  }, []);

  return { account, setAccount, error, loading };
}
