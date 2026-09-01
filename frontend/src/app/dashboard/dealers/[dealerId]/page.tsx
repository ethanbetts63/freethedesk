"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dealerStatuses, StatusPill } from "@/components/dashboard/StatusPill";
import { formatDateTime, getDealer, getMessages, updateDealer, type AdminMessage, type Dealer } from "@/lib/adminApi";

export default function DealerDetailPage() {
  const id = Number(useParams<{ dealerId: string }>().dealerId);
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getDealer(id), getMessages({ related_dealer: id, page_size: 20 })])
      .then(([result, messagePage]) => {
        setDealer(result);
        setNotes(result.staff_notes);
        setMessages(messagePage.results);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Dealer could not be loaded."))
      .finally(() => setLoading(false));
  }, [id]);

  const replyHref = useMemo(() => {
    if (!dealer) return "/dashboard/messages/compose";
    const firstName = dealer.contact_name.trim().split(/\s+/)[0] || dealer.contact_name;
    const params = new URLSearchParams({
      to: dealer.email,
      subject: "Your Free the Desk dealer account",
      body: `Hi ${firstName},\n\n`,
    });
    return `/dashboard/messages/compose?${params}`;
  }, [dealer]);

  async function save(changes: Partial<Pick<Dealer, "status" | "staff_notes">>, message: string) {
    if (!dealer) return;
    setSaving(true); setError(""); setNotice("");
    try {
      setDealer(await updateDealer(dealer.id, changes));
      setNotice(message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The dealer could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-page"><p className="admin-empty">Loading dealer…</p></div>;
  if (error && !dealer) return <div className="admin-page"><Link className="admin-back" href="/dashboard/dealers">← Dealers</Link><p className="admin-banner admin-banner-error">{error}</p></div>;
  if (!dealer) return null;

  return (
    <div className="admin-page">
      <Link className="admin-back" href="/dashboard/dealers">← Back to dealers</Link>
      <header className="admin-page-header admin-detail-heading">
        <div>
          <p className="admin-kicker">Dealer #{dealer.id}</p>
          <h1>{dealer.business_name}</h1>
          <p>{dealer.contact_name} · signed up {formatDateTime(dealer.created_at)}</p>
        </div>
        <Link className="admin-primary-button" href={replyHref}>Email dealer →</Link>
      </header>

      {error && <p className="admin-banner admin-banner-error">{error}</p>}
      {notice && <p className="admin-banner">{notice}</p>}

      <div className="admin-detail-grid">
        <section className="admin-detail-card admin-status-card">
          <div><p className="admin-card-label">Account status</p><StatusPill status={dealer.status} /></div>
          <select value={dealer.status} disabled={saving} onChange={(event) => save({ status: event.target.value as Dealer["status"] }, `Status set to ${event.target.value}.`)}>
            {dealerStatuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
          </select>
        </section>

        {dealer.status === "pending" && (
          <section className="admin-detail-card admin-detail-wide">
            <h2>Approve this dealer</h2>
            <p className="admin-muted">Approving only switches the account on. The dealer still has to complete onboarding — licence details, prefill data and their sale conditions — before they can run a sale.</p>
            <div className="button-row">
              <button className="admin-primary-button" disabled={saving} onClick={() => save({ status: "active" }, "Dealer approved.")}>Approve</button>
              <button className="admin-secondary-button" disabled={saving} onClick={() => save({ status: "denied" }, "Dealer denied.")}>Deny</button>
            </div>
          </section>
        )}

        <section className="admin-detail-card">
          <h2>Contact</h2>
          <dl className="admin-detail-list">
            <div><dt>Business</dt><dd>{dealer.business_name}</dd></div>
            <div><dt>Contact</dt><dd>{dealer.contact_name}</dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${dealer.email}`}>{dealer.email}</a></dd></div>
            <div><dt>Phone</dt><dd>{dealer.phone ? <a href={`tel:${dealer.phone}`}>{dealer.phone}</a> : "Not supplied"}</dd></div>
          </dl>
        </section>

        <section className="admin-detail-card">
          <h2>Account</h2>
          <dl className="admin-detail-list">
            <div><dt>Status</dt><dd>{dealer.status_label}</dd></div>
            <div><dt>Status changed</dt><dd>{formatDateTime(dealer.status_changed_at)}</dd></div>
            <div><dt>Signed up</dt><dd>{formatDateTime(dealer.created_at)}</dd></div>
            <div><dt>Last updated</dt><dd>{formatDateTime(dealer.updated_at)}</dd></div>
          </dl>
        </section>

        <section className="admin-detail-card admin-detail-wide">
          <div className="admin-card-heading"><h2>Internal notes</h2></div>
          <textarea
            className="admin-notes"
            rows={5}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anything worth recording about this dealership — licence checks, phone calls, why they were denied."
          />
          <button className="admin-secondary-button" disabled={saving || notes === dealer.staff_notes} onClick={() => save({ staff_notes: notes }, "Notes saved.")}>
            {saving ? "Saving…" : "Save notes"}
          </button>
        </section>

        <section className="admin-detail-card admin-detail-wide">
          <div className="admin-card-heading"><h2>Recent messages</h2><Link href={replyHref}>Compose email</Link></div>
          {messages.length ? (
            <div className="admin-related-messages">
              {messages.map((message) => (
                <Link key={message.id} href={`/dashboard/messages/${message.id}`}>
                  <span>{message.channel.toUpperCase()} · {message.status}</span>
                  <strong>{message.subject || "SMS notification"}</strong>
                  <small>{formatDateTime(message.sent_at || message.created_at)}</small>
                </Link>
              ))}
            </div>
          ) : <p className="admin-muted">No messages yet.</p>}
        </section>
      </div>
    </div>
  );
}
