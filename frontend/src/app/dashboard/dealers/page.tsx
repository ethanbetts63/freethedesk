"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { dealerStatuses, StatusPill } from "@/components/dashboard/StatusPill";
import { formatDateTime, getDealers, type Dealer, type Paginated } from "@/lib/adminApi";

const empty: Paginated<Dealer> = { count: 0, next: null, previous: null, results: [] };

export default function DealersPage() {
  const router = useRouter();
  const [data, setData] = useState(empty);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getDealers({ status, search, ordering, page, page_size: 50 })
      .then((result) => { if (!cancelled) { setData(result); setError(""); } })
      .catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Dealers could not be loaded."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [ordering, page, search, status]);

  function submitSearch(event: FormEvent) { event.preventDefault(); setPage(1); setSearch(query.trim()); }
  function sort(field: string) {
    setPage(1);
    setOrdering((current) => current.replace(/^-/, "") === field && !current.startsWith("-") ? `-${field}` : field);
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">Licensing accounts</p><h1>Dealers</h1></div>
      </header>

      <section className="admin-panel">
        <div className="admin-filter-bar">
          <div><strong>Filters</strong><p>{data.count} {data.count === 1 ? "dealer" : "dealers"} matching this view</p></div>
          <div className="admin-filters">
            <select aria-label="Filter dealers by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
              <option value="all">All statuses</option>
              {dealerStatuses.map((value) => <option value={value} key={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}
            </select>
            <form className="admin-search" onSubmit={submitSearch}>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search business, person or email" />
              <button>Search</button>
            </form>
          </div>
          <div className="admin-legend"><b>Row colour:</b>{dealerStatuses.map((value) => <span key={value}><i className={`admin-swatch admin-swatch-${value}`} />{value}</span>)}</div>
        </div>

        {error && <p className="admin-banner admin-banner-error">{error}</p>}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr>
              <th><button onClick={() => sort("created_at")}>Signed up ↕</button></th>
              <th><button onClick={() => sort("business_name")}>Business ↕</button></th>
              <th><button onClick={() => sort("contact_name")}>Contact ↕</button></th>
              <th>Plan</th>
              <th>State</th>
              <th>Payment</th>
              <th>Phone</th>
              <th><button onClick={() => sort("status")}>Status ↕</button></th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="admin-empty">Loading dealers…</td></tr> : data.results.length === 0 ? <tr><td colSpan={8} className="admin-empty">No dealers match these filters.</td></tr> : data.results.map((dealer) => (
                <tr key={dealer.id} className={`admin-row-${dealer.status}`} onClick={() => router.push(`/dashboard/dealers/${dealer.id}`)}>
                  <td>{formatDateTime(dealer.created_at)}</td>
                  <td><strong>{dealer.business_name}</strong></td>
                  <td><strong>{dealer.contact_name}</strong><small>{dealer.email}</small></td>
                  <td>{dealer.plan_label}</td>
                  <td>{dealer.state}</td>
                  <td>{dealer.payment_status_label}</td>
                  <td>{dealer.phone || "—"}</td>
                  <td><StatusPill status={dealer.status} /></td>
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
