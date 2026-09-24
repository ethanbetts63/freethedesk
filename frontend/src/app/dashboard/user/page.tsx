'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { CHANGE_PASSWORD_PATH } from '@/lib/api';
import { getAccountSales, openAccountSale, type AccountSaleCard } from '@/lib/accountApi';
import { formatDateTime } from '@/lib/formatting';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { cardClassName } from '@/components/ui/Card';
import { pageClassName } from '@/components/ui/layout';
import { adminLoadingClassName } from '@/components/dashboard/dashboardChrome';
import { cn } from '@/lib/utils';

/**
 * The customer's account: every sale sent to their email, across dealers.
 *
 * Opening one goes through the `open/` bridge, which sets that sale's own
 * path-scoped cookie — the sale page then loads exactly as it does from the
 * emailed link. Mirrors allbikes' /account.
 */
export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [sales, setSales] = useState<AccountSaleCard[] | null>(null);
  const [error, setError] = useState('');
  const [openingRef, setOpeningRef] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?next=/dashboard/user');
      return;
    }
    let active = true;
    getAccountSales()
      .then((data) => {
        if (active) setSales(data.sales);
      })
      .catch(() => {
        if (active) setError('Your sales could not be loaded. Please try again.');
      });
    return () => {
      active = false;
    };
  }, [loading, router, user]);

  const openSale = useCallback(
    async (reference: string) => {
      setOpeningRef(reference);
      try {
        await openAccountSale(reference);
        router.push(`/sale/${reference}`);
      } catch {
        setError('That sale could not be opened. Please try again.');
        setOpeningRef(null);
      }
    },
    [router],
  );

  const signOut = useCallback(async () => {
    await logout();
    router.push('/');
  }, [logout, router]);

  if (loading || !user) {
    return <div className={adminLoadingClassName}>Loading…</div>;
  }

  return (
    <main className={pageClassName}>
      <PageHeader kicker="Your account" title={user.email}>
        <div className="flex gap-s">
          <Button variant="secondary" href={CHANGE_PASSWORD_PATH}>
            Change password
          </Button>
          <Button variant="secondary" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </PageHeader>

      {error && <Notice tone="danger">{error}</Notice>}

      {sales === null && !error && <div className={adminLoadingClassName}>Loading…</div>}

      {sales?.length === 0 && (
        <div className={cn(cardClassName, 'text-center')}>
          <p className="m-0 text-body-sm text-text-muted">
            Nothing here yet. When a dealer starts paperwork for you, it will appear on this page.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-m">
        {sales?.map((sale) => (
          <div
            key={sale.reference}
            className={cn(cardClassName, 'flex flex-wrap items-center gap-m sm:flex-nowrap')}
          >
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-body font-heavy text-text-primary">
                {sale.vehicle}
                {sale.colour ? ` · ${sale.colour}` : ''}
              </p>
              <p className="m-0 mt-3xs text-body-sm text-text-muted">
                {sale.dealer_name} · {sale.reference} · {formatDateTime(sale.created_at)}
              </p>
            </div>
            <StatusPill status={sale.status} />
            {!sale.is_closed && (
              <Button onClick={() => openSale(sale.reference)} disabled={openingRef !== null}>
                {openingRef === sale.reference ? 'Opening…' : 'Open'}
              </Button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
