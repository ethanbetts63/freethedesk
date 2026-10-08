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
  orderStatuses,
  StatusPill,
  statusLabel,
  statusTone,
} from '@/components/dashboard/StatusPill';
import { formatDateTime, getPackageOrders, type AdminPackageOrder } from '@/lib/adminApi';
import { formatMoney } from '@/lib/formatting';
import { Notice } from '@/components/ui/Notice';
import { cn } from '@/lib/utils';
import { panelClassName } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';

const SORT_FIELDS = ['created_at', 'package', 'price', 'payment_status'] as const;
const FILTER_KEYS = ['payment_status', 'package'] as const;

/** Mirrors PackageOrder.Package. */
const PACKAGE_OPTIONS = [
  { value: 'website_small', label: 'Website package 1' },
  { value: 'website_large', label: 'Website package 2' },
  { value: 'web_application', label: 'Web application discovery' },
  { value: 'automation_discovery', label: 'Automation discovery' },
];

const COLUMNS = 5;

function money(value: string) {
  return formatMoney(value, { cents: 'auto' });
}

function OrdersContent() {
  const fetchPage = useCallback(
    (view: AdminListView) => getPackageOrders(adminListParams(view)),
    [],
  );
  const list = useAdminList<AdminPackageOrder>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: 'Orders could not be loaded.',
  });

  return (
    <div className={pageClassName}>
      <PageHeader kicker="Packages bought online" title="Orders" />

      <section className={panelClassName}>
        <AdminFilterBar
          total={list.total}
          noun="order"
          nounPlural="orders"
          legend={orderStatuses}
          search={list.searchDraft}
          onSearchChange={list.setSearchDraft}
          onSearchSubmit={list.submitSearch}
          searchPlaceholder="Search business, email or notes"
        >
          <FilterSelect
            label="Filter orders by payment"
            value={list.filters.payment_status}
            onChange={(value) => list.setFilter('payment_status', value)}
            allLabel="All payments"
            options={orderStatuses.map((value) => ({ value, label: statusLabel(value) }))}
          />
          <FilterSelect
            label="Filter orders by package"
            value={list.filters.package}
            onChange={(value) => list.setFilter('package', value)}
            allLabel="All packages"
            options={PACKAGE_OPTIONS}
          />
        </AdminFilterBar>

        {list.error && <Notice tone="danger">{list.error}</Notice>}
        <div className={adminTableWrapClassName}>
          <table className={adminTableClassName}>
            <thead>
              <tr>
                <SortHeader field="created_at" ordering={list.ordering} onSort={list.toggleSort}>
                  Ordered
                </SortHeader>
                <th className={adminThClassName}>Customer</th>
                <SortHeader field="package" ordering={list.ordering} onSort={list.toggleSort}>
                  Package
                </SortHeader>
                <SortHeader field="price" ordering={list.ordering} onSort={list.toggleSort}>
                  Price
                </SortHeader>
                <SortHeader
                  field="payment_status"
                  ordering={list.ordering}
                  onSort={list.toggleSort}
                >
                  Payment
                </SortHeader>
              </tr>
            </thead>
            <AdminTableBody
              rows={list.rows}
              loading={list.loading}
              columns={COLUMNS}
              loadingLabel="Loading orders…"
              emptyLabel="No orders match these filters."
            >
              {(order) => (
                <tr
                  key={order.id}
                  className={adminRowClassName}
                  style={statusTone(order.payment_status)}
                >
                  <td className={cn(adminTdClassName, 'relative')}>
                    <RowLink href={`/dashboard/admin/orders/${order.id}`}>
                      {formatDateTime(order.created_at)}
                    </RowLink>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{order.business_name || '—'}</CellTitle>
                    <CellNote>{order.email}</CellNote>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{order.package_name}</CellTitle>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{money(order.price)}</CellTitle>
                    {Number(order.balance) > 0 && (
                      <CellNote>{money(order.balance)} due before launch</CellNote>
                    )}
                  </td>
                  <td className={adminTdClassName}>
                    <StatusPill status={order.payment_status} />
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

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className={pageClassName}>
          <p className="text-text-subtle">Loading orders…</p>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
