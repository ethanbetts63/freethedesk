"use client";

import { Suspense, useCallback } from "react";

import {
  AdminFilterBar,
  AdminPagination,
  AdminTableBody,
  FilterSelect,
  RowLink,
  SortHeader,
} from "@/components/dashboard/AdminList";
import { adminListParams, useAdminList, type AdminListView } from "@/components/dashboard/useAdminList";
import { dealerStatuses, StatusPill, statusLabel } from "@/components/dashboard/StatusPill";
import { formatDateTime, getSeoSubscribers, type SeoSubscriber } from "@/lib/adminApi";

const SORT_FIELDS = ["created_at", "business_name", "contact_name", "status"] as const;
const FILTER_KEYS = ["status"] as const;
const COLUMNS = 7;

function SeoSubscribersContent() {
  const fetchPage = useCallback((view: AdminListView) => getSeoSubscribers(adminListParams(view)), []);
  const list = useAdminList<SeoSubscriber>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: "SEO customers could not be loaded.",
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">SEO accounts</p>
          <h1>SEO customers</h1>
        </div>
      </header>

      <section className="admin-panel">
        <AdminFilterBar
          total={list.total}
          noun="customer"
          nounPlural="customers"
          legend={dealerStatuses}
          search={list.searchDraft}
          onSearchChange={list.setSearchDraft}
          onSearchSubmit={list.submitSearch}
          searchPlaceholder="Search business, person or email"
        >
          <FilterSelect
            label="Filter SEO customers by status"
            value={list.filters.status}
            onChange={(value) => list.setFilter("status", value)}
            allLabel="All statuses"
            options={dealerStatuses.map((value) => ({ value, label: statusLabel(value) }))}
          />
        </AdminFilterBar>

        {list.error && <p className="admin-banner admin-banner-error">{list.error}</p>}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <SortHeader field="created_at" ordering={list.ordering} onSort={list.toggleSort}>
                  Signed up
                </SortHeader>
                <SortHeader field="business_name" ordering={list.ordering} onSort={list.toggleSort}>
                  Business
                </SortHeader>
                <SortHeader field="contact_name" ordering={list.ordering} onSort={list.toggleSort}>
                  Contact
                </SortHeader>
                <th>Plan</th>
                <th>Payment</th>
                <th>Phone</th>
                <SortHeader field="status" ordering={list.ordering} onSort={list.toggleSort}>
                  Status
                </SortHeader>
              </tr>
            </thead>
            <AdminTableBody
              rows={list.rows}
              loading={list.loading}
              columns={COLUMNS}
              loadingLabel="Loading SEO customers…"
              emptyLabel="No SEO customers match these filters."
            >
              {(subscriber) => (
                <tr key={subscriber.id} className="admin-row" data-status={subscriber.status}>
                  <td>
                    <RowLink href={`/dashboard/seo/${subscriber.id}`}>{formatDateTime(subscriber.created_at)}</RowLink>
                  </td>
                  <td>
                    <strong>{subscriber.business_name}</strong>
                  </td>
                  <td>
                    <strong>{subscriber.contact_name}</strong>
                    <small>{subscriber.email}</small>
                  </td>
                  <td>
                    {subscriber.report_type_label}
                    <small>{subscriber.plan_label}</small>
                  </td>
                  <td>{subscriber.payment_status_label}</td>
                  <td>{subscriber.phone || "—"}</td>
                  <td>
                    <StatusPill status={subscriber.status} />
                  </td>
                </tr>
              )}
            </AdminTableBody>
          </table>
        </div>

        <AdminPagination
          page={list.page}
          total={list.total}
          pageSize={list.pageSize}
          loading={list.loading}
          hasNext={list.hasNext}
          onPage={list.setPage}
        />
      </section>
    </div>
  );
}

export default function SeoSubscribersPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-page">
          <p className="admin-empty">Loading SEO customers…</p>
        </div>
      }
    >
      <SeoSubscribersContent />
    </Suspense>
  );
}
