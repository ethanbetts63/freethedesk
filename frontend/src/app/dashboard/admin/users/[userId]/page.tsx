'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiErrorMessage } from '@freetheplatform/web-security';

import { StatusPill } from '@/components/dashboard/StatusPill';
import { Button } from '@/components/ui/Button';
import {
  cardClassName,
  cardTitleClassName,
  cardWideClassName,
  detailGridClassName,
  detailListClassName,
  DetailItem,
} from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { backClassName, pageClassName } from '@/components/ui/layout';
import {
  adminTableClassName,
  adminTableWrapClassName,
  adminTdClassName,
  adminThClassName,
} from '@/components/dashboard/AdminList';
import { formatDateTime } from '@/lib/formatting';
import {
  adminGetAccount,
  adminSendAccountResetLink,
  adminUnlockAccount,
} from '@/lib/staffAccountApi';
import { cn } from '@/lib/utils';
import { STAFF_ACCOUNTS_PATH, type StaffAccountDetail } from '@/types/StaffAccount';
import AccountForm from './AccountForm';
import SetPasswordForm from './SetPasswordForm';

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const [account, setAccount] = useState<StaffAccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    adminGetAccount(Number(userId))
      .then((result) => {
        if (!cancelled) setAccount(result);
      })
      .catch(() => {
        if (!cancelled) setError('This user could not be loaded.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const onSaved = useCallback((next: StaffAccountDetail) => setAccount(next), []);

  const run = async (action: () => Promise<string>) => {
    setBusy(true);
    setNotice(null);
    try {
      setNotice({ tone: 'success', text: await action() });
    } catch (reason) {
      setNotice({ tone: 'danger', text: apiErrorMessage(reason, 'That did not work. Try again.') });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading user…</p>
      </div>
    );
  }
  if (error || !account) {
    return (
      <div className={pageClassName}>
        <Notice tone="danger">{error || 'User not found.'}</Notice>
      </div>
    );
  }

  const { security } = account;
  const found = account.activity.filter((section) => section.total > 0);
  const empty = account.activity.filter((section) => section.total === 0);

  return (
    <div className={pageClassName}>
      <Link href={STAFF_ACCOUNTS_PATH} className={backClassName}>
        ← Users
      </Link>
      <PageHeader
        kicker={account.is_superuser ? 'Superuser' : account.role_label}
        title={account.name || account.username}
        subtitle={[
          account.email || 'No email address',
          account.locked ? 'locked out' : null,
          account.is_active ? null : 'deactivated',
        ]
          .filter(Boolean)
          .join(' · ')}
      />

      {!account.can_manage && (
        <Notice tone="warning">
          This is a superuser account. Only another superuser can change it.
        </Notice>
      )}

      <div className={detailGridClassName}>
        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Account</h2>
          {account.can_manage ? (
            <AccountForm account={account} onSaved={onSaved} />
          ) : (
            <dl className={detailListClassName}>
              <DetailItem term="First name">{account.first_name || '—'}</DetailItem>
              <DetailItem term="Last name">{account.last_name || '—'}</DetailItem>
              <DetailItem term="Email">{account.email || '—'}</DetailItem>
              <DetailItem term="Username">{account.username}</DetailItem>
            </dl>
          )}
        </section>

        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Password and sign-in</h2>
          <p className="mt-0 text-label text-text-subtle">
            A reset link is the better choice when they can get to their email — you never learn the
            password.
          </p>
          <dl className={detailListClassName}>
            <DetailItem term="Last sign-in">
              {account.last_login ? formatDateTime(account.last_login) : 'Never'}
            </DetailItem>
            <DetailItem term="Joined">{formatDateTime(account.date_joined)}</DetailItem>
            <DetailItem term="Password">
              {security.has_usable_password ? 'Set' : 'None yet — claimed through a reset link'}
            </DetailItem>
            <DetailItem term="Failed attempts in a row">{security.failure_count}</DetailItem>
            {security.locked_until && (
              <DetailItem term="Locked until">{formatDateTime(security.locked_until)}</DetailItem>
            )}
            {security.must_change_password && (
              <DetailItem term="Next sign-in">Must choose their own password</DetailItem>
            )}
          </dl>

          {account.can_manage && (
            <>
              <div className="mt-m flex flex-wrap gap-s">
                <Button
                  variant="secondary"
                  disabled={busy || !account.email || !account.is_active}
                  onClick={() =>
                    void run(async () => (await adminSendAccountResetLink(account.id)).detail)
                  }
                >
                  Email a reset link
                </Button>
                {account.locked && (
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        setAccount(await adminUnlockAccount(account.id));
                        return 'Unlocked. They can sign in again now.';
                      })
                    }
                  >
                    Unlock
                  </Button>
                )}
              </div>
              {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
              <h3 className="mt-l mb-s text-body font-heavy">Set a password yourself</h3>
              <SetPasswordForm accountId={account.id} />
            </>
          )}
        </section>

        {found.map((section) => (
          <section key={section.key} className={cn(cardClassName, cardWideClassName)}>
            <h2 className={cardTitleClassName}>{section.title}</h2>
            <p className="mt-0 text-label text-text-subtle">
              {section.total > section.rows.length
                ? `The latest ${section.rows.length} of ${section.total}.`
                : `${section.total} in all.`}
            </p>
            <div className={adminTableWrapClassName}>
              <table className={adminTableClassName}>
                <thead>
                  <tr>
                    <th className={adminThClassName}>Reference</th>
                    <th className={adminThClassName}>What</th>
                    <th className={adminThClassName}>Status</th>
                    <th className={adminThClassName}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, index) => (
                    <tr key={`${row.reference}-${index}`}>
                      <td className={adminTdClassName}>
                        {row.href ? (
                          <Link href={row.href} className="font-heavy underline">
                            {row.reference || 'Open'}
                          </Link>
                        ) : (
                          row.reference || '—'
                        )}
                      </td>
                      <td className={adminTdClassName}>{row.summary || '—'}</td>
                      <td className={adminTdClassName}>
                        {row.status ? <StatusPill status={row.status} /> : '—'}
                      </td>
                      <td className={adminTdClassName}>
                        {row.date ? formatDateTime(row.date) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {empty.length > 0 && (
        <p className="text-label text-text-subtle">
          Nothing on record for: {empty.map((section) => section.title.toLowerCase()).join(', ')}.
        </p>
      )}
    </div>
  );
}
