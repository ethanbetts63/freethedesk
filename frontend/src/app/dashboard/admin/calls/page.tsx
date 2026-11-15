'use client';

import { Suspense, useCallback } from 'react';

import {
  adminRowActionsClassName,
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
  SortHeader,
} from '@/components/dashboard/AdminList';
import {
  adminListParams,
  useAdminList,
  type AdminListView,
} from '@/components/dashboard/useAdminList';
import {
  callStatuses,
  StatusPill,
  statusLabel,
  statusTone,
} from '@/components/dashboard/StatusPill';
import { Button } from '@/components/ui/Button';
import { panelClassName } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';
import { formatDateTime } from '@/lib/formatting';
import { getCalls, type CallRequest } from '@/lib/callsApi';
import { cn } from '@/lib/utils';

const SORT_FIELDS = ['created_at', 'status'] as const;
const FILTER_KEYS = ['status'] as const;
const COLUMNS = 5;

function CallsContent() {
  const fetchPage = useCallback((view: AdminListView) => getCalls(adminListParams(view)), []);
  const list = useAdminList<CallRequest>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: 'Calls could not be loaded.',
  });

  return (
    <div className={pageClassName}>
      <PageHeader kicker="Call-back requests" title="Calls" />

      <section className={panelClassName}>
        <AdminFilterBar
          total={list.total}
          noun="call"
          nounPlural="calls"
          legend={callStatuses}
          search={list.searchDraft}
          onSearchChange={list.setSearchDraft}
          onSearchSubmit={list.submitSearch}
          searchPlaceholder="Search phone, website or notes"
        >
          <FilterSelect
            label="Filter calls by status"
            value={list.filters.status}
            onChange={(value) => list.setFilter('status', value)}
            allLabel="All statuses"
            options={callStatuses.map((value) => ({ value, label: statusLabel(value) }))}
          />
        </AdminFilterBar>

        {list.error && <Notice tone="danger">{list.error}</Notice>}
        <div className={adminTableWrapClassName}>
          <table className={adminTableClassName}>
            <thead>
              <tr>
                <SortHeader field="created_at" ordering={list.ordering} onSort={list.toggleSort}>
                  Received
                </SortHeader>
                <th className={adminThClassName}>Website</th>
                <th className={adminThClassName}>Phone</th>
                <SortHeader field="status" ordering={list.ordering} onSort={list.toggleSort}>
                  Status
                </SortHeader>
                <th className={cn(adminThClassName, 'text-right')}>Actions</th>
              </tr>
            </thead>
            <AdminTableBody
              rows={list.rows}
              loading={list.loading}
              columns={COLUMNS}
              loadingLabel="Loading calls…"
              emptyLabel="No calls match these filters."
            >
              {(call) => (
                <tr key={call.id} className={adminRowClassName} style={statusTone(call.status)}>
                  <td className={adminTdClassName}>
                    <RowLink href={`/dashboard/admin/calls/${call.id}`}>
                      {formatDateTime(call.created_at)}
                    </RowLink>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{call.website ? call.site : '—'}</CellTitle>
                    {call.notes && <CellNote>{call.notes}</CellNote>}
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{call.phone}</CellTitle>
                  </td>
                  <td className={adminTdClassName}>
                    <StatusPill status={call.status} />
                  </td>
                  <td className={adminRowActionsClassName}>
                    <div className="flex justify-end gap-xs">
                      <Button variant="quiet" href={`tel:${call.phone}`}>
                        Call
                      </Button>
                      <Button variant="quiet" href={`/dashboard/admin/calls/${call.id}`}>
                        Details
                      </Button>
                    </div>
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

export default function CallsPage() {
  return (
    <Suspense
      fallback={
        <div className={pageClassName}>
          <p className="text-text-subtle">Loading calls…</p>
        </div>
      }
    >
      <CallsContent />
    </Suspense>
  );
}
