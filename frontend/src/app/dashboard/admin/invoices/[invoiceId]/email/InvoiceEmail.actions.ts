'use server';

import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/serverApi';
import { invoiceEmailSchema } from './InvoiceEmail.schema';

export interface InvoiceEmailState {
  status: 'idle' | 'error';
  error?: string;
}

const FAILURE_MESSAGE = 'The invoice could not be sent.';

export async function submitInvoiceEmail(
  _prev: InvoiceEmailState,
  formData: FormData,
): Promise<InvoiceEmailState> {
  const parsed = invoiceEmailSchema.safeParse({
    invoiceId: formData.get('invoiceId'),
    to: formData.get('to'),
    subject: formData.get('subject'),
    body: formData.get('body'),
    attachments: formData
      .getAll('attachments')
      .filter((entry) => entry instanceof File && entry.size > 0),
  });
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  const upstream = new FormData();
  upstream.set('to', parsed.data.to);
  upstream.set('subject', parsed.data.subject);
  upstream.set('body', parsed.data.body);
  parsed.data.attachments.forEach((file) => upstream.append('attachments', file));

  let response: Response;
  try {
    response = await serverApiFetch(`/api/admin/invoices/${parsed.data.invoiceId}/email/`, {
      method: 'POST',
      body: upstream,
    });
  } catch {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  // A suppressed address answers 409: recorded, never handed to the provider.
  if (response.status === 409) {
    return {
      status: 'error',
      error:
        'Not sent: this address is on the suppression list (bounced, complained or opted out).',
    };
  }
  if (!response.ok) {
    const detail = await response
      .json()
      .then((body: { detail?: string }) => body.detail)
      .catch(() => undefined);
    return { status: 'error', error: detail ?? FAILURE_MESSAGE };
  }

  redirect(`/dashboard/admin/invoices/${parsed.data.invoiceId}`);
}
