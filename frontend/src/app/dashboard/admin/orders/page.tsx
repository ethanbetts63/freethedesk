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
import { formatDateTime, getOrders, type AdminOrder } from '@/lib/adminApi';
import { formatMoney } from '@/lib/formatting';
import { Notice } from '@/components/ui/Notice';
import { cn } from '@/lib/utils';
import { panelClassName } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';

const SORT_FIELDS = ['created_at', 'product', 'price', 'payment_status'] as const;
const FILTER_KEYS = ['payment_status', 'kind'] as const;

const KIND_OPTIONS = [
  { value: 'package', label: 'Website packages' },
  { value: 'audit', label: 'SEO audits' },
];

const COLUMNS = 5;

function money(value: string) {
  return formatMoney(value, { cents: 'auto' });
}

/**
 * Everything bought online: website packages and SEO audits in one list, each row linking to
 * its own detail page. A package order that has not paid and an audit signup that has not paid
 * both read "Payment pending", so abandoned checkouts of either kind can be chased from here.
 */
function OrdersContent() {
  const fetchPage = useCallback((view: AdminListView) => getOrders(adminListParams(view)), []);
  const list = useAdminList<AdminOrder>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: 'Orders could not be loaded.',
  });

  return (
    <div className={pageClassName}>
      <PageHeader kicker="Everything bought online" title="Orders" />

      <section className={panelClassName}>
        <AdminFilterBar
          total={list.total}
          noun="order"
          nounPlural="orders"
          legend={orderStatuses}
          search={list.searchDraft}
          onSearchChange={list.setSearchDraft}
          onSearchSubmit={list.submitSearch}
          searchPlaceholder="Search business or email"
        >
          <FilterSelect
            label="Filter orders by payment"
            value={list.filters.payment_status}
            onChange={(value) => list.setFilter('payment_status', value)}
            allLabel="All payments"
            options={orderStatuses.map((value) => ({ value, label: statusLabel(value) }))}
          />
          <FilterSelect
            label="Filter orders by what was bought"
            value={list.filters.kind}
            onChange={(value) => list.setFilter('kind', value)}
            allLabel="Packages and audits"
            options={KIND_OPTIONS}
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
                <SortHeader field="product" ordering={list.ordering} onSort={list.toggleSort}>
                  Bought
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
                  key={`${order.kind}-${order.id}`}
                  className={adminRowClassName}
                  style={statusTone(order.payment_status)}
                >
                  <td className={cn(adminTdClassName, 'relative')}>
                    <RowLink href={order.href}>{formatDateTime(order.created_at)}</RowLink>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{order.business_name || '—'}</CellTitle>
                    <CellNote>{order.email}</CellNote>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{order.product_name}</CellTitle>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{order.price ? money(order.price) : '—'}</CellTitle>
                    {order.note && <CellNote>{order.note}</CellNote>}
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
