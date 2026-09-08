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
import { formatDateTime, getDealers, type Dealer } from "@/lib/adminApi";

const SORT_FIELDS = ["created_at", "business_name", "contact_name", "status"] as const;
const FILTER_KEYS = ["status"] as const;
const COLUMNS = 8;

function DealersContent() {
  const fetchPage = useCallback((view: AdminListView) => getDealers(adminListParams(view)), []);
  const list = useAdminList<Dealer>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: "Dealers could not be loaded.",
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Licensing accounts</p>
          <h1>Dealers</h1>
        </div>
      </header>

      <section className="admin-panel">
        <AdminFilterBar
          total={list.total}
          noun="dealer"
          nounPlural="dealers"
          legend={dealerStatuses}
          search={list.searchDraft}
          onSearchChange={list.setSearchDraft}
          onSearchSubmit={list.submitSearch}
          searchPlaceholder="Search business, person or email"
        >
          <FilterSelect
            label="Filter dealers by status"
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
                <th>State</th>
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
              loadingLabel="Loading dealers…"
              emptyLabel="No dealers match these filters."
            >
              {(dealer) => (
                <tr key={dealer.id} className={`admin-row-${dealer.status}`}>
                  <td>
                    <RowLink href={`/dashboard/dealers/${dealer.id}`}>{formatDateTime(dealer.created_at)}</RowLink>
                  </td>
                  <td>
                    <strong>{dealer.business_name}</strong>
                  </td>
                  <td>
                    <strong>{dealer.contact_name}</strong>
                    <small>{dealer.email}</small>
                  </td>
                  <td>{dealer.plan_label}</td>
                  <td>{dealer.state}</td>
                  <td>{dealer.payment_status_label}</td>
                  <td>{dealer.phone || "—"}</td>
                  <td>
                    <StatusPill status={dealer.status} />
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

export default function DealersPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-page">
          <p className="admin-empty">Loading dealers…</p>
        </div>
      }
    >
      <DealersContent />
    </Suspense>
  );
}
