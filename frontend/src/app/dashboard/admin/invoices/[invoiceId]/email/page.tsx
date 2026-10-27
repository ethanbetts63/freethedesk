'use client';

import Link from 'next/link';
import { type FormEvent, startTransition, useActionState, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiErrorMessage } from '@freetheplatform/web-security';

import { submitInvoiceEmail, type InvoiceEmailState } from './InvoiceEmail.actions';
import { getInvoiceEmailDraft } from '../../_lib/invoiceApi';
import { AttachmentPicker } from '@/components/dashboard/AttachmentPicker';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import {
  adminFormClassName,
  adminFormControlClassName,
  adminFormLabelClassName,
  adminFormTextareaClassName,
} from '@/components/ui/formControl';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { backClassName, pageClassName } from '@/components/ui/layout';
import {
  adminComposeBadgeClassName,
  adminComposeCardClassName,
  adminComposePageClassName,
} from '@/components/dashboard/adminLayout';

const initialState: InvoiceEmailState = { status: 'idle' };

export default function InvoiceEmailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [automatic, setAutomatic] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [state, dispatch, isPending] = useActionState(submitInvoiceEmail, initialState);

  useEffect(() => {
    let cancelled = false;
    getInvoiceEmailDraft(invoiceId)
      .then((draft) => {
        if (cancelled) return;
        setTo(draft.to);
        setSubject(draft.subject);
        setBody(draft.body);
        setAutomatic(draft.automatic_attachments);
        setLoaded(true);
      })
      .catch((reason) => {
        if (!cancelled)
          setLoadError(apiErrorMessage(reason, 'The invoice email could not be prepared.'));
      });
    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  // Built by hand rather than through <form action>: the attachment list lives in React state, and
  // the first submit only arms the confirm step. useActionState accepts a dispatched FormData the same.
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    const formData = new FormData();
    formData.set('invoiceId', invoiceId);
    formData.set('to', to);
    formData.set('subject', subject);
    formData.set('body', body);
    attachments.forEach((file) => formData.append('attachments', file));
    startTransition(() => dispatch(formData));
  }

  return (
    <div className={cn(pageClassName, adminComposePageClassName)}>
      <Link className={backClassName} href={`/dashboard/admin/invoices/${invoiceId}`}>
        ← Back to invoice
      </Link>
      <section className={adminComposeCardClassName}>
        <PageHeader
          className="mb-l border-b border-border-default pb-ml"
          kicker="Outbound message"
          title="Email invoice"
        >
          {automatic.map((name) => (
            <span key={name} className={adminComposeBadgeClassName}>
              Attached: {name}
            </span>
          ))}
        </PageHeader>
        {loadError && <Notice tone="danger">{loadError}</Notice>}
        {state.status === 'error' && <Notice tone="danger">{state.error}</Notice>}
        {loaded && (
          <form className={adminFormClassName} onSubmit={submit}>
            <label className={adminFormLabelClassName}>
              To
              <input
                className={adminFormControlClassName}
                type="email"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                required
              />
            </label>
            <label className={adminFormLabelClassName}>
              Subject
              <input
                className={adminFormControlClassName}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                required
              />
            </label>
            <label className={adminFormLabelClassName}>
              Email body
              <textarea
                className={adminFormTextareaClassName}
                rows={16}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                required
              />
            </label>
            <AttachmentPicker
              title="Other attachments"
              hint="The invoice PDF is attached automatically. Up to 10 more files; 20 MB in total."
              files={attachments}
              onChange={setAttachments}
            />
            {confirming && (
              <Notice tone="warning" role="alert">
                Send this invoice to <strong>{to}</strong>? Press send again to confirm, or{' '}
                <Button variant="inline" type="button" onClick={() => setConfirming(false)}>
                  cancel
                </Button>
                .
              </Notice>
            )}
            <Button className="self-start" type="submit" disabled={isPending}>
              {isPending ? 'Sending…' : confirming ? 'Confirm and send' : 'Send invoice'}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
