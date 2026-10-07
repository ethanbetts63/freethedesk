'use client';

import { type FormEvent, useActionState, useEffect, useState } from 'react';
import { handleResponse } from '@freetheplatform/web-security';

import { authedFetch, formatDateTime } from '@/lib/adminApi';
import {
  submitInvoiceSettings,
  type InvoiceSettings,
  type InvoiceSettingsState,
} from './InvoiceSettings.actions';
import { INVOICE_SETTINGS_FIELDS, type InvoiceSettingsValues } from './InvoiceSettings.schema';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import {
  cardClassName,
  cardTitleClassName,
  cardWideClassName,
  detailGridClassName,
} from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';
import {
  adminFormClassName,
  adminFormControlClassName,
  adminFormLabelClassName,
} from '@/components/ui/formControl';
import { cn } from '@/lib/utils';

const initialState: InvoiceSettingsState = { status: 'idle' };

type Field = { field: keyof InvoiceSettingsValues; label: string; multiline?: boolean };

const BUSINESS_FIELDS: Field[] = [
  { field: 'business_name', label: 'Business name' },
  { field: 'legal_name', label: 'Legal entity (if different)' },
  { field: 'abn', label: 'ABN' },
  { field: 'address', label: 'Address (one line per printed line)', multiline: true },
  { field: 'email', label: 'Email' },
  { field: 'phone', label: 'Phone' },
  { field: 'website', label: 'Website' },
];

const PAYMENT_FIELDS: Field[] = [
  { field: 'bank_account_name', label: 'Account name' },
  { field: 'bank_bsb', label: 'BSB' },
  { field: 'bank_account_number', label: 'Account number' },
  { field: 'payment_note', label: 'Payment note (printed under the bank details)' },
];

function toForm(settings: InvoiceSettings): InvoiceSettingsValues {
  return Object.fromEntries(
    INVOICE_SETTINGS_FIELDS.map((field) => [field, settings[field] ?? '']),
  ) as InvoiceSettingsValues;
}

export default function InvoiceSettingsPage() {
  const [loadedSettings, setLoadedSettings] = useState<InvoiceSettings | null>(null);
  const [form, setForm] = useState<InvoiceSettingsValues | null>(null);
  const [loadError, setLoadError] = useState('');
  const [state, dispatch, saving] = useActionState(submitInvoiceSettings, initialState);

  useEffect(() => {
    authedFetch('/api/admin/invoice-settings/')
      .then((response) => handleResponse<InvoiceSettings>(response))
      .then((result) => {
        setLoadedSettings(result);
        setForm(toForm(result));
      })
      .catch(() => setLoadError('Invoice settings could not be loaded.'));
  }, []);

  const settings = state.status === 'success' && state.settings ? state.settings : loadedSettings;
  const error = state.status === 'error' ? state.error : loadError;
  const notice = state.status === 'success' && !saving ? 'Invoice settings have been saved.' : '';

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(new FormData(event.currentTarget));
  };

  if (!settings || !form)
    return (
      <div className={pageClassName}>
        {error ? (
          <Notice tone="danger">{error}</Notice>
        ) : (
          <p className="text-text-subtle">Loading invoice settings…</p>
        )}
      </div>
    );

  const renderField = ({ field, label, multiline }: Field) => (
    <label className={adminFormLabelClassName} key={field}>
      {label}
      {multiline ? (
        <textarea
          className={cn(adminFormControlClassName, 'resize-y')}
          name={field}
          rows={3}
          value={form[field]}
          onChange={(event) => setForm({ ...form, [field]: event.target.value })}
        />
      ) : (
        <input
          className={adminFormControlClassName}
          name={field}
          value={form[field]}
          onChange={(event) => setForm({ ...form, [field]: event.target.value })}
        />
      )}
    </label>
  );

  return (
    <div className={pageClassName}>
      <PageHeader
        kicker="Settings"
        title="Invoice settings"
        subtitle="Who our invoices are from and how to pay us. Each invoice keeps the details it was issued with, so a change here only affects invoices issued afterwards."
      />

      {error && <Notice tone="danger">{error}</Notice>}
      {notice && <Notice tone="success">{notice}</Notice>}

      <form className={detailGridClassName} onSubmit={onSubmit}>
        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Business</h2>
          <div className={adminFormClassName}>{BUSINESS_FIELDS.map(renderField)}</div>
        </section>
        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Payment</h2>
          <p className="mt-0 text-label text-text-subtle">
            Printed on every unpaid invoice with the invoice number as the reference. Leave blank to
            print no bank details.
          </p>
          <div className={adminFormClassName}>{PAYMENT_FIELDS.map(renderField)}</div>
        </section>
        <section className={cn(cardClassName, cardWideClassName, 'flex items-center gap-m')}>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
          <span className="text-label text-text-subtle">
            Last updated {formatDateTime(settings.updated_at)}.
          </span>
        </section>
      </form>
    </div>
  );
}
