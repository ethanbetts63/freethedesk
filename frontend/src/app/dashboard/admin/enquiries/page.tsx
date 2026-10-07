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
  enquiryStatuses,
  StatusPill,
  statusLabel,
  statusTone,
} from '@/components/dashboard/StatusPill';
import { formatDateTime, getEnquiries, type Enquiry } from '@/lib/adminApi';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { cn } from '@/lib/utils';
import { panelClassName } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';

const SORT_FIELDS = ['created_at', 'business', 'help_with', 'status'] as const;
const FILTER_KEYS = ['status', 'help_with'] as const;

/** Mirrors Enquiry.HelpWith: the project form's scopes, the web application package and the AI check. */
const HELP_WITH_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'web_application', label: 'Web application' },
  { value: 'automation', label: 'Business automation' },
  { value: 'everything', label: 'Website and automation' },
  { value: 'ai_readiness', label: 'AI readiness check' },
];

const COLUMNS = 5;

function EnquiriesContent() {
  const fetchPage = useCallback((view: AdminListView) => getEnquiries(adminListParams(view)), []);
  const list = useAdminList<Enquiry>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: 'Enquiries could not be loaded.',
  });

  return (
    <div className={pageClassName}>
      <PageHeader kicker="Lead management" title="Enquiries">
        <Button href="/dashboard/admin/messages/compose">＋ Compose</Button>
      </PageHeader>

      <section className={panelClassName}>
        <AdminFilterBar
          total={list.total}
          noun="enquiry"
          nounPlural="enquiries"
          legend={enquiryStatuses}
          search={list.searchDraft}
          onSearchChange={list.setSearchDraft}
          onSearchSubmit={list.submitSearch}
          searchPlaceholder="Search business, person or email"
        >
          <FilterSelect
            label="Filter enquiries by status"
            value={list.filters.status}
            onChange={(value) => list.setFilter('status', value)}
            allLabel="All statuses"
            options={enquiryStatuses.map((value) => ({ value, label: statusLabel(value) }))}
          />
          <FilterSelect
            label="Filter enquiries by type"
            value={list.filters.help_with}
            onChange={(value) => list.setFilter('help_with', value)}
            allLabel="All enquiry types"
            options={HELP_WITH_OPTIONS}
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
                <SortHeader field="business" ordering={list.ordering} onSort={list.toggleSort}>
                  Business
                </SortHeader>
                <th className={adminThClassName}>Contact</th>
                <SortHeader field="help_with" ordering={list.ordering} onSort={list.toggleSort}>
                  Interested in
                </SortHeader>
                <SortHeader field="status" ordering={list.ordering} onSort={list.toggleSort}>
                  Status
                </SortHeader>
              </tr>
            </thead>
            <AdminTableBody
              rows={list.rows}
              loading={list.loading}
              columns={COLUMNS}
              loadingLabel="Loading enquiries…"
              emptyLabel="No enquiries match these filters."
            >
              {(enquiry) => (
                <tr
                  key={enquiry.id}
                  className={adminRowClassName}
                  style={statusTone(enquiry.status)}
                >
                  <td className={cn(adminTdClassName, 'relative')}>
                    <RowLink href={`/dashboard/admin/enquiries/${enquiry.id}`}>
                      {formatDateTime(enquiry.created_at)}
                    </RowLink>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{enquiry.business || '—'}</CellTitle>
                    {enquiry.website && (
                      <CellNote>{enquiry.website.replace(/^https?:\/\//, '')}</CellNote>
                    )}
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{enquiry.name}</CellTitle>
                    <CellNote>{enquiry.email}</CellNote>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{enquiry.help_with_label}</CellTitle>
                    {enquiry.configuration?.budget && (
                      <CellNote>Budget: {enquiry.configuration.budget}</CellNote>
                    )}
                    {enquiry.configuration?.package_name && (
                      <CellNote>Bought: {enquiry.configuration.package_name}</CellNote>
                    )}
                  </td>
                  <td className={adminTdClassName}>
                    <StatusPill status={enquiry.status} />
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

export default function EnquiriesPage() {
  return (
    <Suspense
      fallback={
        <div className={pageClassName}>
          <p className="text-text-subtle">Loading enquiries…</p>
        </div>
      }
    >
      <EnquiriesContent />
    </Suspense>
  );
}
