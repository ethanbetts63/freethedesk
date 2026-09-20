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
import { formatDateTime, getSeoSubscribers, type SeoSubscriber } from '@/lib/adminApi';
import { Notice } from '@/components/ui/Notice';
import { cn } from '@/lib/utils';
import { panelClassName } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';

const SORT_FIELDS = ['created_at', 'business_name', 'contact_name', 'status'] as const;
const FILTER_KEYS = ['status'] as const;
const COLUMNS = 7;

function SeoSubscribersContent() {
  const fetchPage = useCallback(
    (view: AdminListView) => getSeoSubscribers(adminListParams(view)),
    [],
  );
  const list = useAdminList<SeoSubscriber>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: 'SEO customers could not be loaded.',
  });

  return (
    <div className={pageClassName}>
      <PageHeader kicker="SEO accounts" title="SEO customers" />

      <section className={panelClassName}>
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
            onChange={(value) => list.setFilter('status', value)}
            allLabel="All statuses"
            options={dealerStatuses.map((value) => ({ value, label: statusLabel(value) }))}
          />
        </AdminFilterBar>

        {list.error && <Notice tone="danger">{list.error}</Notice>}
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
              loadingLabel="Loading SEO customers…"
              emptyLabel="No SEO customers match these filters."
            >
              {(subscriber) => (
                <tr
                  key={subscriber.id}
                  className={adminRowClassName}
                  style={statusTone(subscriber.status)}
                >
                  <td className={cn(adminTdClassName, 'relative')}>
                    <RowLink href={`/dashboard/seo/${subscriber.id}`}>
                      {formatDateTime(subscriber.created_at)}
                    </RowLink>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{subscriber.business_name}</CellTitle>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{subscriber.contact_name}</CellTitle>
                    <CellNote>{subscriber.email}</CellNote>
                  </td>
                  <td className={adminTdClassName}>
                    {subscriber.report_type_label}
                    <CellNote>{subscriber.plan_label}</CellNote>
                  </td>
                  <td className={adminTdClassName}>{subscriber.payment_status_label}</td>
                  <td className={adminTdClassName}>{subscriber.phone || '—'}</td>
                  <td className={adminTdClassName}>
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
        <div className={pageClassName}>
          <p className="text-text-subtle">Loading SEO customers…</p>
        </div>
      }
    >
      <SeoSubscribersContent />
    </Suspense>
  );
}
