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
  prospectReplies,
  reportProspectStatuses,
  StatusPill,
  statusLabel,
  statusTone,
} from '@/components/dashboard/StatusPill';
import { formatDateTime, getReportProspects, type ReportProspect } from '@/lib/adminApi';
import { Notice } from '@/components/ui/Notice';
import { panelClassName } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';

const SORT_FIELDS = ['created_at', 'sent_at', 'called_at', 'business', 'status'] as const;
const FILTER_KEYS = ['called', 'status', 'reply'] as const;
const COLUMNS = 6;

const CALLED_OPTIONS = [
  { value: 'no', label: 'To call' },
  { value: 'yes', label: 'Called' },
];

function ProspectsContent() {
  const fetchPage = useCallback(
    (view: AdminListView) => getReportProspects(adminListParams(view)),
    [],
  );
  const list = useAdminList<ReportProspect>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: 'Prospects could not be loaded.',
  });
  return (
    <div className={pageClassName}>
      <PageHeader
        kicker="Prospect SEO reports"
        title="Prospects"
        subtitle="Every business sent a free report, the ones still to call first."
      />

      <section className={panelClassName}>
        <AdminFilterBar
          total={list.total}
          noun="prospect"
          nounPlural="prospects"
          legend={reportProspectStatuses}
          search={list.searchDraft}
          onSearchChange={list.setSearchDraft}
          onSearchSubmit={list.submitSearch}
          searchPlaceholder="Search business, domain or email"
        >
          <FilterSelect
            label="Filter prospects by call"
            value={list.filters.called}
            onChange={(value) => list.setFilter('called', value)}
            allLabel="Called or not"
            options={CALLED_OPTIONS}
          />
          <FilterSelect
            label="Filter prospects by email status"
            value={list.filters.status}
            onChange={(value) => list.setFilter('status', value)}
            allLabel="All statuses"
            options={reportProspectStatuses.map((value) => ({ value, label: statusLabel(value) }))}
          />
          <FilterSelect
            label="Filter prospects by reply"
            value={list.filters.reply}
            onChange={(value) => list.setFilter('reply', value)}
            allLabel="Any reply"
            options={prospectReplies.map((value) => ({ value, label: statusLabel(value) }))}
          />
        </AdminFilterBar>

        {list.error && <Notice tone="danger">{list.error}</Notice>}
        <div className={adminTableWrapClassName}>
          <table className={adminTableClassName}>
            <thead>
              <tr>
                <SortHeader field="business" ordering={list.ordering} onSort={list.toggleSort}>
                  Business
                </SortHeader>
                <th className={adminThClassName}>Contact</th>
                <th className={adminThClassName}>Issues found</th>
                <SortHeader field="sent_at" ordering={list.ordering} onSort={list.toggleSort}>
                  Emailed
                </SortHeader>
                <SortHeader field="called_at" ordering={list.ordering} onSort={list.toggleSort}>
                  Called
                </SortHeader>
                <th className={adminThClassName}>Link opened</th>
              </tr>
            </thead>
            <AdminTableBody
              rows={list.rows}
              loading={list.loading}
              columns={COLUMNS}
              loadingLabel="Loading prospects…"
              emptyLabel="No prospects match these filters."
            >
              {(prospect) => (
                <tr
                  key={prospect.id}
                  className={adminRowClassName}
                  style={statusTone(prospect.called_at ? 'called' : 'to_call')}
                >
                  <td className={adminTdClassName}>
                    <RowLink href={`/dashboard/admin/prospects/${prospect.id}`}>
                      {prospect.business}
                    </RowLink>
                    <CellNote>{prospect.overview}</CellNote>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{prospect.contact_name || '—'}</CellTitle>
                    <CellNote>{prospect.email}</CellNote>
                    {prospect.phone && <CellNote>{prospect.phone}</CellNote>}
                  </td>
                  <td className={adminTdClassName}>
                    {prospect.issues.slice(0, 3).map((issue) => (
                      <CellNote key={issue}>{issue}</CellNote>
                    ))}
                  </td>
                  <td className={adminTdClassName}>
                    <StatusPill status={prospect.status} />
                    {prospect.sent_at && <CellNote>{formatDateTime(prospect.sent_at)}</CellNote>}
                    <CellNote>
                      Subject {prospect.subject_version}, body {prospect.body_version}
                    </CellNote>
                  </td>
                  <td className={adminTdClassName}>
                    <StatusPill status={prospect.called_at ? 'called' : 'to_call'} />
                    {prospect.called_at && (
                      <CellNote>{formatDateTime(prospect.called_at)}</CellNote>
                    )}
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>
                      {prospect.opens
                        ? `Opened ${prospect.opens}×`
                        : prospect.sent_at
                          ? 'Not opened'
                          : '—'}
                    </CellTitle>
                    {prospect.last_opened_at && (
                      <CellNote>{formatDateTime(prospect.last_opened_at)}</CellNote>
                    )}
                    <CellNote>{prospect.report_path}</CellNote>
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

export default function ProspectsPage() {
  return (
    <Suspense
      fallback={
        <div className={pageClassName}>
          <p className="text-text-subtle">Loading prospects…</p>
        </div>
      }
    >
      <ProspectsContent />
    </Suspense>
  );
}
