"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { formatDateTime, getMessage, type AdminMessage } from "@/lib/adminApi";

export default function MessageDetailPage() {
  const id = Number(useParams<{ messageId: string }>().messageId);
  const [message, setMessage] = useState<AdminMessage | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { getMessage(id).then(setMessage).catch((reason) => setError(reason instanceof Error ? reason.message : "Message could not be loaded.")); }, [id]);
  if (error) return <div className="admin-page"><Link className="admin-back" href="/dashboard/messages">← Messages</Link><p className="admin-banner admin-banner-error">{error}</p></div>;
  if (!message) return <div className="admin-page"><p className="admin-empty">Loading message…</p></div>;
  return (
    <div className="admin-page">
      <Link className="admin-back" href="/dashboard/messages">← Back to messages</Link>
      <header className="admin-page-header admin-detail-heading"><div><p className="admin-kicker">{message.channel.toUpperCase()} message #{message.id}</p><h1>{message.subject || "SMS notification"}</h1><p>To {message.recipient}</p></div><StatusPill status={message.status} /></header>
      {message.status === "failed" && <p className="admin-banner admin-banner-error"><strong>This message did not send.</strong> {message.error_message}</p>}
      {message.status === "pending" && message.error_message && <p className="admin-banner admin-banner-warning">{message.error_message}</p>}
      <div className="admin-detail-grid">
        <section className="admin-detail-card"><h2>Delivery</h2><dl className="admin-detail-list"><div><dt>Status</dt><dd><StatusPill status={message.status} /></dd></div><div><dt>Channel</dt><dd>{message.channel.toUpperCase()}</dd></div><div><dt>Created</dt><dd>{formatDateTime(message.created_at)}</dd></div><div><dt>Sent</dt><dd>{formatDateTime(message.sent_at)}</dd></div>{message.related_enquiry && <div><dt>Enquiry</dt><dd><Link href={`/dashboard/enquiries/${message.related_enquiry}`}>{message.related_enquiry_business || `#${message.related_enquiry}`}</Link></dd></div>}</dl></section>
        <section className="admin-detail-card admin-detail-wide"><h2>What was sent</h2><pre className="admin-message-pre">{message.body}</pre></section>
      </div>
    </div>
  );
}
