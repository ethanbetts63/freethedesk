'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useActionState, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitComposeMessage, type ComposeMessageState } from './ComposeMessage.actions';
import { AdminButton } from '@/components/dashboard/AdminButton';
import { AdminNotice } from '@/components/dashboard/AdminNotice';
import {
  adminFormClassName,
  adminFormControlClassName,
  adminFormLabelClassName,
  adminFormTextareaClassName,
} from '@/components/dashboard/formControl';
import { cn } from '@/lib/utils';
import { AdminPageHeader } from '@/components/dashboard/AdminPageHeader';
import {
  adminBackClassName,
  adminComposeBadgeClassName,
  adminComposeCardClassName,
  adminComposePageClassName,
  adminPageClassName,
} from '@/components/dashboard/adminLayout';

const initialState: ComposeMessageState = { status: 'idle' };

function ComposeMessageContent() {
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [to, setTo] = useState(params.get('to') || '');
  const [subject, setSubject] = useState(params.get('subject') || '');
  const [body, setBody] = useState(params.get('body') || '');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [confirming, setConfirming] = useState(false);
  const relatedEnquiry = Number(params.get('enquiry')) || undefined;

  const [state, dispatch, isPending] = useActionState(submitComposeMessage, initialState);

  // Not wired through <form action>: the attachment list lives in React state
  // (the file input is cleared after every pick so the same picker can be
  // reused to add more), and the first submit only arms the confirm step
  // rather than sending. Both mean the FormData has to be built by hand and
  // handed to the action dispatcher directly, which useActionState supports
  // the same as native form-action submission.
  function submit(event: FormEvent) {
    event.preventDefault();

    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);

    const formData = new FormData();
    formData.set('to', to);
    formData.set('subject', subject);
    formData.set('body', body);
    if (relatedEnquiry) formData.set('relatedEnquiry', String(relatedEnquiry));
    attachments.forEach((file) => formData.append('attachments', file));
    dispatch(formData);
  }

  return (
    <div className={cn(adminPageClassName, adminComposePageClassName)}>
      <Link
        className={adminBackClassName}
        href={relatedEnquiry ? `/dashboard/enquiries/${relatedEnquiry}` : '/dashboard/messages'}
      >
        ← Back
      </Link>
      <section className={adminComposeCardClassName}>
        <AdminPageHeader
          className="mb-l border-b border-border-default pb-ml"
          kicker="Outbound message"
          title="Compose email"
        >
          {relatedEnquiry && (
            <span className={adminComposeBadgeClassName}>Linked to enquiry #{relatedEnquiry}</span>
          )}
        </AdminPageHeader>
        {state.status === 'error' && <AdminNotice tone="danger">{state.error}</AdminNotice>}
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
              rows={18}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              required
            />
          </label>
          <section className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-s rounded-sm border border-border-default bg-surface-tint p-m">
            <div>
              <strong className="block">Attachments</strong>
              <small className="mt-3xs block text-caption-sm text-text-subtle">
                Up to 10 files; 20 MB each and 24 MB total.
              </small>
            </div>
            <AdminButton variant="quiet" onClick={() => inputRef.current?.click()}>
              Attach files
            </AdminButton>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              onChange={(event) => {
                setAttachments((current) => [...current, ...Array.from(event.target.files ?? [])]);
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
            <AdminNotice tone="warning" role="alert">
              Send this email to <strong>{to}</strong>? Press send again to confirm, or{' '}
              <AdminButton variant="inline" type="button" onClick={() => setConfirming(false)}>
                cancel
              </AdminButton>
              .
            </AdminNotice>
          )}
          <AdminButton className="self-start" type="submit" disabled={isPending}>
            {isPending ? 'Sending…' : confirming ? 'Confirm and send' : 'Send email'}
          </AdminButton>
        </form>
      </section>
    </div>
  );
}

export default function ComposeMessagePage() {
  return (
    <Suspense
      fallback={
        <div className={adminPageClassName}>
          <p className="text-text-subtle">Loading composer…</p>
        </div>
      }
    >
      <ComposeMessageContent />
    </Suspense>
  );
}
