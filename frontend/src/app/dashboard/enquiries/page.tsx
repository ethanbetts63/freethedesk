"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { enquiryStatuses, StatusPill } from "@/components/dashboard/StatusPill";
import { formatDateTime, getEnquiries, type Enquiry, type Paginated } from "@/lib/adminApi";

const empty: Paginated<Enquiry> = { count: 0, next: null, previous: null, results: [] };

export default function EnquiriesPage() {
  const router = useRouter();
  const [data, setData] = useState(empty);
  const [status, setStatus] = useState("all");
  const [helpWith, setHelpWith] = useState("all");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getEnquiries({ status, help_with: helpWith, search, ordering, page, page_size: 50 })
      .then((result) => { if (!cancelled) { setData(result); setError(""); } })
      .catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Enquiries could not be loaded."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [helpWith, ordering, page, search, status]);

  function submitSearch(event: FormEvent) { event.preventDefault(); setPage(1); setSearch(query.trim()); }
  function sort(field: string) {
    setPage(1);
    setOrdering((current) => current.replace(/^-/, "") === field && !current.startsWith("-") ? `-${field}` : field);
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">Lead management</p><h1>Enquiries</h1></div>
        <Link className="admin-primary-button" href="/dashboard/messages/compose">＋ Compose</Link>
      </header>

      <section className="admin-panel">
        <div className="admin-filter-bar">
          <div><strong>Filters</strong><p>{data.count} {data.count === 1 ? "enquiry" : "enquiries"} matching this view</p></div>
          <div className="admin-filters">
            <select aria-label="Filter enquiries by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
              <option value="all">All statuses</option>
              {enquiryStatuses.map((value) => <option value={value} key={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}
            </select>
            <select aria-label="Filter enquiries by type" value={helpWith} onChange={(event) => { setHelpWith(event.target.value); setPage(1); }}>
              <option value="all">All enquiry types</option>
              <option value="website">Dealer website</option>
              <option value="website_builder">Dealer web enquiry</option>
              <option value="inventory">Inventory, parts, service or hire</option>
              <option value="automation">Business automation</option>
              <option value="everything">All of the above</option>
              <option value="unsure">Not sure yet</option>
            </select>
            <form className="admin-search" onSubmit={submitSearch}>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search business, person or email" />
              <button>Search</button>
            </form>
          </div>
          <div className="admin-legend"><b>Row colour:</b>{enquiryStatuses.map((value) => <span key={value}><i className={`admin-swatch admin-swatch-${value}`} />{value}</span>)}</div>
        </div>

        {error && <p className="admin-banner admin-banner-error">{error}</p>}
        <div className="admin-table-wrap">
          <table className="admin-table admin-enquiry-table">
            <thead><tr>
              <th><button onClick={() => sort("created_at")}>Received ↕</button></th>
              <th><button onClick={() => sort("business")}>Business ↕</button></th>
              <th>Contact</th>
              <th><button onClick={() => sort("help_with")}>Interested in ↕</button></th>
              <th>Phone</th>
              <th><button onClick={() => sort("status")}>Status ↕</button></th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="admin-empty">Loading enquiries…</td></tr> : data.results.length === 0 ? <tr><td colSpan={6} className="admin-empty">No enquiries match these filters.</td></tr> : data.results.map((enquiry) => (
                <tr key={enquiry.id} className={`admin-row-${enquiry.status}`} onClick={() => router.push(`/dashboard/enquiries/${enquiry.id}`)}>
                  <td>{formatDateTime(enquiry.created_at)}</td>
                  <td><strong>{enquiry.business}</strong>{enquiry.website && <small>{enquiry.website.replace(/^https?:\/\//, "")}</small>}</td>
                  <td><strong>{enquiry.name}</strong><small>{enquiry.email}</small></td>
                  <td>{enquiry.help_with_label}</td>
                  <td>{enquiry.phone || "—"}</td>
                  <td><StatusPill status={enquiry.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="admin-pagination">
          <span>{data.count ? (page - 1) * 50 + 1 : 0}–{Math.min(page * 50, data.count)} of {data.count}</span>
          <div><button disabled={!data.previous || loading} onClick={() => setPage((value) => value - 1)}>← Previous</button><span>Page {page}</span><button disabled={!data.next || loading} onClick={() => setPage((value) => value + 1)}>Next →</button></div>
        </footer>
      </section>
    </div>
  );
}
