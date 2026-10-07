'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { pageClassName } from '@/components/ui/layout';
import InvoiceEditorPage from '../_components/InvoiceEditorPage';
import { newInvoiceValues } from '../_lib/invoiceFormValues';
import { createInvoice, getInvoicePrefill } from '../_lib/invoiceApi';

function NewInvoice() {
  const router = useRouter();
  const params = useSearchParams();
  const relatedType = params.get('related_type') ?? '';
  const relatedId = params.get('related_id') ?? '';

  return (
    <InvoiceEditorPage
      title="New invoice"
      backHref="/dashboard/admin/invoices"
      submitLabel="Save draft"
      load={async (config) => {
        if (!relatedType || !relatedId) return { values: newInvoiceValues(config), related: null };
        const prefill = await getInvoicePrefill(relatedType, relatedId);
        return { values: newInvoiceValues(config, prefill), related: prefill.related };
      }}
      save={async (input) => {
        const invoice = await createInvoice(input);
        router.push(`/dashboard/admin/invoices/${invoice.id}`);
      }}
    />
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className={pageClassName}>
          <p className="text-text-subtle">Loading…</p>
        </div>
      }
    >
      <NewInvoice />
    </Suspense>
  );
}
