'use client';

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { cardClassName, cardTitleClassName } from '@/components/ui/Card';
import {
  adminFormControlClassName,
  adminFormLabelClassName,
  formControlClassName,
  formControlPaddingClassName,
} from '@/components/ui/formControl';
import { dateInputValue, formatDayMonthYearInput, formatMoney } from '@/lib/formatting';
import { cn } from '@/lib/utils';
import {
  EMPTY_LINE,
  invoiceFormSchema,
  type InvoiceFormInput,
  type InvoiceFormValues,
} from '../_lib/InvoiceForm.schema';
import { relatedHref, relatedName } from '../_lib/invoiceStatus';
import { lineAmount, previewTotals } from '../_lib/invoiceTotals';
import type {
  CustomerCandidate,
  InvoiceConfig,
  InvoiceInput,
  RelatedRecord,
} from '../_lib/invoiceTypes';
import CustomerPicker from './CustomerPicker';

const cellControlClassName = cn(formControlClassName, formControlPaddingClassName);
const errorClassName = 'mt-3xs block text-label font-normal text-text-danger';

/**
 * The one editor for a new invoice and a draft being changed. Lines are a repeatable group, so it
 * is Track A: react-hook-form with the schema as its resolver.
 *
 * No tax controls: freethedesk is not registered for GST, so nothing here may present any part of
 * a price as tax (`_docs/stripe-subscriptions.md`). The server forces every line untaxed as well.
 */
