'use client';

import { type FormEvent, useActionState, useEffect, useState } from 'react';
import type { SettingsField } from '@/lib/api';
import { formatDateTime, getSiteSettings, type SiteSettings } from '@/lib/adminApi';
import { submitSiteSettings, type SiteSettingsState } from './SiteSettings.actions';
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

const initialState: SiteSettingsState = { status: 'idle' };

type FormState = Record<SettingsField, string>;

/** A count is a whole number of hours or pages; everything else is dollars and cents. */
type FieldSpec = { field: SettingsField; label: string; count?: boolean };

const LICENSING_FIELDS: FieldSpec[] = [
  { field: 'licensing_price', label: 'Online licensing ($ / month)' },
  { field: 'contracts_price', label: 'Online contracts ($ / month)' },
  { field: 'complete_price', label: 'Licensing + contracts ($ / month)' },
];

const SEO_FIELDS: FieldSpec[] = [
  { field: 'seo_monthly_price', label: 'SEO monthly ($ / audit)' },
  { field: 'seo_quarterly_price', label: 'SEO quarterly ($ / audit)' },
  { field: 'seo_yearly_price', label: 'SEO yearly ($ / audit)' },
  { field: 'seo_oneoff_price', label: 'SEO one-off ($ once)' },
];

const HOURLY_FIELDS: FieldSpec[] = [
  { field: 'hourly_rate', label: 'Hourly rate ($ / hour)' },
  { field: 'discovery_hours', label: 'Discovery (hours, paid upfront)', count: true },
];

const WEBSITE_FIELDS: FieldSpec[] = [
  { field: 'website_small_pages', label: 'Package 1 (pages)', count: true },
  { field: 'website_small_page_price', label: 'Package 1 ($ / page)' },
  { field: 'website_large_pages', label: 'Package 2 (pages)', count: true },
  { field: 'website_large_page_price', label: 'Package 2 ($ / page)' },
];

const PROJECT_FIELDS: FieldSpec[] = [
  { field: 'automation_from_price', label: 'Automation (from $)' },
];

const ALL_FIELDS = [
  ...LICENSING_FIELDS,
  ...SEO_FIELDS,
  ...HOURLY_FIELDS,
  ...WEBSITE_FIELDS,
  ...PROJECT_FIELDS,
];

function toForm(settings: SiteSettings): FormState {
  return Object.fromEntries(
    ALL_FIELDS.map(({ field }) => [field, String(settings[field])]),
  ) as FormState;
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
    ALL_FIELDS.some(({ field }) => form[field] !== String(settings[field]));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(new FormData(event.currentTarget));
  };

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading site settings…</p>
      </div>
    );
  if (error && !settings)
    return (
      <div className={pageClassName}>
        <Notice tone="danger">{error}</Notice>
      </div>
    );
  if (!settings || !form) return null;

  const renderField = ({ field, label, count }: FieldSpec) => (
    <label className={adminFormLabelClassName} key={field}>
      {label}
      <input
        className={adminFormControlClassName}
        name={field}
        type="number"
        min={count ? '1' : '0'}
        step={count ? '1' : '0.01'}
        value={form[field]}
        onChange={(event) => setForm({ ...form, [field]: event.target.value })}
        required
      />
    </label>
  );

  return (
    <div className={pageClassName}>
      <PageHeader kicker="Site settings" title="Site settings" />

      {error && <Notice tone="danger">{error}</Notice>}
      {notice && <Notice tone="success">{notice}</Notice>}

      <form className={detailGridClassName} onSubmit={onSubmit}>
        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Licensing subscription prices</h2>
          <p className="text-label text-text-subtle">
            These are the prices shown on the public licensing page and at checkout. Each is the
            total a dealer pays each month, with nothing added on top.
          </p>
          <div className={adminFormClassName}>{LICENSING_FIELDS.map(renderField)}</div>
        </section>

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>SEO audit prices</h2>
          <p className="text-label text-text-subtle">
            Prices shown on the public SEO page. Each subscription price is what a customer pays per
            audit at that cadence. The Google Business Profile audit can be selected alone or
            combined with SEO at the same frequency. The AI readiness check is free, so it has no
            price setting.
          </p>
          <div className={adminFormClassName}>{SEO_FIELDS.map(renderField)}</div>
        </section>

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Hourly work</h2>
          <p className="text-label text-text-subtle">
            Discovery is this many hours at the hourly rate, paid upfront. It is what the web
            application package (package 3) and automation discovery cost to buy.
          </p>
          <div className={adminFormClassName}>{HOURLY_FIELDS.map(renderField)}</div>
        </section>

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Website packages</h2>
          <p className="text-label text-text-subtle">
            The two website packages on the website development page. Each is a number of pages at a
            price per page, and an extra page costs the same.
          </p>
          <div className={adminFormClassName}>{WEBSITE_FIELDS.map(renderField)}</div>
        </section>

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Automation</h2>
          <p className="text-label text-text-subtle">
            The smallest automation job worth starting, shown as a &ldquo;from&rdquo; price on the
            pricing page. Web applications have no such price: after discovery, the build is priced
            to the customer&rsquo;s budget.
          </p>
          <div className={adminFormClassName}>
            {PROJECT_FIELDS.map(renderField)}
            <Button type="submit" disabled={saving || !dirty}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            <p className="mt-2xs block text-label leading-normal font-normal text-text-subtle">
              Last updated {formatDateTime(settings.updated_at)}.
            </p>
          </div>
        </section>
      </form>
    </div>
  );
}
