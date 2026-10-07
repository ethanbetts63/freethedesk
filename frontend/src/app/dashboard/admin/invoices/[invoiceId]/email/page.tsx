'use client';

import Link from 'next/link';
import {
  type FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useParams } from 'next/navigation';
import { apiErrorMessage } from '@freetheplatform/web-security';

import { submitInvoiceEmail, type InvoiceEmailState } from './InvoiceEmail.actions';
import { getInvoiceEmailDraft } from '../../_lib/invoiceApi';
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
  const inputRef = useRef<HTMLInputElement>(null);
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
            <section className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-s rounded-sm border border-border-default bg-surface-tint p-m">
              <div>
                <strong className="block">Other attachments</strong>
                <small className="mt-3xs block text-label text-text-subtle">
                  The invoice PDF is attached automatically. Up to 10 more files; 20 MB in total.
                </small>
              </div>
              <Button variant="quiet" type="button" onClick={() => inputRef.current?.click()}>
                Attach files
              </Button>
              <input
                ref={inputRef}
                type="file"
                multiple
                hidden
                onChange={(event) => {
                  setAttachments((current) => [
                    ...current,
                    ...Array.from(event.target.files ?? []),
                  ]);
                  event.target.value = '';
                }}
              />
              {attachments.length > 0 && (
                <ul className="col-[1/-1] m-0 list-none p-0">
                  {attachments.map((file, index) => (
                    <li
                      className="flex items-center justify-between border-t border-border-default py-xs text-caption"
                      key={`${file.name}-${index}`}
                    >
                      <span>
                        {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                      <button
                        className="cursor-pointer border-0 bg-transparent text-caption font-heavy text-text-danger"
                        type="button"
                        onClick={() =>
                          setAttachments((current) =>
                            current.filter((_, currentIndex) => currentIndex !== index),
                          )
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
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
