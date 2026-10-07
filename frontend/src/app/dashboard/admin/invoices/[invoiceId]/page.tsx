'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiErrorMessage } from '@freetheplatform/web-security';

import { StatusPill } from '@/components/dashboard/StatusPill';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import {
  DetailItem,
  cardClassName,
  cardTitleClassName,
  cardWideClassName,
  detailGridClassName,
  detailListClassName,
} from '@/components/ui/Card';
import { adminFormControlClassName, adminFormLabelClassName } from '@/components/ui/formControl';
import { PageHeader } from '@/components/ui/PageHeader';
import { backClassName, pageClassName } from '@/components/ui/layout';
import { formatDate, formatDateTime, formatMoney } from '@/lib/formatting';
import { cn } from '@/lib/utils';
import {
  deleteInvoice,
  getInvoice,
  getInvoiceConfig,
  getInvoiceMessages,
  invoiceAction,
  invoicePdfUrl,
  type InvoiceAction,
} from '../_lib/invoiceApi';
import { displayStatus, relatedHref, relatedName } from '../_lib/invoiceStatus';
import type { Invoice, InvoiceConfig, InvoiceMessage } from '../_lib/invoiceTypes';

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [config, setConfig] = useState<InvoiceConfig | null>(null);
  const [messages, setMessages] = useState<InvoiceMessage[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState<{ method: string; reference: string } | null>(null);
  const [voiding, setVoiding] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getInvoice(invoiceId), getInvoiceConfig()])
      .then(([loaded, loadedConfig]) => {
        setInvoice(loaded);
        setConfig(loadedConfig);
        // The log is a convenience here; the invoice works without it.
        getInvoiceMessages(loaded.id)
          .then(setMessages)
          .catch(() => setMessages([]));
      })
      .catch((reason) => setError(apiErrorMessage(reason, 'Invoice not found.')));
  }, [invoiceId]);

  if (!invoice || !config) {
    return (
      <div className={pageClassName}>
        {error ? (
          <Notice tone="danger">{error}</Notice>
        ) : (
          <p className="text-text-subtle">Loading…</p>
        )}
      </div>
    );
  }

  const run = async (action: InvoiceAction, success: string, body?: Record<string, string>) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await invoiceAction(invoice.id, action, body);
      setNotice(success);
      return result;
    } catch (reason) {
      setError(apiErrorMessage(reason, 'That did not work.'));
      return null;
    } finally {
      setBusy(false);
    }
  };

  const canEmail = config.can_email && Boolean(invoice.customer_email);

  const issue = async (thenEmail: boolean) => {
    if (
      !confirm('Issue this invoice? It gets the next invoice number and can no longer be edited.')
    )
      return;
    const issued = await run('issue', 'Invoice issued.');
    if (!issued) return;
    setInvoice(issued);
    if (thenEmail) router.push(`/dashboard/admin/invoices/${issued.id}/email`);
  };

  const recordPayment = async () => {
    if (!payment) return;
    const paid = await run('mark-paid', 'Payment recorded.', {
      method: payment.method,
      reference: payment.reference.trim(),
    });
    if (paid) {
      setInvoice(paid);
      setPayment(null);
    }
  };

  const confirmVoid = async () => {
    if (!voiding?.trim()) return;
    const voided = await run('void', 'Invoice voided.', { reason: voiding.trim() });
    if (voided) {
      setInvoice(voided);
      setVoiding(null);
    }
  };

  const duplicate = async () => {
    const copy = await run('duplicate', 'Copied to a new draft.');
    if (copy) router.push(`/dashboard/admin/invoices/${copy.id}/edit`);
  };

  const remove = async () => {
    if (!confirm('Delete this draft? This cannot be undone.')) return;
    setBusy(true);
    try {
      await deleteInvoice(invoice.id);
      router.push('/dashboard/admin/invoices');
    } catch (reason) {
      setError(apiErrorMessage(reason, 'The draft could not be deleted.'));
      setBusy(false);
    }
  };

  const link = invoice.related ? relatedHref(invoice.related) : null;

  return (
    <div className={pageClassName}>
      <Link className={backClassName} href="/dashboard/admin/invoices">
        ← Back to invoices
      </Link>
      <PageHeader
        kicker="Invoice"
        title={invoice.number || 'Draft invoice'}
        subtitle={`${invoice.customer_company || invoice.customer_name} · ${formatMoney(invoice.total)} · due ${formatDate(invoice.due_date)}`}
        align="center"
      >
        <StatusPill status={displayStatus(invoice)} />
      </PageHeader>

      {error && <Notice tone="danger">{error}</Notice>}
      {notice && <Notice tone="success">{notice}</Notice>}
      {config.seller_problems.length > 0 && invoice.status === 'draft' && (
        <Notice tone="warning">
          Add {config.seller_problems.join(' and ')} in{' '}
          <Link className="underline" href="/dashboard/admin/settings/invoicing">
            invoice settings
          </Link>{' '}
          before issuing.
        </Notice>
      )}

      <div className="mb-l flex flex-wrap gap-xs">
        {invoice.status === 'draft' && (
          <>
            <Button onClick={() => issue(canEmail)} disabled={busy}>
              {canEmail ? 'Issue and email' : 'Issue'}
            </Button>
            {canEmail && (
              <Button variant="secondary" onClick={() => issue(false)} disabled={busy}>
                Issue without emailing
              </Button>
            )}
            <Button variant="secondary" href={`/dashboard/admin/invoices/${invoice.id}/edit`}>
              Edit
            </Button>
          </>
        )}
        {/* Not links: the PDF is an API response, which client-side navigation cannot render. */}
        <Button
          variant="secondary"
          onClick={() => window.open(invoicePdfUrl(invoice.id), '_blank', 'noopener')}
        >
          {invoice.status === 'draft' ? 'Preview PDF' : 'View PDF'}
        </Button>
        {invoice.status !== 'draft' && (
          <Button
            variant="secondary"
            onClick={() => window.location.assign(invoicePdfUrl(invoice.id, true))}
          >
            Download
          </Button>
        )}
        {(invoice.status === 'issued' || invoice.status === 'paid') && config.can_email && (
          <Button variant="secondary" href={`/dashboard/admin/invoices/${invoice.id}/email`}>
            {invoice.last_sent_at ? 'Email again' : 'Email'}
          </Button>
        )}
        {invoice.status === 'issued' && (
          <Button
            onClick={() => setPayment({ method: 'bank_transfer', reference: '' })}
            disabled={busy || payment !== null}
          >
            Mark paid
          </Button>
        )}
        {invoice.status === 'paid' && (
          <Button
            variant="secondary"
            disabled={busy}
            onClick={async () => {
              if (
                !confirm('Remove the recorded payment? The invoice goes back to awaiting payment.')
              )
                return;
              const unpaid = await run('mark-unpaid', 'Payment removed.');
              if (unpaid) setInvoice(unpaid);
            }}
          >
            Mark unpaid
          </Button>
        )}
        {invoice.status !== 'draft' && (
          <Button variant="secondary" onClick={duplicate} disabled={busy}>
            Duplicate
          </Button>
        )}
        {invoice.status === 'issued' && (
          <Button
            variant="secondary"
            onClick={() => setVoiding('')}
            disabled={busy || voiding !== null}
          >
            Void
          </Button>
        )}
        {invoice.status === 'draft' && (
          <Button variant="secondary" onClick={remove} disabled={busy}>
            Delete draft
          </Button>
        )}
      </div>

      {payment && (
        <section className={cn(cardClassName, 'mb-l')}>
          <h2 className={cardTitleClassName}>Record payment of {formatMoney(invoice.total)}</h2>
          <div className="grid grid-cols-[minmax(0,1fr)] items-end gap-m sm:grid-cols-3">
            <label className={adminFormLabelClassName}>
              Method
              <select
                className={adminFormControlClassName}
                value={payment.method}
                onChange={(event) => setPayment({ ...payment, method: event.target.value })}
              >
                {config.payment_methods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={adminFormLabelClassName}>
              Reference
              <input
                className={adminFormControlClassName}
                value={payment.reference}
                maxLength={64}
                placeholder="Bank transaction or receipt"
                onChange={(event) => setPayment({ ...payment, reference: event.target.value })}
              />
            </label>
            <div className="flex gap-xs">
              <Button onClick={recordPayment} disabled={busy}>
                Record payment
              </Button>
              <Button variant="quiet" onClick={() => setPayment(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </section>
      )}

      {voiding !== null && (
        <section className={cn(cardClassName, 'mb-l')}>
          <h2 className={cardTitleClassName}>Void this invoice</h2>
          <label className={adminFormLabelClassName}>
            Reason (printed on the void copy)
            <input
              className={adminFormControlClassName}
              value={voiding}
              maxLength={255}
              onChange={(event) => setVoiding(event.target.value)}
            />
          </label>
          <div className="mt-m flex gap-xs">
            <Button onClick={confirmVoid} disabled={busy || !voiding.trim()}>
              Void invoice
            </Button>
            <Button variant="quiet" onClick={() => setVoiding(null)}>
              Cancel
            </Button>
          </div>
        </section>
      )}

      <div className={detailGridClassName}>
        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Bill to</h2>
          <p className="m-0 text-body-sm font-heavy">{invoice.customer_name}</p>
          <p className="m-0 text-body-sm leading-normal whitespace-pre-line">
            {[
              invoice.customer_company,
              invoice.customer_address,
              invoice.customer_abn && `ABN ${invoice.customer_abn}`,
              invoice.customer_email,
              invoice.customer_phone,
            ]
              .filter(Boolean)
              .join('\n')}
          </p>
          {invoice.related && (
            <p className="mt-m mb-0 text-label text-text-subtle">
              {relatedName(invoice.related)}:{' '}
              {link ? (
                <Link className="font-heavy underline" href={link}>
                  {invoice.related.label}
                </Link>
              ) : (
                invoice.related.label
              )}
            </p>
          )}
        </section>

        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Details</h2>
          <dl className={detailListClassName}>
            <DetailItem term="Issued">{formatDate(invoice.issue_date)}</DetailItem>
            <DetailItem term="Due">{formatDate(invoice.due_date)}</DetailItem>
            <DetailItem term="Their reference">{invoice.customer_reference || '—'}</DetailItem>
            <DetailItem term="Balance due">{formatMoney(invoice.balance_due)}</DetailItem>
            <DetailItem term="Paid">
              {invoice.paid_on
                ? `${formatDate(invoice.paid_on)}${invoice.payment_reference ? ` · ${invoice.payment_reference}` : ''}`
                : '—'}
            </DetailItem>
            <DetailItem term="Last emailed">
              {invoice.last_sent_at
                ? `${formatDateTime(invoice.last_sent_at)} to ${invoice.last_sent_to}`
                : 'Not yet'}
            </DetailItem>
          </dl>
          {invoice.void_reason && (
            <p className="mt-m mb-0 text-body-sm text-text-danger">Void: {invoice.void_reason}</p>
          )}
        </section>

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Lines</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-label text-text-subtle uppercase">
                  <th className="py-xs">Description</th>
                  <th className="py-xs text-right">Qty</th>
                  <th className="py-xs text-right">Unit price</th>
                  <th className="py-xs text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line) => (
                  <tr key={line.id} className="border-b border-border-default align-top">
                    <td className="py-xs pr-m">
                      {line.item_code && (
                        <span className="block font-mono text-label text-text-subtle">
                          {line.item_code}
                        </span>
                      )}
                      <span className="whitespace-pre-line">{line.description}</span>
                    </td>
                    <td className="py-xs text-right">{Number(line.quantity)}</td>
                    <td className="py-xs text-right">{formatMoney(line.unit_price)}</td>
                    <td className="py-xs text-right font-heavy">{formatMoney(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-m mb-0 flex justify-end gap-l text-lead font-heavy">
            <span>Total {config.currency}</span>
            <span>{formatMoney(invoice.total)}</span>
          </p>
          {invoice.notes && (
            <p className="mt-m mb-0 text-body-sm whitespace-pre-line text-text-subtle">
              {invoice.notes}
            </p>
          )}
        </section>

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Emails sent</h2>
          {messages.length === 0 ? (
            <p className="m-0 text-body-sm text-text-subtle">None yet.</p>
          ) : (
            <ul className="m-0 list-none p-0 text-body-sm">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className="flex flex-wrap justify-between gap-xs border-b border-border-default py-xs last:border-b-0"
                >
                  <Link className="underline" href={`/dashboard/admin/messages/${message.id}`}>
                    {message.subject}
                  </Link>
                  <span className="text-text-subtle">
                    {message.to} · {message.status} ·{' '}
                    {formatDateTime(message.sent_at ?? message.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
