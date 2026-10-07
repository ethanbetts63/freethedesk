'use server';

import { serverApiFetch } from '@/lib/serverApi';
import { invoiceSettingsSchema, type InvoiceSettingsValues } from './InvoiceSettings.schema';

export type InvoiceSettings = InvoiceSettingsValues & { updated_at: string };

export interface InvoiceSettingsState {
  status: 'idle' | 'success' | 'error';
  error?: string;
  settings?: InvoiceSettings;
}

const FAILURE_MESSAGE = 'Invoice settings could not be saved.';

export async function submitInvoiceSettings(
  _prev: InvoiceSettingsState,
  formData: FormData,
): Promise<InvoiceSettingsState> {
  const parsed = invoiceSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  const response = await serverApiFetch('/api/admin/invoice-settings/', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });
  if (!response.ok) {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  return { status: 'success', settings: (await response.json()) as InvoiceSettings };
}
