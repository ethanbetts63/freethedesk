'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';

import {
  downloadDocument,
  saleDocumentUrl,
  saleWarrantyNoticeUrl,
  type Sale,
} from '@/lib/dealerApi';
import { formatDateTime } from '@/lib/formatting';

/**
 * Every document the sale produces, each row offering the unsigned version
 * always and the signed version once it exists.
 *
 * Both, always, because they answer different questions. The unsigned copy is
 * what a dealer prints when a customer wants to read it on paper or when
 * something has to be redone by hand; the signed one is the record. A stale
 * signed document is labelled as stale rather than hidden — the dealer needs to
 * know it exists and why it no longer counts.
 */
export function SaleDocuments({ sale }: { sale: Sale }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  async function fetchIt(key: string, url: string, filename: string) {
    setBusy(key);
    setError('');
    try {
      await downloadDocument(url, filename);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'That document could not be produced.');
    } finally {
      setBusy('');
    }
  }

  const hasPrescribedNotice = sale.warranty.kind !== 'manufacturer';

  return (
    <>
      {error && <Notice tone="danger">{error}</Notice>}

      <ul className="m-0 grid list-none gap-s p-0">
        {sale.documents.map((row) => (
          <li
            key={row.kind}
            className="flex flex-col gap-s border-b border-border-default pb-s last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <strong className="block text-body-sm">{row.label}</strong>
              <small className="text-label text-text-subtle">
                {row.signed
                  ? `Signed by ${row.signer_name || row.signed_by_role} · ${formatDateTime(row.signed_at)}`
                  : 'Not signed yet'}
                {row.template_version && ` · form version ${row.template_version}`}
              </small>
              {row.is_stale && (
                <Notice tone="warning" size="field" className="mt-2xs inline-block">
                  The sale has changed since this was signed, so it no longer matches. The customer
                  needs to sign it again.
                </Notice>
              )}
            </div>
            <div className="flex shrink-0 gap-xs">
              <Button
                variant="secondary"
                disabled={busy === row.kind}
                onClick={() =>
                  fetchIt(
                    row.kind,
                    saleDocumentUrl(sale.reference, row.kind),
                    `${row.kind}-${sale.reference}.pdf`,
                  )
                }
              >
                {busy === row.kind ? 'Building…' : 'Unsigned'}
              </Button>
              {row.signed && (
                <Button
                  disabled={busy === `${row.kind}-signed`}
                  onClick={() =>
                    fetchIt(
                      `${row.kind}-signed`,
                      saleDocumentUrl(sale.reference, row.kind, true),
                      `${row.kind}-signed-${sale.reference}.pdf`,
                    )
                  }
                >
                  Signed
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-l border-t border-border-default pt-l">
        <strong className="block text-body-sm">{sale.warranty.title}</strong>
        <p className="mt-2xs mb-s text-label leading-relaxed text-text-muted">
          {sale.warranty.summary}
        </p>
        <p className="m-0 text-label text-text-subtle">
          {sale.warranty.acknowledged
            ? `Acknowledged by the customer ${formatDateTime(sale.warranty.acknowledged_at)}.`
            : 'Not yet acknowledged by the customer. It has to be, before they can sign anything.'}
        </p>
        {hasPrescribedNotice && (
          <div className="mt-s">
            <Button
              variant="secondary"
              disabled={busy === 'warranty'}
              onClick={() =>
                fetchIt(
                  'warranty',
                  saleWarrantyNoticeUrl(sale.reference),
                  `${sale.warranty.kind}.pdf`,
                )
              }
            >
              {busy === 'warranty' ? 'Fetching…' : 'Open the form'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
