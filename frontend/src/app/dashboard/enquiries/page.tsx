"use client";

import Link from "next/link";
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
import { enquiryStatuses, StatusPill, statusLabel } from "@/components/dashboard/StatusPill";
import { formatDateTime, getEnquiries, type Enquiry } from "@/lib/adminApi";

const SORT_FIELDS = ["created_at", "business", "help_with", "status"] as const;
const FILTER_KEYS = ["status", "help_with"] as const;

const HELP_WITH_OPTIONS = [
  { value: "website", label: "Dealer website" },
  { value: "website_builder", label: "Dealer web enquiry" },
  { value: "inventory", label: "Inventory, parts, service or hire" },
  { value: "automation", label: "Business automation" },
  { value: "ai_readiness", label: "AI readiness check" },
  { value: "everything", label: "All of the above" },
  { value: "unsure", label: "Not sure yet" },
];

const COLUMNS = 5;

function EnquiriesContent() {
  const fetchPage = useCallback((view: AdminListView) => getEnquiries(adminListParams(view)), []);
  const list = useAdminList<Enquiry>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: "Enquiries could not be loaded.",
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Lead management</p>
          <h1>Enquiries</h1>
        </div>
        <Link className="admin-primary-button" href="/dashboard/messages/compose">
          ＋ Compose
        </Link>
      </header>

      <section className="admin-panel">
        <AdminFilterBar
          total={list.total}
          noun="enquiry"
          nounPlural="enquiries"
          legend={enquiryStatuses}
          search={list.searchDraft}
          onSearchChange={list.setSearchDraft}
          onSearchSubmit={list.submitSearch}
          searchPlaceholder="Search business, person or email"
        >
          <FilterSelect
            label="Filter enquiries by status"
            value={list.filters.status}
            onChange={(value) => list.setFilter("status", value)}
            allLabel="All statuses"
            options={enquiryStatuses.map((value) => ({ value, label: statusLabel(value) }))}
          />
          <FilterSelect
            label="Filter enquiries by type"
            value={list.filters.help_with}
            onChange={(value) => list.setFilter("help_with", value)}
            allLabel="All enquiry types"
            options={HELP_WITH_OPTIONS}
          />
        </AdminFilterBar>

        {list.error && <p className="admin-banner admin-banner-error">{list.error}</p>}
        <div className="admin-table-wrap">
          <table className="admin-table admin-enquiry-table">
            <thead>
              <tr>
                <SortHeader field="created_at" ordering={list.ordering} onSort={list.toggleSort}>
                  Received
                </SortHeader>
                <SortHeader field="business" ordering={list.ordering} onSort={list.toggleSort}>
                  Business
                </SortHeader>
                <th>Contact</th>
                <SortHeader field="help_with" ordering={list.ordering} onSort={list.toggleSort}>
                  Interested in
                </SortHeader>
                <SortHeader field="status" ordering={list.ordering} onSort={list.toggleSort}>
                  Status
                </SortHeader>
              </tr>
            </thead>
            <AdminTableBody
              rows={list.rows}
              loading={list.loading}
              columns={COLUMNS}
              loadingLabel="Loading enquiries…"
              emptyLabel="No enquiries match these filters."
            >
              {(enquiry) => (
                <tr key={enquiry.id} className="admin-row" data-status={enquiry.status}>
                  <td>
                    <RowLink href={`/dashboard/enquiries/${enquiry.id}`}>{formatDateTime(enquiry.created_at)}</RowLink>
                  </td>
                  <td>
                    <strong>{enquiry.business || "—"}</strong>
                    {enquiry.website && <small>{enquiry.website.replace(/^https?:\/\//, "")}</small>}
                  </td>
                  <td>
                    <strong>{enquiry.name}</strong>
                    <small>{enquiry.email}</small>
                  </td>
                  <td>
                    <strong>{enquiry.help_with_label}</strong>
                    {enquiry.configuration?.budget && <small>Budget: {enquiry.configuration.budget}</small>}
                  </td>
                  <td>
                    <StatusPill status={enquiry.status} />
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

export default function EnquiriesPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-page">
          <p className="admin-empty">Loading enquiries…</p>
        </div>
      }
    >
      <EnquiriesContent />
    </Suspense>
  );
}
