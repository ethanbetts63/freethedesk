'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { formatDateTime, getMessage, type AdminMessage } from '@/lib/adminApi';
import { AdminNotice } from '@/components/dashboard/AdminNotice';
import {
  AdminDetailItem,
  adminCardClassName,
  adminCardLinkClassName,
  adminCardTitleClassName,
  adminCardWideClassName,
  adminDetailGridClassName,
  adminDetailListClassName,
} from '@/components/dashboard/AdminCard';
import { cn } from '@/lib/utils';

/** Related objects we have a dashboard page for. Anything else shows as plain text. */
const RELATED_LINKS: Record<string, string> = {
  enquiry: '/dashboard/enquiries/',
  dealer: '/dashboard/dealers/',
  seosubscriber: '/dashboard/seo/',
};

export default function MessageDetailPage() {
  const id = Number(useParams<{ messageId: string }>().messageId);
  const [message, setMessage] = useState<AdminMessage | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    getMessage(id)
      .then(setMessage)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Message could not be loaded.'),
      );
  }, [id]);
  if (error)
    return (
      <div className="admin-page">
        <Link className="admin-back" href="/dashboard/messages">
          ← Messages
        </Link>
        <AdminNotice tone="danger">{error}</AdminNotice>
      </div>
    );
  if (!message)
    return (
      <div className="admin-page">
        <p className="text-text-subtle">Loading message…</p>
      </div>
    );
  return (
    <div className="admin-page">
      <Link className="admin-back" href="/dashboard/messages">
        ← Back to messages
      </Link>
      <header className="admin-page-header admin-detail-heading">
        <div>
          <p className="admin-kicker">
            {message.channel.toUpperCase()} message #{message.id}
          </p>
          <h1>{message.subject || 'SMS notification'}</h1>
          <p>To {message.to}</p>
        </div>
        <StatusPill status={message.status} />
      </header>
      {message.status === 'failed' && (
        <AdminNotice tone="danger">
          <strong>This message did not send.</strong> {message.error_message}
        </AdminNotice>
      )}
      {message.status === 'bounced' && (
        <AdminNotice tone="danger">
          <strong>This message was accepted but never arrived.</strong> {message.error_message}
        </AdminNotice>
      )}
      {message.status === 'queued' && message.error_message && (
        <AdminNotice tone="warning">{message.error_message}</AdminNotice>
      )}
      <div className={adminDetailGridClassName}>
        <section className={adminCardClassName}>
          <h2 className={adminCardTitleClassName}>Delivery</h2>
          <dl className={adminDetailListClassName}>
            <AdminDetailItem term="Status">
              <StatusPill status={message.status} />
            </AdminDetailItem>
            <AdminDetailItem term="Channel">{message.channel.toUpperCase()}</AdminDetailItem>
            <AdminDetailItem term="Created">{formatDateTime(message.created_at)}</AdminDetailItem>
            <AdminDetailItem term="Sent">{formatDateTime(message.sent_at)}</AdminDetailItem>
            {message.related && (
              <AdminDetailItem term="About">
                {RELATED_LINKS[message.related.type] ? (
                  <Link
                    className={adminCardLinkClassName}
                    href={`${RELATED_LINKS[message.related.type]}${message.related.id}`}
                  >
                    {message.related.label || `#${message.related.id}`}
                  </Link>
                ) : (
                  message.related.label || `#${message.related.id}`
                )}
              </AdminDetailItem>
            )}
          </dl>
        </section>
        <section className={cn(adminCardClassName, adminCardWideClassName)}>
          <h2 className={adminCardTitleClassName}>What was sent</h2>
          <pre className="admin-message-pre">{message.body_text}</pre>
        </section>
      </div>
    </div>
  );
}
