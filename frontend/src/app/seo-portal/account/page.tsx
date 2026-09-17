'use client';

import { useActionState, useEffect, useState } from 'react';
import { getSeoAccount, type SeoAccount } from '@/lib/seoApi';
import { submitSeoAccount, type SeoAccountState } from './SeoAccount.actions';
import { AdminButton } from '@/components/dashboard/AdminButton';
import { AdminNotice } from '@/components/dashboard/AdminNotice';
import {
  adminCardClassName,
  adminCardTitleClassName,
  adminCardWideClassName,
  adminDetailGridClassName,
} from '@/components/dashboard/AdminCard';
import { cn } from '@/lib/utils';

const initialState: SeoAccountState = { status: 'idle' };

export default function SeoPortalAccountPage() {
  const [loadedAccount, setLoadedAccount] = useState<SeoAccount | null>(null);
  const [form, setForm] = useState({ business_name: '', contact_name: '', phone: '', website: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [state, dispatch, saving] = useActionState(submitSeoAccount, initialState);

  useEffect(() => {
    getSeoAccount()
      .then((result) => {
        setLoadedAccount(result);
        setForm({
          business_name: result.business_name,
          contact_name: result.contact_name,
          phone: result.phone,
          website: result.website,
        });
      })
      .catch((reason) =>
        setLoadError(
          reason instanceof Error ? reason.message : 'Your account could not be loaded.',
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  // `form` already holds exactly what was just submitted, and `account`
  // (below) picks up the saved snapshot from `state`. Once
  // `has_usable_password` flips true the password fields stop rendering
  // entirely, so nothing needs to explicitly clear them on success — and
  // leaving them alone on a mismatch error means the user isn't forced to
  // retype both.
  const account = state.status === 'success' && state.account ? state.account : loadedAccount;
  const error = state.status === 'error' ? state.error : loadError;
  const notice = state.status === 'success' && !saving ? 'Your details have been saved.' : '';

  const dirty =
    account !== null &&
    (form.business_name !== account.business_name ||
      form.contact_name !== account.contact_name ||
      form.phone !== account.phone ||
      form.website !== account.website ||
      (!account.has_usable_password && password.length > 0));

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
          <p className="admin-kicker">SEO portal</p>
          <h1>{account.has_usable_password ? 'Account details' : 'Complete your account'}</h1>
          {!account.has_usable_password && (
            <p>Add your details and choose the password you&apos;ll use next time.</p>
          )}
        </div>
      </header>

      {error && <AdminNotice tone="danger">{error}</AdminNotice>}
      {notice && <AdminNotice tone="success">{notice}</AdminNotice>}

      <div className={adminDetailGridClassName}>
        <section className={cn(adminCardClassName, adminCardWideClassName)}>
          <h2 className={adminCardTitleClassName}>Your business</h2>
          <form className="admin-compose-form" onSubmit={onSubmit}>
            <label>
              Business name
              <input
                name="business_name"
                value={form.business_name}
                onChange={(event) => setForm({ ...form, business_name: event.target.value })}
                required
              />
            </label>
            <label>
              Contact name
              <input
                name="contact_name"
                value={form.contact_name}
                onChange={(event) => setForm({ ...form, contact_name: event.target.value })}
                required
              />
            </label>
            <label>
              Phone
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </label>
            <label>
              Website
              <input
                name="website"
                type="url"
                placeholder="https://"
                value={form.website}
                onChange={(event) => setForm({ ...form, website: event.target.value })}
              />
            </label>
            <label>
              Email
              <input value={account.email} disabled />
              <small className="mt-2xs block text-ui leading-[1.45] font-normal text-text-subtle">
                This is your sign-in address. To change it, email hello@freethedesk.com.au and we
                will move it across.
              </small>
            </label>
            {!account.has_usable_password && (
              <>
                <label>
                  Choose a password
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Confirm password
                  <input
                    name="password_confirmation"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={passwordConfirmation}
                    onChange={(event) => setPasswordConfirmation(event.target.value)}
                    required
                  />
                </label>
              </>
            )}
            <AdminButton type="submit" disabled={saving || !dirty}>
              {saving
                ? 'Saving…'
                : account.has_usable_password
                  ? 'Save changes'
                  : 'Complete account setup'}
            </AdminButton>
          </form>
        </section>
      </div>
    </div>
  );
}
