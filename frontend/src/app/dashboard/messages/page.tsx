'use client';

import { Suspense, useCallback } from 'react';

import {
  adminRowClassName,
  adminTableClassName,
  adminTableWrapClassName,
  adminTdClassName,
  adminThClassName,
  AdminFilterBar,
  AdminPagination,
  AdminTableBody,
  CellNote,
  CellTitle,
  FilterSelect,
  RowLink,
} from '@/components/dashboard/AdminList';
import {
  adminListParams,
  useAdminList,
  type AdminListView,
} from '@/components/dashboard/useAdminList';
import {
  messageStatuses,
  StatusPill,
  statusLabel,
  statusTone,
} from '@/components/dashboard/StatusPill';
import { formatDateTime, getMessages, type AdminMessage } from '@/lib/adminApi';
import { AdminButton } from '@/components/dashboard/AdminButton';
import { AdminNotice } from '@/components/dashboard/AdminNotice';
import { cn } from '@/lib/utils';

const SORT_FIELDS = ['created_at'] as const;
const FILTER_KEYS = ['status', 'channel'] as const;
const COLUMNS = 7;

const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
];

function MessagesContent() {
  const fetchPage = useCallback((view: AdminListView) => getMessages(adminListParams(view)), []);
  const list = useAdminList<AdminMessage>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: 'Messages could not be loaded.',
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Delivery audit</p>
          <h1>Messages</h1>
        </div>
        <AdminButton href="/dashboard/messages/compose">＋ Compose</AdminButton>
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
            onChange={(value) => list.setFilter('status', value)}
            allLabel="All statuses"
            options={messageStatuses.map((value) => ({ value, label: statusLabel(value) }))}
          />
          <FilterSelect
            label="Filter messages by channel"
            value={list.filters.channel}
            onChange={(value) => list.setFilter('channel', value)}
            allLabel="Email and SMS"
            options={CHANNEL_OPTIONS}
          />
        </AdminFilterBar>

        {list.error && <AdminNotice tone="danger">{list.error}</AdminNotice>}
        <div className={adminTableWrapClassName}>
          <table className={adminTableClassName}>
            <thead>
              <tr>
                <th className={adminThClassName}>Created</th>
                <th className={adminThClassName}>Type</th>
                <th className={adminThClassName}>To</th>
                <th className={adminThClassName}>Subject</th>
                <th className={adminThClassName}>Channel</th>
                <th className={adminThClassName}>Status</th>
                <th className={adminThClassName}>Sent</th>
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
                <tr
                  key={message.id}
                  className={adminRowClassName}
                  style={statusTone(message.status)}
                >
                  <td className={cn(adminTdClassName, 'relative')}>
                    <RowLink href={`/dashboard/messages/${message.id}`}>
                      {formatDateTime(message.created_at)}
                    </RowLink>
                  </td>
                  <td className={adminTdClassName}>{message.type_label}</td>
                  <td className={adminTdClassName}>
                    <CellTitle>{message.to}</CellTitle>
                    {message.related && <CellNote>{message.related.label}</CellNote>}
                  </td>
                  <td className={adminTdClassName}>{message.subject || '—'}</td>
                  <td className={adminTdClassName}>{message.channel.toUpperCase()}</td>
                  <td className={adminTdClassName}>
                    <StatusPill status={message.status} />
                  </td>
                  <td className={adminTdClassName}>{formatDateTime(message.sent_at)}</td>
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
          <p className="text-text-subtle">Loading messages…</p>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
