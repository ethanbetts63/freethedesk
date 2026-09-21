'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Notice } from '@/components/ui/Notice';
import { pageClassName } from '@/components/ui/layout';
import { redeemSale } from '@/lib/saleApi';

/**
 * The emailed link, spent once.
 *
 * Opening it posts the token, the server sets the path-scoped httpOnly cookie,
 * and the customer is replaced onto the sale itself. `replace` rather than
 * `push` on purpose: the token is then out of the history as well as out of the
 * address bar, so a shared screen or a borrowed laptop does not hand it on.
 */
export default function RedeemSalePage() {
  const { reference, token } = useParams<{ reference: string; token: string }>();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    redeemSale(reference, token)
      .then(() => {
        if (active) router.replace(`/sale/${reference}`);
      })
      .catch((reason) => {
        if (active)
          setError(reason instanceof Error ? reason.message : 'This link is no longer valid.');
      });
    return () => {
      active = false;
    };
  }, [reference, token, router]);

  return (
    <div className={pageClassName}>
      {error ? (
        <>
          <Notice tone="danger">{error}</Notice>
          <p className="text-body-sm text-text-muted">
            You can still get in with your reference and the password in the same email:{' '}
            <Link href={`/sale/${reference}`}>open your sale</Link>.
          </p>
        </>
      ) : (
        <p className="text-text-subtle">Opening your sale…</p>
      )}
    </div>
  );
}
