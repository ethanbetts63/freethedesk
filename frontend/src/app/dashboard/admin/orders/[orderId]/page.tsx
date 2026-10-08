'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { adminRelatedMessagesClassName } from '@/components/dashboard/adminLayout';
import { StatusPill } from '@/components/dashboard/StatusPill';
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
} from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { backClassName, pageClassName } from '@/components/ui/layout';
import { newInvoiceHref } from '@/app/dashboard/admin/invoices/_lib/invoiceStatus';
import {
  PACKAGE_ORDER_TYPE,
  formatDateTime,
  getMessages,
  getPackageOrder,
  type AdminMessage,
  type AdminPackageOrder,
} from '@/lib/adminApi';
import { safeWebsiteHref } from '@/lib/api';
import { formatMoney } from '@/lib/formatting';
import { cn } from '@/lib/utils';

function money(value: string) {
  return formatMoney(value, { cents: 'auto' });
}

/**
 * One order: what was bought, what has been paid, and what is still owed. A website's second half
 * is invoiced from here before launch; the invoice editor opens with the balance filled in.
 */
export default function OrderDetailPage() {
  const id = Number(useParams<{ orderId: string }>().orderId);
  const [order, setOrder] = useState<AdminPackageOrder | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getPackageOrder(id),
      getMessages({ related_type: PACKAGE_ORDER_TYPE, related_id: id, page_size: 20 }),
    ])
      .then(([result, messagePage]) => {
        setOrder(result);
        setMessages(messagePage.results);
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Order could not be loaded.'),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading order…</p>
      </div>
    );
  if (error || !order)
    return (
      <div className={pageClassName}>
        <Link className={backClassName} href="/dashboard/admin/orders">
          ← Orders
        </Link>
        <Notice tone="danger">{error || 'Order could not be loaded.'}</Notice>
      </div>
    );

  const owing = Number(order.balance) > 0;
  const websiteHref = safeWebsiteHref(order.website);

  return (
    <div className={pageClassName}>
      <Link className={backClassName} href="/dashboard/admin/orders">
        ← Back to orders
      </Link>
      <PageHeader
        align="center"
        kicker={`Order #${order.id}`}
        title={order.package_name}
        subtitle={`${order.business_name || order.email} · ordered ${formatDateTime(order.created_at)}`}
      >
        {owing && (
          <Button href={newInvoiceHref(PACKAGE_ORDER_TYPE, order.id)}>
            Invoice the second half
          </Button>
        )}
      </PageHeader>
      <div className={detailGridClassName}>
        <section className={statusCardClassName}>
          <div className={statusCardLabelGroupClassName}>
            <p className={cardLabelClassName}>Payment</p>
            <StatusPill status={order.payment_status} />
          </div>
          {order.paid_at && (
            <p className="text-label text-text-subtle">Paid {formatDateTime(order.paid_at)}</p>
          )}
        </section>
        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Money</h2>
          <dl className={detailListClassName}>
            <DetailItem term="Price">{money(order.price)}</DetailItem>
            <DetailItem term={order.paid_at ? 'Paid upfront' : 'Due upfront'}>
              {money(order.due_now)}
            </DetailItem>
            <DetailItem term="Due before launch">
              {owing ? money(order.balance) : 'Nothing'}
            </DetailItem>
          </dl>
        </section>
        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Customer</h2>
          <dl className={detailListClassName}>
            <DetailItem term="Business">{order.business_name || 'Not supplied'}</DetailItem>
            <DetailItem term="Email">
              <a className={cardLinkClassName} href={`mailto:${order.email}`}>
                {order.email}
              </a>
            </DetailItem>
            <DetailItem term="Phone">
              {order.phone ? (
                <a className={cardLinkClassName} href={`tel:${order.phone}`}>
                  {order.phone}
                </a>
              ) : (
                'Not supplied'
              )}
            </DetailItem>
            <DetailItem term="Website">
              {websiteHref ? (
                <a
                  className={cardLinkClassName}
                  href={websiteHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  {order.website} ↗
                </a>
              ) : (
                'Not supplied'
              )}
            </DetailItem>
          </dl>
        </section>
        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Notes</h2>
          <p className={messageBodyClassName}>{order.notes || 'None given.'}</p>
        </section>
        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Related messages</h2>
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
            <p className="text-label text-text-subtle">No messages are linked to this order yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
