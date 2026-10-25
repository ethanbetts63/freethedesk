'use client';

import { useActionState, useEffect, useState } from 'react';

import { getAffiliateAccount, type AffiliateAccount } from '@/lib/affiliateApi';

import { Button } from '@/components/ui/Button';
import {
  cardClassName,
  cardTitleClassName,
  cardWideClassName,
  detailGridClassName,
} from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  adminFormClassName,
  adminFormControlClassName,
  adminFormLabelClassName,
} from '@/components/ui/formControl';
import { pageClassName } from '@/components/ui/layout';
import { cn } from '@/lib/utils';

import { submitAffiliateAccount, type AffiliateAccountState } from './AffiliateAccount.actions';

const initialState: AffiliateAccountState = { status: 'idle' };

export default function AffiliatePortalAccountPage() {
  const [loadedAccount, setLoadedAccount] = useState<AffiliateAccount | null>(null);
  const [form, setForm] = useState({ business_name: '', contact_name: '', website: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [state, formAction, saving] = useActionState(submitAffiliateAccount, initialState);

  useEffect(() => {
    getAffiliateAccount()
      .then((result) => {
        setLoadedAccount(result);
        setForm({
          business_name: result.business_name,
          contact_name: result.contact_name,
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

  const account = state.status === 'success' && state.account ? state.account : loadedAccount;
  const error = state.status === 'error' ? state.error : loadError;
  const notice = state.status === 'success' && !saving ? 'Your details have been saved.' : '';

  const dirty =
    account !== null &&
    (form.business_name !== account.business_name ||
      form.contact_name !== account.contact_name ||
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
      <PageHeader kicker="Affiliate portal" title="Account details" />

      {error && <Notice tone="danger">{error}</Notice>}
      {notice && <Notice tone="success">{notice}</Notice>}

      <div className={detailGridClassName}>
        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Your podcast</h2>
          <form className={adminFormClassName} action={formAction}>
            <label className={adminFormLabelClassName}>
              Podcast or business name
              <input
                className={adminFormControlClassName}
                name="business_name"
                value={form.business_name}
                onChange={(event) => setForm({ ...form, business_name: event.target.value })}
                required
              />
            </label>
            <label className={adminFormLabelClassName}>
              Your name
              <input
                className={adminFormControlClassName}
                name="contact_name"
                value={form.contact_name}
                onChange={(event) => setForm({ ...form, contact_name: event.target.value })}
                required
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
              <small className="mt-2xs block text-label leading-normal font-normal text-text-subtle">
                The site your free audit is about is set on the audit page.
              </small>
            </label>
            <label className={adminFormLabelClassName}>
              Code
              <input className={adminFormControlClassName} value={account.code} disabled />
              <small className="mt-2xs block text-label leading-normal font-normal text-text-subtle">
                Made from your podcast&apos;s name when you joined. Listeners already have it, so it
                stays as it is.
              </small>
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

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Password</h2>
          <Button variant="secondary" href="/dashboard/change-password">
            Change password
          </Button>
        </section>
      </div>
    </div>
  );
}
