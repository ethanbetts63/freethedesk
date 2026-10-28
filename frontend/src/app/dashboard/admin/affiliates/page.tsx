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
import { formatDateTime, getAffiliates, type Affiliate } from '@/lib/adminApi';
import { Notice } from '@/components/ui/Notice';
import { panelClassName } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';
import { formatMoney } from '@/lib/formatting';

const SORT_FIELDS = ['created_at', 'business_name', 'contact_name', 'status'] as const;
const FILTER_KEYS = ['status'] as const;
const COLUMNS = 7;

const money = (value: string) => formatMoney(value, { cents: 'auto' });

function AffiliatesContent() {
  const fetchPage = useCallback((view: AdminListView) => getAffiliates(adminListParams(view)), []);
  const list = useAdminList<Affiliate>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: 'Affiliates could not be loaded.',
  });

  return (
    <div className={pageClassName}>
      <PageHeader kicker="Affiliate program" title="Affiliates" />

      <section className={panelClassName}>
        <AdminFilterBar
          total={list.total}
          noun="affiliate"
          nounPlural="affiliates"
          legend={dealerStatuses}
          search={list.searchDraft}
          onSearchChange={list.setSearchDraft}
          onSearchSubmit={list.submitSearch}
          searchPlaceholder="Search podcast, host, email or code"
        >
          <FilterSelect
            label="Filter affiliates by status"
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
                  Joined
                </SortHeader>
                <SortHeader field="business_name" ordering={list.ordering} onSort={list.toggleSort}>
                  Podcast
                </SortHeader>
                <SortHeader field="contact_name" ordering={list.ordering} onSort={list.toggleSort}>
                  Host
                </SortHeader>
                <th className={adminThClassName}>Code</th>
                <th className={adminThClassName}>Sales</th>
                <th className={adminThClassName}>Owed</th>
                <SortHeader field="status" ordering={list.ordering} onSort={list.toggleSort}>
                  Status
                </SortHeader>
              </tr>
            </thead>
            <AdminTableBody
              rows={list.rows}
              loading={list.loading}
              columns={COLUMNS}
              loadingLabel="Loading affiliates…"
              emptyLabel="No affiliates match these filters."
            >
              {(affiliate) => (
                <tr
                  key={affiliate.id}
                  className={adminRowClassName}
                  style={statusTone(affiliate.status)}
                >
                  <td className={adminTdClassName}>
                    <RowLink href={`/dashboard/admin/affiliates/${affiliate.id}`}>
                      {formatDateTime(affiliate.created_at)}
                    </RowLink>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{affiliate.business_name}</CellTitle>
                    {affiliate.website && <CellNote>{affiliate.website}</CellNote>}
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{affiliate.contact_name}</CellTitle>
                    <CellNote>{affiliate.email}</CellNote>
                  </td>
                  <td className={adminTdClassName}>
                    <code>{affiliate.code || '—'}</code>
                  </td>
                  <td className={adminTdClassName}>{affiliate.earnings.sales}</td>
                  <td className={adminTdClassName}>{money(affiliate.earnings.owed)}</td>
                  <td className={adminTdClassName}>
                    <StatusPill status={affiliate.status} />
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

export default function AffiliatesPage() {
  return (
    <Suspense
      fallback={
        <div className={pageClassName}>
          <p className="text-text-subtle">Loading affiliates…</p>
        </div>
      }
    >
      <AffiliatesContent />
    </Suspense>
  );
}
