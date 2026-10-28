'use client';

import Link from 'next/link';
import { type FormEvent, Suspense, startTransition, useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitComposeMessage, type ComposeMessageState } from './ComposeMessage.actions';
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

const initialState: ComposeMessageState = { status: 'idle' };

function ComposeMessageContent() {
  const params = useSearchParams();
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
    startTransition(() => dispatch(formData));
  }

  return (
    <div className={cn(pageClassName, adminComposePageClassName)}>
      <Link
        className={backClassName}
        href={
          relatedEnquiry
            ? `/dashboard/admin/enquiries/${relatedEnquiry}`
            : '/dashboard/admin/messages'
        }
      >
        ← Back
      </Link>
      <section className={adminComposeCardClassName}>
        <PageHeader
          className="mb-l border-b border-border-default pb-ml"
          kicker="Outbound message"
          title="Compose email"
        >
          {relatedEnquiry && (
            <span className={adminComposeBadgeClassName}>Linked to enquiry #{relatedEnquiry}</span>
          )}
        </PageHeader>
        {state.status === 'error' && <Notice tone="danger">{state.error}</Notice>}
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
            <small className="mt-2xs block text-label font-normal text-text-subtle">
              Sent as plain text, exactly as written, like a personal email.
            </small>
          </label>
          <AttachmentPicker
            title="Attachments"
            hint="Up to 10 files; 20 MB each and 24 MB total."
            files={attachments}
            onChange={setAttachments}
          />
          {confirming && (
            <Notice tone="warning" role="alert">
              Send this email to <strong>{to}</strong>? Press send again to confirm, or{' '}
              <Button variant="inline" type="button" onClick={() => setConfirming(false)}>
                cancel
              </Button>
              .
            </Notice>
          )}
          <Button className="self-start" type="submit" disabled={isPending}>
            {isPending ? 'Sending…' : confirming ? 'Confirm and send' : 'Send email'}
          </Button>
        </form>
      </section>
    </div>
  );
}

export default function ComposeMessagePage() {
  return (
    <Suspense
      fallback={
        <div className={pageClassName}>
          <p className="text-text-subtle">Loading composer…</p>
        </div>
      }
    >
      <ComposeMessageContent />
    </Suspense>
  );
}
