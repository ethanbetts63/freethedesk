'use server';

import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/serverApi';
import { ENQUIRY_TYPE } from '@/lib/adminApi';
import { composeMessageSchema } from './ComposeMessage.schema';

export interface ComposeMessageState {
  status: 'idle' | 'error';
  error?: string;
}

const FAILURE_MESSAGE = 'Email could not be sent.';

export async function submitComposeMessage(
  _prev: ComposeMessageState,
  formData: FormData,
): Promise<ComposeMessageState> {
  const relatedEnquiryRaw = formData.get('relatedEnquiry');
  const parsed = composeMessageSchema.safeParse({
    to: formData.get('to'),
    subject: formData.get('subject'),
    body: formData.get('body'),
    relatedEnquiry: relatedEnquiryRaw || undefined,
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
  if (parsed.data.relatedEnquiry) {
    upstream.set('related_type', ENQUIRY_TYPE);
    upstream.set('related_id', String(parsed.data.relatedEnquiry));
  }
  parsed.data.attachments.forEach((file) => upstream.append('attachments', file));

  let response: Response;
  try {
    response = await serverApiFetch('/api/admin/messages/compose/', {
      method: 'POST',
      body: upstream,
    });
  } catch {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  // A send failure answers 502 with the recorded message - still a failure to report.
  if (!response.ok) {
    return { status: 'error', error: FAILURE_MESSAGE };
  }

  redirect(
    parsed.data.relatedEnquiry
      ? `/dashboard/enquiries/${parsed.data.relatedEnquiry}`
      : '/dashboard/messages',
  );
}
