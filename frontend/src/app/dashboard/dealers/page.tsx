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
  SortHeader,
} from '@/components/dashboard/AdminList';
import {
  adminListParams,
  useAdminList,
  type AdminListView,
} from '@/components/dashboard/useAdminList';
import {
  dealerStatuses,
  StatusPill,
  statusLabel,
  statusTone,
} from '@/components/dashboard/StatusPill';
import { formatDateTime, getDealers, type Dealer } from '@/lib/adminApi';
import { AdminNotice } from '@/components/dashboard/AdminNotice';
import { cn } from '@/lib/utils';
import { adminPanelClassName } from '@/components/dashboard/AdminCard';

const SORT_FIELDS = ['created_at', 'business_name', 'contact_name', 'status'] as const;
const FILTER_KEYS = ['status'] as const;
const COLUMNS = 8;

function DealersContent() {
  const fetchPage = useCallback((view: AdminListView) => getDealers(adminListParams(view)), []);
  const list = useAdminList<Dealer>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: 'Dealers could not be loaded.',
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Licensing accounts</p>
          <h1>Dealers</h1>
        </div>
      </header>

      <section className={adminPanelClassName}>
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
            onChange={(value) => list.setFilter('status', value)}
            allLabel="All statuses"
            options={dealerStatuses.map((value) => ({ value, label: statusLabel(value) }))}
          />
        </AdminFilterBar>

        {list.error && <AdminNotice tone="danger">{list.error}</AdminNotice>}
        <div className={adminTableWrapClassName}>
          <table className={adminTableClassName}>
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
                <th className={adminThClassName}>Plan</th>
                <th className={adminThClassName}>State</th>
                <th className={adminThClassName}>Payment</th>
                <th className={adminThClassName}>Phone</th>
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
                <tr key={dealer.id} className={adminRowClassName} style={statusTone(dealer.status)}>
                  <td className={cn(adminTdClassName, 'relative')}>
                    <RowLink href={`/dashboard/dealers/${dealer.id}`}>
                      {formatDateTime(dealer.created_at)}
                    </RowLink>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{dealer.business_name}</CellTitle>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{dealer.contact_name}</CellTitle>
                    <CellNote>{dealer.email}</CellNote>
                  </td>
                  <td className={adminTdClassName}>{dealer.plan_label}</td>
                  <td className={adminTdClassName}>{dealer.state}</td>
                  <td className={adminTdClassName}>{dealer.payment_status_label}</td>
                  <td className={adminTdClassName}>{dealer.phone || '—'}</td>
                  <td className={adminTdClassName}>
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
          <p className="text-text-subtle">Loading dealers…</p>
        </div>
      }
    >
      <DealersContent />
    </Suspense>
  );
}
