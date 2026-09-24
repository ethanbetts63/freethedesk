'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { formatDateTime, getMessage, type AdminMessage } from '@/lib/adminApi';
import { Notice } from '@/components/ui/Notice';
import {
  DetailItem,
  cardClassName,
  cardLinkClassName,
  cardTitleClassName,
  cardWideClassName,
  detailGridClassName,
  detailListClassName,
} from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { backClassName, pageClassName } from '@/components/ui/layout';
import { adminMessagePreClassName } from '@/components/dashboard/adminLayout';

/** Related objects we have a dashboard page for. Anything else shows as plain text. */
const RELATED_LINKS: Record<string, string> = {
  enquiry: '/dashboard/admin/enquiries/',
  dealer: '/dashboard/admin/dealers/',
  seosubscriber: '/dashboard/admin/seo/',
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
      <div className={pageClassName}>
        <Link className={backClassName} href="/dashboard/admin/messages">
          ← Messages
        </Link>
        <Notice tone="danger">{error}</Notice>
      </div>
    );
  if (!message)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading message…</p>
      </div>
    );
  return (
    <div className={pageClassName}>
      <Link className={backClassName} href="/dashboard/admin/messages">
        ← Back to messages
      </Link>
      <PageHeader
        align="center"
        kicker={`${message.channel.toUpperCase()} message #${message.id}`}
        title={message.subject || 'SMS notification'}
        subtitle={`To ${message.to}`}
      >
        <StatusPill status={message.status} />
      </PageHeader>
      {message.status === 'failed' && (
        <Notice tone="danger">
          <strong>This message did not send.</strong> {message.error_message}
        </Notice>
      )}
      {message.status === 'bounced' && (
        <Notice tone="danger">
          <strong>This message was accepted but never arrived.</strong> {message.error_message}
        </Notice>
      )}
      {message.status === 'queued' && message.error_message && (
        <Notice tone="warning">{message.error_message}</Notice>
      )}
      <div className={detailGridClassName}>
        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Delivery</h2>
          <dl className={detailListClassName}>
            <DetailItem term="Status">
              <StatusPill status={message.status} />
            </DetailItem>
            <DetailItem term="Channel">{message.channel.toUpperCase()}</DetailItem>
            <DetailItem term="Created">{formatDateTime(message.created_at)}</DetailItem>
            <DetailItem term="Sent">{formatDateTime(message.sent_at)}</DetailItem>
            {message.related && (
              <DetailItem term="About">
                {RELATED_LINKS[message.related.type] ? (
                  <Link
                    className={cardLinkClassName}
                    href={`${RELATED_LINKS[message.related.type]}${message.related.id}`}
                  >
                    {message.related.label || `#${message.related.id}`}
                  </Link>
                ) : (
                  message.related.label || `#${message.related.id}`
                )}
              </DetailItem>
            )}
          </dl>
        </section>
        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>What was sent</h2>
          <pre className={adminMessagePreClassName}>{message.body_text}</pre>
        </section>
      </div>
    </div>
  );
}
