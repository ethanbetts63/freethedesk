'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useActionState, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitComposeMessage, type ComposeMessageState } from './ComposeMessage.actions';
import { AdminButton } from '@/components/dashboard/AdminButton';
import { AdminNotice } from '@/components/dashboard/AdminNotice';

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
    <div className="admin-page admin-compose-page">
      <Link
        className="admin-back"
        href={relatedEnquiry ? `/dashboard/enquiries/${relatedEnquiry}` : '/dashboard/messages'}
      >
        ← Back
      </Link>
      <section className="admin-compose-card">
        <header>
          <div>
            <p className="admin-kicker">Outbound message</p>
            <h1>Compose email</h1>
          </div>
          {relatedEnquiry && <span>Linked to enquiry #{relatedEnquiry}</span>}
        </header>
        {state.status === 'error' && <AdminNotice tone="danger">{state.error}</AdminNotice>}
        <form className="admin-compose-form" onSubmit={submit}>
          <label>
            To
            <input
              type="email"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              required
            />
          </label>
          <label>
            Subject
            <input value={subject} onChange={(event) => setSubject(event.target.value)} required />
          </label>
          <label>
            Email body
            <textarea
              rows={18}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              required
            />
          </label>
          <section className="admin-attachments">
            <div>
              <strong>Attachments</strong>
              <small>Up to 10 files; 20 MB each and 24 MB total.</small>
            </div>
            <button type="button" onClick={() => inputRef.current?.click()}>
              Attach files
            </button>
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
              <ul>
                {attachments.map((file, index) => (
                  <li key={`${file.name}-${index}`}>
                    <span>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                    <button
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
        <div className="admin-page">
          <p className="text-text-subtle">Loading composer…</p>
        </div>
      }
    >
      <ComposeMessageContent />
    </Suspense>
  );
}
