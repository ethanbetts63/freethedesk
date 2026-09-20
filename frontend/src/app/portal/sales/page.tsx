'use client';

import Link from 'next/link';
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
  saleStatuses,
  StatusPill,
  statusLabel,
  statusTone,
} from '@/components/dashboard/StatusPill';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';
import { panelClassName } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

import { getSales, type SaleRow } from '@/lib/dealerApi';
import { formatDateTime, formatMoney } from '@/lib/formatting';

const SORT_FIELDS = ['created_at', 'reference', 'customer_name', 'status'] as const;
/**
 * `needs_action` is a filter in the same sense as `status` — a value in the URL
 * that narrows the list — so it rides the same hook rather than becoming a
 * second piece of state that can disagree with the address bar.
 */
const FILTER_KEYS = ['status', 'needs_action'] as const;
const COLUMNS = 6;

/**
 * Whether a row is the dealer's to move. Read from the API's own answer rather
 * than from a copy of the status table kept here — the server decides who a
 * sale is waiting on, and two lists of statuses would eventually disagree.
 */
function waitingClassName(row: SaleRow) {
  return row.waiting_on === 'dealer' ? 'font-heavy text-text-primary' : 'text-text-subtle';
}

function SalesContent() {
  const fetchPage = useCallback((view: AdminListView) => getSales(adminListParams(view)), []);
  const list = useAdminList<SaleRow>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: 'Sales could not be loaded.',
  });

  return (
    <div className={pageClassName}>
      <PageHeader
        kicker="Online licensing"
        title="Sales"
        subtitle="Every sale you have started, and what each one is waiting on."
      >
        <Button href="/portal/sales/new">New sale</Button>
      </PageHeader>

      <section className={panelClassName}>
        <AdminFilterBar
          total={list.total}
          noun="sale"
          nounPlural="sales"
          legend={saleStatuses}
          search={list.searchDraft}
          onSearchChange={list.setSearchDraft}
          onSearchSubmit={list.submitSearch}
          searchPlaceholder="Search reference, customer, vehicle or VIN"
        >
          <FilterSelect
            label="Filter sales by who they are waiting on"
            value={list.filters.needs_action}
            onChange={(value) => list.setFilter('needs_action', value)}
            allLabel="Everything"
            options={[{ value: 'true', label: 'Waiting on you' }]}
          />
          <FilterSelect
            label="Filter sales by status"
            value={list.filters.status}
            onChange={(value) => list.setFilter('status', value)}
            allLabel="All statuses"
            options={saleStatuses.map((value) => ({ value, label: statusLabel(value) }))}
          />
        </AdminFilterBar>

        {list.error && <Notice tone="danger">{list.error}</Notice>}
        <div className={adminTableWrapClassName}>
          <table className={adminTableClassName}>
            <thead>
              <tr>
                <SortHeader field="reference" ordering={list.ordering} onSort={list.toggleSort}>
                  Reference
                </SortHeader>
                <SortHeader field="customer_name" ordering={list.ordering} onSort={list.toggleSort}>
                  Customer
                </SortHeader>
                <th className={adminThClassName}>Vehicle</th>
                <SortHeader field="status" ordering={list.ordering} onSort={list.toggleSort}>
                  Status
                </SortHeader>
                <th className={adminThClassName}>Waiting on</th>
                <SortHeader field="created_at" ordering={list.ordering} onSort={list.toggleSort}>
                  Started
                </SortHeader>
              </tr>
            </thead>
            <AdminTableBody
              rows={list.rows}
              loading={list.loading}
              columns={COLUMNS}
              loadingLabel="Loading sales…"
              emptyLabel="No sales match these filters."
            >
              {(sale) => (
                <tr
                  key={sale.reference}
                  className={adminRowClassName}
                  style={statusTone(sale.status)}
                >
                  <td className={cn(adminTdClassName, 'relative')}>
                    <RowLink href={`/portal/sales/${sale.reference}`}>
                      <CellTitle>{sale.reference}</CellTitle>
                    </RowLink>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{sale.customer_name || 'Not named yet'}</CellTitle>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{sale.vehicle}</CellTitle>
                    <CellNote>{formatMoney(sale.vehicle_price ?? '')}</CellNote>
                  </td>
                  <td className={adminTdClassName}>
                    <StatusPill status={sale.status} />
                  </td>
                  <td className={cn(adminTdClassName, waitingClassName(sale))}>
                    {sale.waiting_for}
                  </td>
                  <td className={adminTdClassName}>{formatDateTime(sale.created_at)}</td>
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

      <p className="mt-l text-label text-text-subtle">
        Nothing here yet? <Link href="/portal/sales/new">Start a sale</Link> and we will email the
        customer a link to fill in the rest.
      </p>
    </div>
  );
}

export default function SalesPage() {
  return (
    <Suspense
      fallback={
        <div className={pageClassName}>
          <p className="text-text-subtle">Loading sales…</p>
        </div>
      }
    >
      <SalesContent />
    </Suspense>
  );
}
