"use client";

import Link from "next/link";
import { Suspense, useCallback } from "react";

import {
  AdminFilterBar,
  AdminPagination,
  AdminTableBody,
  FilterSelect,
  RowLink,
} from "@/components/dashboard/AdminList";
import { adminListParams, useAdminList, type AdminListView } from "@/components/dashboard/useAdminList";
import { messageStatuses, StatusPill, statusLabel } from "@/components/dashboard/StatusPill";
import { formatDateTime, getMessages, type AdminMessage } from "@/lib/adminApi";

const SORT_FIELDS = ["created_at"] as const;
const FILTER_KEYS = ["status", "channel"] as const;
const COLUMNS = 7;

const CHANNEL_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

const RECIPIENT_LABELS: Record<AdminMessage["recipient_type"], string> = {
  admin: "Admin alert",
  dealer: "Dealer",
  seo: "SEO customer",
  manual: "Manual email",
};

function MessagesContent() {
  const fetchPage = useCallback((view: AdminListView) => getMessages(adminListParams(view)), []);
  const list = useAdminList<AdminMessage>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: "Messages could not be loaded.",
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Delivery audit</p>
          <h1>Messages</h1>
        </div>
        <Link className="admin-primary-button" href="/dashboard/messages/compose">
          ＋ Compose
        </Link>
      </header>

      <section className="admin-panel">
        <AdminFilterBar
          total={list.total}
          noun="message"
          nounPlural="messages"
          legend={messageStatuses}
          search={list.searchDraft}
          onSearchChange={list.setSearchDraft}
          onSearchSubmit={list.submitSearch}
          searchPlaceholder="Search address, subject or body"
        >
          <FilterSelect
            label="Filter messages by status"
            value={list.filters.status}
            onChange={(value) => list.setFilter("status", value)}
            allLabel="All statuses"
            options={messageStatuses.map((value) => ({ value, label: statusLabel(value) }))}
          />
          <FilterSelect
            label="Filter messages by channel"
            value={list.filters.channel}
            onChange={(value) => list.setFilter("channel", value)}
            allLabel="Email and SMS"
            options={CHANNEL_OPTIONS}
          />
        </AdminFilterBar>

        {list.error && <p className="admin-banner admin-banner-error">{list.error}</p>}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Created</th>
                <th>Type</th>
                <th>To</th>
                <th>Subject</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Sent</th>
              </tr>
            </thead>
            <AdminTableBody
              rows={list.rows}
              loading={list.loading}
              columns={COLUMNS}
              loadingLabel="Loading messages…"
              emptyLabel="No messages match these filters."
            >
              {(message) => (
                <tr key={message.id} className={`admin-row-${message.status}`}>
                  <td>
                    <RowLink href={`/dashboard/messages/${message.id}`}>{formatDateTime(message.created_at)}</RowLink>
                  </td>
                  <td>{RECIPIENT_LABELS[message.recipient_type] ?? message.recipient_type}</td>
                  <td>
                    <strong>{message.recipient}</strong>
                    {message.related_enquiry_business && <small>{message.related_enquiry_business}</small>}
                  </td>
                  <td>{message.subject || "—"}</td>
                  <td>{message.channel.toUpperCase()}</td>
                  <td>
                    <StatusPill status={message.status} />
                  </td>
                  <td>{formatDateTime(message.sent_at)}</td>
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

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-page">
          <p className="admin-empty">Loading messages…</p>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
