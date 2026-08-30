"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { formatDateTime, getMessages, type AdminMessage, type Paginated } from "@/lib/adminApi";

const empty: Paginated<AdminMessage> = { count: 0, next: null, previous: null, results: [] };

export default function MessagesPage() {
  const router = useRouter();
  const [data, setData] = useState(empty);
  const [status, setStatus] = useState("all");
  const [channel, setChannel] = useState("all");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getMessages({ status, channel, search, page, page_size: 50 })
      .then((result) => { if (!cancelled) { setData(result); setError(""); } })
      .catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Messages could not be loaded."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [channel, page, search, status]);

  function submitSearch(event: FormEvent) { event.preventDefault(); setPage(1); setSearch(query.trim()); }

  return (
    <div className="admin-page">
      <header className="admin-page-header"><div><p className="admin-kicker">Delivery audit</p><h1>Messages</h1></div><Link className="admin-primary-button" href="/dashboard/messages/compose">＋ Compose</Link></header>
      <section className="admin-panel">
        <div className="admin-filter-bar">
          <div><strong>Filters</strong><p>{data.count} {data.count === 1 ? "message" : "messages"} matching this view</p></div>
          <div className="admin-filters">
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All statuses</option><option value="sent">Sent</option><option value="pending">Pending</option><option value="failed">Failed</option></select>
            <select value={channel} onChange={(event) => { setChannel(event.target.value); setPage(1); }}><option value="all">Email and SMS</option><option value="email">Email</option><option value="sms">SMS</option></select>
            <form className="admin-search" onSubmit={submitSearch}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search address, subject or body" /><button>Search</button></form>
          </div>
          <div className="admin-legend"><b>Row colour:</b><span><i className="admin-swatch admin-swatch-sent" />sent</span><span><i className="admin-swatch admin-swatch-pending" />pending</span><span><i className="admin-swatch admin-swatch-failed" />failed</span></div>
        </div>
        {error && <p className="admin-banner admin-banner-error">{error}</p>}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Created</th><th>Type</th><th>To</th><th>Subject</th><th>Channel</th><th>Status</th><th>Sent</th></tr></thead>
            <tbody>{loading ? <tr><td colSpan={7} className="admin-empty">Loading messages…</td></tr> : data.results.length === 0 ? <tr><td colSpan={7} className="admin-empty">No messages match these filters.</td></tr> : data.results.map((message) => (
              <tr key={message.id} className={`admin-row-${message.status}`} onClick={() => router.push(`/dashboard/messages/${message.id}`)}>
                <td>{formatDateTime(message.created_at)}</td><td>{message.recipient_type === "admin" ? "Admin alert" : "Manual email"}</td><td><strong>{message.recipient}</strong>{message.related_enquiry_business && <small>{message.related_enquiry_business}</small>}</td><td>{message.subject || "—"}</td><td>{message.channel.toUpperCase()}</td><td><StatusPill status={message.status} /></td><td>{formatDateTime(message.sent_at)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <footer className="admin-pagination"><span>{data.count ? (page - 1) * 50 + 1 : 0}–{Math.min(page * 50, data.count)} of {data.count}</span><div><button disabled={!data.previous || loading} onClick={() => setPage((value) => value - 1)}>← Previous</button><span>Page {page}</span><button disabled={!data.next || loading} onClick={() => setPage((value) => value + 1)}>Next →</button></div></footer>
      </section>
    </div>
  );
}