export default function InvoiceForm({
  config,
  initialValues,
  initialRelated,
  submitLabel,
  onSubmit,
}: {
  config: InvoiceConfig;
  initialValues: InvoiceFormInput;
  initialRelated: RelatedRecord | null;
  submitLabel: string;
  onSubmit: (input: InvoiceInput) => Promise<void>;
}) {
  const [related, setRelated] = useState<RelatedRecord | null>(initialRelated);
  const [saving, setSaving] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormInput, unknown, InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: initialValues,
  });
  const { fields, append, remove, move } = useFieldArray({ control, name: 'lines' });
  // `useWatch`, not `watch`: `watch` returns a new function each render, which the React Compiler cannot memoize.
  const lines = useWatch({ control, name: 'lines' }) ?? [];
  const totals = previewTotals(
    lines.map((line) => ({
      quantity: line.quantity ?? '0',
      unit_price: line.unit_price ?? '0',
      taxable: false,
    })),
    { taxRate: 0, pricesIncludeTax: true },
  );

  const pickCustomer = (candidate: CustomerCandidate) => {
    const customer = candidate.customer;
    (Object.keys(customer) as (keyof typeof customer)[]).forEach((key) =>
      setValue(key, customer[key] ?? '', { shouldDirty: true }),
    );
    if (candidate.related) setRelated(candidate.related);
  };

  const submit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await onSubmit({
        ...values,
        prices_include_tax: true,
        lines: values.lines.map((line) => ({ ...line, taxable: false })),
        issue_date: dateInputValue(values.issue_date),
        due_date: dateInputValue(values.due_date),
        related_type: related?.type ?? '',
        related_id: related?.id ?? null,
      });
    } finally {
      setSaving(false);
    }
  });

  const dateField = (name: 'issue_date' | 'due_date') =>
    register(name, {
      onChange: (event) => setValue(name, formatDayMonthYearInput(event.target.value)),
    });

  const relatedLink = related ? relatedHref(related) : null;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-l">
      {config.seller_problems.length > 0 && (
        <Notice tone="warning">
          This invoice can be saved, but not issued, until the{' '}
          <Link className="underline" href="/dashboard/admin/settings/invoicing">
            invoice settings
          </Link>{' '}
          have {config.seller_problems.join(' and ')}.
        </Notice>
      )}

      <section className={cardClassName}>
        <h2 className={cardTitleClassName}>Customer</h2>
        <CustomerPicker onPick={pickCustomer} />

        {related && (
          <p className="mt-m mb-0 flex flex-wrap items-center gap-xs text-body-sm">
            Linked to {relatedName(related)}{' '}
            {relatedLink ? (
              <Link className="font-heavy underline" href={relatedLink}>
                {related.label}
              </Link>
            ) : (
              <strong>{related.label}</strong>
            )}
            <Button variant="inline" type="button" onClick={() => setRelated(null)}>
              unlink
            </Button>
          </p>
        )}

        <div className="mt-m grid grid-cols-[minmax(0,1fr)] gap-m sm:grid-cols-2">
          <Field
            label="Name"
            field={register('customer_name')}
            error={errors.customer_name?.message}
          />
          <Field
            label="Business name"
            field={register('customer_company')}
            error={errors.customer_company?.message}
          />
          <Field
            label="Email"
            type="email"
            field={register('customer_email')}
            error={errors.customer_email?.message}
          />
          <Field
            label="Phone"
            field={register('customer_phone')}
            error={errors.customer_phone?.message}
          />
          <label className={adminFormLabelClassName}>
            Address
            <textarea
              className={cn(adminFormControlClassName, 'resize-y')}
              rows={3}
              placeholder={'12 Smith St\nPerth WA 6000'}
              {...register('customer_address')}
            />
          </label>
          <Field
            label="Customer ABN"
            field={register('customer_abn')}
            error={errors.customer_abn?.message}
          />
        </div>
      </section>

      <section className={cardClassName}>
        <h2 className={cardTitleClassName}>Lines</h2>
        {errors.lines?.message && <Notice tone="danger">{errors.lines.message}</Notice>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-border-default text-left text-label text-text-subtle uppercase">
                <th className="py-xs pr-s">Description</th>
                <th className="w-24 py-xs pr-s">Qty</th>
                <th className="w-36 py-xs pr-s">Unit price</th>
                <th className="w-28 py-xs pr-s text-right">Amount</th>
                <th className="w-28" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const line = lines[index] ?? field;
                const lineErrors = errors.lines?.[index];
                return (
                  <tr key={field.id} className="border-b border-border-default align-top">
                    <td className="py-s pr-s">
                      <textarea
                        className={cn(cellControlClassName, 'resize-y')}
                        rows={2}
                        placeholder="What was supplied"
                        aria-label={`Line ${index + 1} description`}
                        {...register(`lines.${index}.description`)}
                      />
                      <input
                        className={cn(cellControlClassName, 'mt-2xs max-w-[220px] font-mono')}
                        placeholder="Code (optional)"
                        aria-label={`Line ${index + 1} code`}
                        {...register(`lines.${index}.item_code`)}
                      />
                      {lineErrors?.description?.message && (
                        <span className={errorClassName}>{lineErrors.description.message}</span>
                      )}
                    </td>
                    <td className="py-s pr-s">
                      <input
                        className={cellControlClassName}
                        inputMode="decimal"
                        aria-label={`Line ${index + 1} quantity`}
                        {...register(`lines.${index}.quantity`)}
                      />
                      {lineErrors?.quantity?.message && (
                        <span className={errorClassName}>{lineErrors.quantity.message}</span>
                      )}
                    </td>
                    <td className="py-s pr-s">
                      <input
                        className={cellControlClassName}
                        inputMode="decimal"
                        placeholder="0.00"
                        aria-label={`Line ${index + 1} unit price`}
                        {...register(`lines.${index}.unit_price`)}
                      />
                      {lineErrors?.unit_price?.message && (
                        <span className={errorClassName}>{lineErrors.unit_price.message}</span>
                      )}
                    </td>
                    <td className="py-s pr-s text-right font-heavy">
                      {formatMoney(
                        lineAmount({
                          quantity: line.quantity ?? '0',
                          unit_price: line.unit_price ?? '0',
                        }),
                      )}
                    </td>
                    <td className="py-s">
                      <div className="flex justify-end gap-2xs">
                        <Button
                          variant="quiet"
                          type="button"
                          aria-label={`Move line ${index + 1} up`}
                          disabled={index === 0}
                          onClick={() => move(index, index - 1)}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="quiet"
                          type="button"
                          aria-label={`Remove line ${index + 1}`}
                          disabled={fields.length === 1}
                          onClick={() => remove(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Button
          className="mt-m"
          variant="secondary"
          type="button"
          onClick={() => append({ ...EMPTY_LINE, taxable: false })}
        >
          ＋ Add line
        </Button>
      </section>

      <section className="grid grid-cols-[minmax(0,1fr)] gap-l sm:grid-cols-2">
        <div className={cn(cardClassName, 'flex flex-col gap-m')}>
          <h2 className={cn(cardTitleClassName, 'mb-0')}>Dates</h2>
          <div className="grid grid-cols-2 gap-m">
            <Field
              label="Issue date"
              field={dateField('issue_date')}
              error={errors.issue_date?.message}
              placeholder="DD/MM/YYYY"
              inputMode="numeric"
            />
            <Field
              label="Due date"
              field={dateField('due_date')}
              error={errors.due_date?.message}
              placeholder="DD/MM/YYYY"
              inputMode="numeric"
            />
          </div>
        </div>

        <div className={cn(cardClassName, 'self-start')}>
          <div className="flex justify-between text-lead font-heavy">
            <span>Total {config.currency}</span>
            <span>{formatMoney(totals.total)}</span>
          </div>
          <p className="mt-s mb-0 text-label text-text-subtle">
            Saved as a draft. It gets its number when you issue it, and can&apos;t be changed after
            that.
          </p>
        </div>
      </section>

      <Button className="self-start" type="submit" disabled={saving}>
        {saving ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}

function Field({
  label,
  field,
  error,
  type = 'text',
  ...input
}: {
  label: string;
  /** The spread of a react-hook-form `register(...)` call. */
  field: UseFormRegisterReturn;
  error?: string;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return (
    <label className={adminFormLabelClassName}>
      {label}
      <input className={adminFormControlClassName} {...input} type={type} {...field} />
      {error && <span className={errorClassName}>{error}</span>}
    </label>
  );
}
