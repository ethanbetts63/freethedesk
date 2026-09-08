"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dealerStatuses, StatusPill } from "@/components/dashboard/StatusPill";
import {
  formatDateTime,
  getMessages,
  getSeoSubscriber,
  updateSeoSubscriber,
  type AdminMessage,
  type SeoSubscriber,
} from "@/lib/adminApi";

export default function SeoSubscriberDetailPage() {
  const id = Number(useParams<{ subscriberId: string }>().subscriberId);
  const [subscriber, setSubscriber] = useState<SeoSubscriber | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getSeoSubscriber(id), getMessages({ related_seo_subscriber: id, page_size: 20 })])
      .then(([result, messagePage]) => {
        setSubscriber(result);
        setNotes(result.staff_notes);
        setMessages(messagePage.results);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "SEO customer could not be loaded."))
      .finally(() => setLoading(false));
  }, [id]);

  const replyHref = useMemo(() => {
    if (!subscriber) return "/dashboard/messages/compose";
    const firstName = subscriber.contact_name.trim().split(/\s+/)[0] || subscriber.contact_name;
    const params = new URLSearchParams({
      to: subscriber.email,
      subject: "Your Free the Desk SEO account",
      body: `Hi ${firstName},\n\n`,
    });
    return `/dashboard/messages/compose?${params}`;
  }, [subscriber]);

  async function save(changes: Partial<Pick<SeoSubscriber, "status" | "staff_notes">>, message: string) {
    if (!subscriber) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      setSubscriber(await updateSeoSubscriber(subscriber.id, changes));
      setNotice(message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The SEO customer could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="admin-page">
        <p className="admin-empty">Loading SEO customer…</p>
      </div>
    );
  if (error && !subscriber)
    return (
      <div className="admin-page">
        <Link className="admin-back" href="/dashboard/seo">
          ← SEO customers
        </Link>
        <p className="admin-banner admin-banner-error">{error}</p>
      </div>
    );
  if (!subscriber) return null;

  return (
    <div className="admin-page">
      <Link className="admin-back" href="/dashboard/seo">
        ← Back to SEO customers
      </Link>
      <header className="admin-page-header admin-detail-heading">
        <div>
          <p className="admin-kicker">SEO customer #{subscriber.id}</p>
          <h1>{subscriber.business_name}</h1>
          <p>
            {subscriber.contact_name} · signed up {formatDateTime(subscriber.created_at)}
          </p>
        </div>
        <Link className="admin-primary-button" href={replyHref}>
          Email customer →
        </Link>
      </header>

      {error && <p className="admin-banner admin-banner-error">{error}</p>}
      {notice && <p className="admin-banner">{notice}</p>}

      <div className="admin-detail-grid">
        <section className="admin-detail-card admin-status-card">
          <div>
            <p className="admin-card-label">Account status</p>
            <StatusPill status={subscriber.status} />
          </div>
          <select
            value={subscriber.status}
            disabled={saving}
            onChange={(event) =>
              save({ status: event.target.value as SeoSubscriber["status"] }, `Status set to ${event.target.value}.`)
            }
          >
            {dealerStatuses.map((status) => (
              <option key={status} value={status}>
                {status[0].toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </section>

        {subscriber.status === "pending" && (
          <section className="admin-detail-card admin-detail-wide">
            <h2>Approve this customer</h2>
            <p className="admin-muted">
              Approving switches the account on so reporting can begin once they have connected their data.
            </p>
            <div className="button-row">
              <button
                type="button"
                className="admin-primary-button"
                disabled={saving}
                onClick={() => save({ status: "active" }, "Customer approved.")}
              >
                Approve
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                disabled={saving}
                onClick={() => save({ status: "denied" }, "Customer denied.")}
              >
                Deny
              </button>
            </div>
          </section>
        )}

        <section className="admin-detail-card">
          <h2>Contact</h2>
          <dl className="admin-detail-list">
            <div>
              <dt>Business</dt>
              <dd>{subscriber.business_name}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{subscriber.contact_name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${subscriber.email}`}>{subscriber.email}</a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{subscriber.phone ? <a href={`tel:${subscriber.phone}`}>{subscriber.phone}</a> : "Not supplied"}</dd>
            </div>
            <div>
              <dt>Website</dt>
              <dd>{subscriber.website || "Not supplied"}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-detail-card">
          <h2>Account</h2>
          <dl className="admin-detail-list">
            <div>
              <dt>Plan</dt>
              <dd>{subscriber.plan_label}</dd>
            </div>
            <div>
              <dt>Payment</dt>
              <dd>{subscriber.payment_status_label}</dd>
            </div>
            <div>
              <dt>Current period ends</dt>
              <dd>{formatDateTime(subscriber.subscription_current_period_end)}</dd>
            </div>
            <div>
              <dt>Cancels at period end</dt>
              <dd>{subscriber.cancel_at_period_end ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{subscriber.status_label}</dd>
            </div>
            <div>
              <dt>Status changed</dt>
              <dd>{formatDateTime(subscriber.status_changed_at)}</dd>
            </div>
            <div>
              <dt>Signed up</dt>
              <dd>{formatDateTime(subscriber.created_at)}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{formatDateTime(subscriber.updated_at)}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-detail-card admin-detail-wide">
          <div className="admin-card-heading">
            <h2>Internal notes</h2>
          </div>
          <textarea
            className="admin-notes"
            rows={5}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anything worth recording about this SEO customer — calls, scope, why they were denied."
          />
          <button
            type="button"
            className="admin-secondary-button"
            disabled={saving || notes === subscriber.staff_notes}
            onClick={() => save({ staff_notes: notes }, "Notes saved.")}
          >
            {saving ? "Saving…" : "Save notes"}
          </button>
        </section>

        <section className="admin-detail-card admin-detail-wide">
          <div className="admin-card-heading">
            <h2>Recent messages</h2>
            <Link href={replyHref}>Compose email</Link>
          </div>
          {messages.length ? (
            <div className="admin-related-messages">
              {messages.map((message) => (
                <Link key={message.id} href={`/dashboard/messages/${message.id}`}>
                  <span>
                    {message.channel.toUpperCase()} · {message.status}
                  </span>
                  <strong>{message.subject || "SMS notification"}</strong>
                  <small>{formatDateTime(message.sent_at || message.created_at)}</small>
                </Link>
              ))}
            </div>
          ) : (
            <p className="admin-muted">No messages yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
