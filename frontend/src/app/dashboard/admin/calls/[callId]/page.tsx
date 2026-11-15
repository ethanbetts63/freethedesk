'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { adminRelatedMessagesClassName } from '@/components/dashboard/adminLayout';
import { callStatuses, StatusPill, statusLabel } from '@/components/dashboard/StatusPill';
import { Button } from '@/components/ui/Button';
import {
  DetailItem,
  cardClassName,
  cardLabelClassName,
  cardLinkClassName,
  cardTitleClassName,
  cardWideClassName,
  detailGridClassName,
  detailListClassName,
  messageBodyClassName,
  statusCardClassName,
  statusCardLabelGroupClassName,
  statusCardSelectClassName,
} from '@/components/ui/Card';
import { adminFormTextareaClassName } from '@/components/ui/formControl';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { backClassName, pageClassName } from '@/components/ui/layout';
import { formatDateTime, getMessages, type AdminMessage } from '@/lib/adminApi';
import { safeWebsiteHref } from '@/lib/api';
import { CALL_BOOKING_TYPE, getCall, updateCall, type CallBooking } from '@/lib/callsApi';
import { cn } from '@/lib/utils';

export default function CallDetailPage() {
  const id = Number(useParams<{ callId: string }>().callId);
  const [call, setCall] = useState<CallBooking | null>(null);
  const [notes, setNotes] = useState('');
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getCall(id),
      getMessages({ related_type: CALL_BOOKING_TYPE, related_id: id, page_size: 20 }),
    ])
      .then(([result, messagePage]) => {
        setCall(result);
        setNotes(result.call_notes);
        setMessages(messagePage.results);
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'The call could not be loaded.'),
      )
      .finally(() => setLoading(false));
  }, [id]);

  async function save(changes: Parameters<typeof updateCall>[1]) {
    if (!call) return;
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const updated = await updateCall(call.id, changes);
      setCall(updated);
      setNotes(updated.call_notes);
      setSaved('call_notes' in changes);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The call could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading call…</p>
      </div>
    );
  if (error && !call)
    return (
      <div className={pageClassName}>
        <Link className={backClassName} href="/dashboard/admin/calls">
          ← Calls
        </Link>
        <Notice tone="danger">{error}</Notice>
      </div>
    );
  if (!call) return null;

  const websiteHref = safeWebsiteHref(call.website);

  return (
    <div className={pageClassName}>
      <Link className={backClassName} href="/dashboard/admin/calls">
        ← Back to calls
      </Link>
      <PageHeader
        align="center"
        kicker={`Free SEO review · call #${call.id}`}
        title={call.site}
        subtitle={`${call.when} · booked ${formatDateTime(call.created_at)}`}
      >
        <Button href={`tel:${call.phone}`}>Call {call.phone}</Button>
      </PageHeader>
      {error && <Notice tone="danger">{error}</Notice>}
      <div className={detailGridClassName}>
        <section className={statusCardClassName}>
          <div className={statusCardLabelGroupClassName}>
            <p className={cardLabelClassName}>Call status</p>
            <StatusPill status={call.status} />
          </div>
          <select
            className={statusCardSelectClassName}
            value={call.status}
            disabled={saving}
            onChange={(event) => save({ status: event.target.value as CallBooking['status'] })}
          >
            {callStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </section>
        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Contact</h2>
          <dl className={detailListClassName}>
            <DetailItem term="Name">{call.name}</DetailItem>
            <DetailItem term="Phone">
              <a className={cardLinkClassName} href={`tel:${call.phone}`}>
                {call.phone}
              </a>
            </DetailItem>
            <DetailItem term="Email">
              <a className={cardLinkClassName} href={`mailto:${call.email}`}>
                {call.email}
              </a>
            </DetailItem>
            <DetailItem term="Website">
              {websiteHref ? (
                <a
                  className={cardLinkClassName}
                  href={websiteHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  {call.website} ↗
                </a>
              ) : (
                call.website
              )}
            </DetailItem>
            <DetailItem term="Booked from">{call.source || 'Not recorded'}</DetailItem>
          </dl>
        </section>
        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Their notes</h2>
          <p className={messageBodyClassName}>{call.notes || 'None given.'}</p>
        </section>
        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Your call notes</h2>
          <textarea
            aria-label="Your call notes"
            className={adminFormTextareaClassName}
            value={notes}
            maxLength={2000}
            onChange={(event) => {
              setNotes(event.target.value);
              setSaved(false);
            }}
          />
          <div className="mt-s flex items-center gap-s">
            <Button
              disabled={saving || notes === call.call_notes}
              onClick={() => save({ call_notes: notes })}
            >
              {saving ? 'Saving…' : 'Save notes'}
            </Button>
            {saved && <span className="text-label text-text-subtle">Saved.</span>}
          </div>
        </section>
        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Messages sent</h2>
          {messages.length ? (
            <div className={adminRelatedMessagesClassName}>
              {messages.map((message) => (
                <Link key={message.id} href={`/dashboard/admin/messages/${message.id}`}>
                  <span>
                    {message.channel.toUpperCase()} · {message.status}
                  </span>
                  <strong>{message.subject || 'SMS notification'}</strong>
                  <small>{formatDateTime(message.sent_at || message.created_at)}</small>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-label text-text-subtle">No messages are linked to this call.</p>
          )}
        </section>
      </div>
    </div>
  );
}
