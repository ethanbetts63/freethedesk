'use client';

import { FormEvent, useActionState, useEffect, useState } from 'react';
import type { PriceField } from '@/lib/api';
import { formatDateTime, getSiteSettings, type SiteSettings } from '@/lib/adminApi';
import { submitSiteSettings, type SiteSettingsState } from './SiteSettings.actions';
import { AdminButton } from '@/components/dashboard/AdminButton';
import { AdminNotice } from '@/components/dashboard/AdminNotice';
import {
  adminCardClassName,
  adminCardTitleClassName,
  adminCardWideClassName,
  adminDetailGridClassName,
} from '@/components/dashboard/AdminCard';
import { cn } from '@/lib/utils';
import { AdminPageHeader } from '@/components/dashboard/AdminPageHeader';
import { adminPageClassName } from '@/components/dashboard/adminLayout';
import {
  adminFormClassName,
  adminFormControlClassName,
  adminFormLabelClassName,
} from '@/components/dashboard/formControl';

const initialState: SiteSettingsState = { status: 'idle' };

type FormState = Record<PriceField, string>;

const LICENSING_FIELDS: { field: PriceField; label: string }[] = [
  { field: 'licensing_price', label: 'Online licensing ($ / month)' },
  { field: 'contracts_price', label: 'Online contracts ($ / month)' },
  { field: 'complete_price', label: 'Licensing + contracts ($ / month)' },
];

const SEO_FIELDS: { field: PriceField; label: string }[] = [
  { field: 'seo_monthly_price', label: 'SEO report — monthly ($ / report)' },
  { field: 'seo_quarterly_price', label: 'SEO report — quarterly ($ / report)' },
  { field: 'seo_biannual_price', label: 'SEO report — bi-annual ($ / report)' },
  { field: 'seo_oneoff_price', label: 'SEO report — one-off ($ once)' },
  { field: 'gbp_audit_price', label: 'Google Business Profile report ($ / report)' },
];

const ALL_FIELDS = [...LICENSING_FIELDS, ...SEO_FIELDS];

function toForm(settings: SiteSettings): FormState {
  return Object.fromEntries(ALL_FIELDS.map(({ field }) => [field, settings[field]])) as FormState;
}

export default function SiteSettingsPage() {
  const [loadedSettings, setLoadedSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [state, dispatch, saving] = useActionState(submitSiteSettings, initialState);

  useEffect(() => {
    getSiteSettings()
      .then((result) => {
        setLoadedSettings(result);
        setForm(toForm(result));
      })
      .catch((reason) =>
        setLoadError(
          reason instanceof Error ? reason.message : 'Site settings could not be loaded.',
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  // `form` already holds exactly what was just submitted, and `settings`
  // (below) picks up the saved snapshot from `state` — nothing to resync.
  const settings = state.status === 'success' && state.settings ? state.settings : loadedSettings;
  const error = state.status === 'error' ? state.error : loadError;
  const notice = state.status === 'success' && !saving ? 'Site settings have been saved.' : '';
  const dirty =
    settings !== null &&
    form !== null &&
    ALL_FIELDS.some(({ field }) => form[field] !== settings[field]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(new FormData(event.currentTarget));
  };

  if (loading)
    return (
      <div className={adminPageClassName}>
        <p className="text-text-subtle">Loading site settings…</p>
      </div>
    );
  if (error && !settings)
    return (
      <div className={adminPageClassName}>
        <AdminNotice tone="danger">{error}</AdminNotice>
      </div>
    );
  if (!settings || !form) return null;

  const renderField = ({ field, label }: { field: PriceField; label: string }) => (
    <label className={adminFormLabelClassName} key={field}>
      {label}
      <input
        className={adminFormControlClassName}
        name={field}
        type="number"
        min="0"
        step="0.01"
        value={form[field]}
        onChange={(event) => setForm({ ...form, [field]: event.target.value })}
        required
      />
    </label>
  );

  return (
    <div className={adminPageClassName}>
      <AdminPageHeader kicker="Site settings" title="Site settings" />

      {error && <AdminNotice tone="danger">{error}</AdminNotice>}
      {notice && <AdminNotice tone="success">{notice}</AdminNotice>}

      <form className={adminDetailGridClassName} onSubmit={onSubmit}>
        <section className={cn(adminCardClassName, adminCardWideClassName)}>
          <h2 className={adminCardTitleClassName}>Licensing subscription prices</h2>
          <p className="text-label text-text-subtle">
            These are the prices shown on the public licensing page and at checkout. All prices are
            This is the total a dealer pays each month, with nothing added on top.
          </p>
          <div className={adminFormClassName}>{LICENSING_FIELDS.map(renderField)}</div>
        </section>

        <section className={cn(adminCardClassName, adminCardWideClassName)}>
          <h2 className={adminCardTitleClassName}>SEO report prices</h2>
          <p className="text-label text-text-subtle">
            Prices shown on the public SEO page. Each subscription price is what a customer pays per
            report at that cadence. The Google Business Profile report can be selected alone or
            combined with SEO at the same frequency. The AI readiness check is free, so it has no
            price setting.
          </p>
          <div className={adminFormClassName}>
            {SEO_FIELDS.map(renderField)}
            <AdminButton type="submit" disabled={saving || !dirty}>
              {saving ? 'Saving…' : 'Save changes'}
            </AdminButton>
            <p className="mt-2xs block text-label leading-[1.45] font-normal text-text-subtle">
              Last updated {formatDateTime(settings.updated_at)}.
            </p>
          </div>
        </section>
      </form>
    </div>
  );
}
