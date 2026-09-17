'use client';

import { useActionState, useEffect, useState } from 'react';
import { getDealerAccount, type DealerAccount } from '@/lib/dealerApi';
import { DEALER_STATES } from '@/lib/dealerStates';
import { submitPortalAccount, type PortalAccountState } from './PortalAccount.actions';
import { AdminButton } from '@/components/dashboard/AdminButton';
import { AdminNotice } from '@/components/dashboard/AdminNotice';
import {
  adminCardClassName,
  adminCardTitleClassName,
  adminCardWideClassName,
  adminDetailGridClassName,
} from '@/components/dashboard/AdminCard';
import { cn } from '@/lib/utils';
import {
  adminFormClassName,
  adminFormControlClassName,
  adminFormLabelClassName,
} from '@/components/dashboard/formControl';

const initialState: PortalAccountState = { status: 'idle' };

export default function PortalAccountPage() {
  const [loadedAccount, setLoadedAccount] = useState<DealerAccount | null>(null);
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    phone: '',
    state: 'WA' as DealerAccount['state'],
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [state, dispatch, saving] = useActionState(submitPortalAccount, initialState);

  useEffect(() => {
    getDealerAccount()
      .then((result) => {
        setLoadedAccount(result);
        setForm({
          business_name: result.business_name,
          contact_name: result.contact_name,
          phone: result.phone,
          state: result.state,
        });
      })
      .catch((reason) =>
        setLoadError(
          reason instanceof Error ? reason.message : 'Your account could not be loaded.',
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  // `form` already holds exactly what was just submitted, and `account` (below)
  // picks up the saved snapshot from `state` — nothing needs resyncing here.
  const account = state.status === 'success' && state.account ? state.account : loadedAccount;
  const error = state.status === 'error' ? state.error : loadError;
  const notice = state.status === 'success' && !saving ? 'Your details have been saved.' : '';

  const dirty =
    account !== null &&
    (form.business_name !== account.business_name ||
      form.contact_name !== account.contact_name ||
      form.phone !== account.phone ||
      form.state !== account.state);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(new FormData(event.currentTarget));
  };

  if (loading)
    return (
      <div className="admin-page">
        <p className="text-text-subtle">Loading your account…</p>
      </div>
    );
  if (error && !account)
    return (
      <div className="admin-page">
        <AdminNotice tone="danger">{error}</AdminNotice>
      </div>
    );
  if (!account) return null;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Dealer portal</p>
          <h1>Account details</h1>
        </div>
      </header>

      {error && <AdminNotice tone="danger">{error}</AdminNotice>}
      {notice && <AdminNotice tone="success">{notice}</AdminNotice>}

      <div className={adminDetailGridClassName}>
        <section className={cn(adminCardClassName, adminCardWideClassName)}>
          <h2 className={adminCardTitleClassName}>Your dealership</h2>
          <form className={adminFormClassName} onSubmit={onSubmit}>
            <label className={adminFormLabelClassName}>
              Business name
              <input
                className={cn(adminFormControlClassName)}
                name="business_name"
                value={form.business_name}
                onChange={(event) => setForm({ ...form, business_name: event.target.value })}
                required
              />
            </label>
            <label className={adminFormLabelClassName}>
              Contact name
              <input
                className={cn(adminFormControlClassName)}
                name="contact_name"
                value={form.contact_name}
                onChange={(event) => setForm({ ...form, contact_name: event.target.value })}
                required
              />
            </label>
            <label className={adminFormLabelClassName}>
              Phone
              <input
                className={cn(adminFormControlClassName)}
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </label>
            <label className={adminFormLabelClassName}>
              State or territory
              <select
                className={cn(adminFormControlClassName)}
                name="state"
                value={form.state}
                onChange={(event) =>
                  setForm({ ...form, state: event.target.value as DealerAccount['state'] })
                }
              >
                {DEALER_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
            <label className={adminFormLabelClassName}>
              Email
              <input className={cn(adminFormControlClassName)} value={account.email} disabled />
              <small className="mt-2xs block text-ui leading-[1.45] font-normal text-text-subtle">
                This is your sign-in address. To change it, email hello@freethedesk.com.au and we
                will move it across.
              </small>
            </label>
            <AdminButton type="submit" disabled={saving || !dirty}>
              {saving ? 'Saving…' : 'Save changes'}
            </AdminButton>
          </form>
        </section>
      </div>
    </div>
  );
}
