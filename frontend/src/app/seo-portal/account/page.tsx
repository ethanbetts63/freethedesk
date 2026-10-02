'use client';

import { useActionState, useEffect, useState } from 'react';
import { getSeoAccount, type SeoAccount } from '@/lib/seoApi';
import { submitSeoAccount, type SeoAccountState } from './SeoAccount.actions';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import {
  cardClassName,
  cardTitleClassName,
  cardWideClassName,
  detailGridClassName,
} from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';
import {
  adminFormClassName,
  adminFormControlClassName,
  adminFormLabelClassName,
} from '@/components/ui/formControl';

const initialState: SeoAccountState = { status: 'idle' };

export default function SeoPortalAccountPage() {
  const [loadedAccount, setLoadedAccount] = useState<SeoAccount | null>(null);
  const [form, setForm] = useState({ business_name: '', contact_name: '', phone: '', website: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [state, formAction, saving] = useActionState(submitSeoAccount, initialState);

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
  // (below) picks up the saved snapshot from `state`.
  const account = state.status === 'success' && state.account ? state.account : loadedAccount;
  const error = state.status === 'error' ? state.error : loadError;
  const notice = state.status === 'success' && !saving ? 'Your details have been saved.' : '';

  const dirty =
    account !== null &&
    (form.business_name !== account.business_name ||
      form.contact_name !== account.contact_name ||
      form.phone !== account.phone ||
      form.website !== account.website);

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading your account…</p>
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
      <PageHeader kicker="SEO portal" title="Account details" />

      {error && <Notice tone="danger">{error}</Notice>}
      {notice && <Notice tone="success">{notice}</Notice>}

      <div className={detailGridClassName}>
        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Your business</h2>
          <form className={adminFormClassName} action={formAction}>
            <label className={adminFormLabelClassName}>
              Business name
              <input
                className={adminFormControlClassName}
                name="business_name"
                value={form.business_name}
                onChange={(event) => setForm({ ...form, business_name: event.target.value })}
                required
              />
            </label>
            <label className={adminFormLabelClassName}>
              Contact name
              <input
                className={adminFormControlClassName}
                name="contact_name"
                value={form.contact_name}
                onChange={(event) => setForm({ ...form, contact_name: event.target.value })}
                required
              />
            </label>
            <label className={adminFormLabelClassName}>
              Phone
              <input
                className={adminFormControlClassName}
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </label>
            <label className={adminFormLabelClassName}>
              Website
              <input
                className={adminFormControlClassName}
                name="website"
                type="url"
                placeholder="https://"
                value={form.website}
                onChange={(event) => setForm({ ...form, website: event.target.value })}
              />
            </label>
            <label className={adminFormLabelClassName}>
              Email
              <input className={adminFormControlClassName} value={account.email} disabled />
              <small className="mt-2xs block text-label leading-normal font-normal text-text-subtle">
                This is your sign-in address. To change it, email hello@freethedesk.com.au and we
                will move it across.
              </small>
            </label>
            <Button type="submit" disabled={saving || !dirty}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
