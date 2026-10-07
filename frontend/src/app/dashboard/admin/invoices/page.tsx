'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';

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
import { StatusPill, statusTone } from '@/components/dashboard/StatusPill';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { cardClassName, panelClassName } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';
import { formatDate, formatMoney } from '@/lib/formatting';
import { cn } from '@/lib/utils';
import { getInvoices, getInvoiceSummary } from './_lib/invoiceApi';
import { INVOICE_FILTERS, displayStatus, invoiceStatuses } from './_lib/invoiceStatus';
import type { InvoiceListItem, InvoiceSummary } from './_lib/invoiceTypes';

const SORT_FIELDS = ['created_at'] as const;
const FILTER_KEYS = ['status'] as const;
const COLUMNS = 6;

function Figure({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={cardClassName}>
      <p className="m-0 text-label font-heavy tracking-label-tight text-text-subtle uppercase">
        {label}
      </p>
      <p className="m-0 mt-2xs text-title-sm font-heavy">{value}</p>
    </div>
  );
}

function InvoicesContent() {
  const fetchPage = useCallback((view: AdminListView) => getInvoices(adminListParams(view)), []);
  const list = useAdminList<InvoiceListItem>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: 'Invoices could not be loaded.',
  });
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);

  useEffect(() => {
    getInvoiceSummary()
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  return (
    <div className={pageClassName}>
      <PageHeader
        kicker="Billing"
        title="Invoices"
        subtitle="Invoices written here, emailed or downloaded as a PDF. To invoice an enquiry, dealer or SEO customer, use Create invoice on their page."
      >
        <Button href="/dashboard/admin/invoices/new">＋ New invoice</Button>
      </PageHeader>

      {summary && (
        <div className="mb-l grid grid-cols-[minmax(0,1fr)] gap-m sm:grid-cols-2 lg:grid-cols-4">
          <Figure
            label={`Awaiting payment (${summary.outstanding_count})`}
            value={formatMoney(summary.outstanding_total)}
          />
          <Figure
            label={`Overdue (${summary.overdue_count})`}
            value={formatMoney(summary.overdue_total)}
          />
          <Figure label="Paid this month" value={formatMoney(summary.paid_this_month_total)} />
          <Figure label="Drafts" value={summary.draft_count} />
        </div>
      )}

      <section className={panelClassName}>
        <AdminFilterBar
          total={list.total}
          noun="invoice"
          nounPlural="invoices"
          legend={invoiceStatuses}
          search={list.searchDraft}
          onSearchChange={list.setSearchDraft}
          onSearchSubmit={list.submitSearch}
          searchPlaceholder="Number, customer, email or reference"
        >
          <FilterSelect
            label="Filter invoices by status"
            value={list.filters.status}
            onChange={(value) => list.setFilter('status', value)}
            allLabel="All invoices"
            options={INVOICE_FILTERS}
          />
        </AdminFilterBar>

        {list.error && <Notice tone="danger">{list.error}</Notice>}
        <div className={adminTableWrapClassName}>
          <table className={adminTableClassName}>
            <thead>
              <tr>
                <th className={adminThClassName}>Number</th>
                <th className={adminThClassName}>Customer</th>
                <th className={adminThClassName}>Issued</th>
                <th className={adminThClassName}>Due</th>
                <th className={adminThClassName}>Total</th>
                <th className={adminThClassName}>Status</th>
              </tr>
            </thead>
            <AdminTableBody
              rows={list.rows}
              loading={list.loading}
              columns={COLUMNS}
              loadingLabel="Loading invoices…"
              emptyLabel="No invoices match these filters."
            >
              {(invoice) => {
                const status = displayStatus(invoice);
                return (
                  <tr key={invoice.id} className={adminRowClassName} style={statusTone(status)}>
                    <td className={cn(adminTdClassName, 'relative font-mono')}>
                      <RowLink href={`/dashboard/admin/invoices/${invoice.id}`}>
                        {invoice.number || 'Draft'}
                      </RowLink>
                    </td>
                    <td className={adminTdClassName}>
                      <CellTitle>{invoice.customer_company || invoice.customer_name}</CellTitle>
                      {invoice.related && <CellNote>{invoice.related.label}</CellNote>}
                    </td>
                    <td className={adminTdClassName}>{formatDate(invoice.issue_date)}</td>
                    <td className={adminTdClassName}>{formatDate(invoice.due_date)}</td>
                    <td className={adminTdClassName}>{formatMoney(invoice.total)}</td>
                    <td className={adminTdClassName}>
                      <StatusPill status={status} />
                    </td>
                  </tr>
                );
              }}
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

export default function InvoicesPage() {
  return (
    <Suspense
      fallback={
        <div className={pageClassName}>
          <p className="text-text-subtle">Loading invoices…</p>
        </div>
      }
    >
      <InvoicesContent />
    </Suspense>
  );
}
