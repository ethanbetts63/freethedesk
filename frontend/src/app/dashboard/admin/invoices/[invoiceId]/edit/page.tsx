'use client';

import { useParams, useRouter } from 'next/navigation';

import InvoiceEditorPage from '../../_components/InvoiceEditorPage';
import { draftValues } from '../../_lib/invoiceFormValues';
import { getInvoice, updateInvoice } from '../../_lib/invoiceApi';

export default function EditInvoicePage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const router = useRouter();

  return (
    <InvoiceEditorPage
      title="Edit draft invoice"
      backHref={`/dashboard/admin/invoices/${invoiceId}`}
      submitLabel="Save changes"
      load={async () => {
        const invoice = await getInvoice(invoiceId);
        // Only a draft can change; an issued invoice is voided and duplicated instead.
        if (invoice.status !== 'draft') router.replace(`/dashboard/admin/invoices/${invoiceId}`);
        return { values: draftValues(invoice), related: invoice.related };
      }}
      save={async (input) => {
        await updateInvoice(invoiceId, input);
        router.push(`/dashboard/admin/invoices/${invoiceId}`);
      }}
    />
  );
}
