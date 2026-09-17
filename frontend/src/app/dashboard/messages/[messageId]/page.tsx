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
import { AdminPageHeader } from '@/components/dashboard/AdminPageHeader';
import {
  adminBackClassName,
  adminMessagePreClassName,
  adminPageClassName,
} from '@/components/dashboard/adminLayout';

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
      <div className={adminPageClassName}>
        <Link className={adminBackClassName} href="/dashboard/messages">
          ← Messages
        </Link>
        <AdminNotice tone="danger">{error}</AdminNotice>
      </div>
    );
  if (!message)
    return (
      <div className={adminPageClassName}>
        <p className="text-text-subtle">Loading message…</p>
      </div>
    );
  return (
    <div className={adminPageClassName}>
      <Link className={adminBackClassName} href="/dashboard/messages">
        ← Back to messages
      </Link>
      <AdminPageHeader
        align="center"
        kicker={`${message.channel.toUpperCase()} message #${message.id}`}
        title={message.subject || 'SMS notification'}
        subtitle={`To ${message.to}`}
      >
        <StatusPill status={message.status} />
      </AdminPageHeader>
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
          <pre className={adminMessagePreClassName}>{message.body_text}</pre>
        </section>
      </div>
    </div>
  );
}
