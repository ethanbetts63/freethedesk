"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { enquiryStatuses, StatusPill } from "@/components/dashboard/StatusPill";
import { formatDateTime, getEnquiry, getMessages, updateEnquiryStatus, type AdminMessage, type Enquiry } from "@/lib/adminApi";

export default function EnquiryDetailPage() {
  const id = Number(useParams<{ enquiryId: string }>().enquiryId);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getEnquiry(id), getMessages({ related_enquiry: id, page_size: 20 })])
      .then(([result, messagePage]) => { setEnquiry(result); setMessages(messagePage.results); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Enquiry could not be loaded."))
      .finally(() => setLoading(false));
  }, [id]);

  const replyHref = useMemo(() => {
    if (!enquiry) return "/dashboard/messages/compose";
    const firstName = enquiry.name.trim().split(/\s+/)[0] || enquiry.name;
    const params = new URLSearchParams({
      to: enquiry.email,
      subject: `Re: Your Free the Desk enquiry`,
      body: `Hi ${firstName},\n\nThanks for getting in touch with Free the Desk.\n\n`,
      enquiry: String(enquiry.id),
    });
    return `/dashboard/messages/compose?${params}`;
  }, [enquiry]);

  async function changeStatus(status: string) {
    if (!enquiry) return;
    setSaving(true); setError("");
    try { setEnquiry(await updateEnquiryStatus(enquiry.id, status)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Status could not be updated."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="admin-page"><p className="admin-empty">Loading enquiry…</p></div>;
  if (error && !enquiry) return <div className="admin-page"><Link className="admin-back" href="/dashboard/enquiries">← Enquiries</Link><p className="admin-banner admin-banner-error">{error}</p></div>;
  if (!enquiry) return null;

  return (
    <div className="admin-page">
      <Link className="admin-back" href="/dashboard/enquiries">← Back to enquiries</Link>
      <header className="admin-page-header admin-detail-heading">
        <div><p className="admin-kicker">Enquiry #{enquiry.id}</p><h1>{enquiry.business}</h1><p>{enquiry.name} · received {formatDateTime(enquiry.created_at)}</p></div>
        <Link className="admin-primary-button" href={replyHref}>Reply by email →</Link>
      </header>
      {error && <p className="admin-banner admin-banner-error">{error}</p>}
      <div className="admin-detail-grid">
        <section className="admin-detail-card admin-status-card">
          <div><p className="admin-card-label">Workflow status</p><StatusPill status={enquiry.status} /></div>
          <select value={enquiry.status} disabled={saving} onChange={(event) => changeStatus(event.target.value)}>
            {enquiryStatuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
          </select>
        </section>
        <section className="admin-detail-card">
          <h2>Contact</h2>
          <dl className="admin-detail-list">
            <div><dt>Name</dt><dd>{enquiry.name}</dd></div><div><dt>Business</dt><dd>{enquiry.business}</dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${enquiry.email}`}>{enquiry.email}</a></dd></div><div><dt>Phone</dt><dd>{enquiry.phone ? <a href={`tel:${enquiry.phone}`}>{enquiry.phone}</a> : "Not supplied"}</dd></div>
            <div><dt>Website</dt><dd>{enquiry.website ? <a href={enquiry.website} target="_blank" rel="noreferrer">{enquiry.website} ↗</a> : "Not supplied"}</dd></div><div><dt>Interested in</dt><dd>{enquiry.help_with_label}</dd></div>
          </dl>
        </section>
        <section className="admin-detail-card admin-detail-wide"><h2>What they said</h2><p className="admin-message-body">{enquiry.message}</p></section>
        <section className="admin-detail-card admin-detail-wide">
          <div className="admin-card-heading"><h2>Related messages</h2><Link href={replyHref}>Compose reply</Link></div>
          {messages.length ? <div className="admin-related-messages">{messages.map((message) => <Link key={message.id} href={`/dashboard/messages/${message.id}`}><span>{message.channel.toUpperCase()} · {message.status}</span><strong>{message.subject || "SMS notification"}</strong><small>{formatDateTime(message.sent_at || message.created_at)}</small></Link>)}</div> : <p className="admin-muted">No messages are linked to this enquiry yet.</p>}
        </section>
      </div>
    </div>
  );
}
