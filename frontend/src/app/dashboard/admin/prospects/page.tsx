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
import {
  formatDateTime,
  getReportProspects,
  getReportProspectSummary,
  type ReportProspect,
  type ReportSubjectSummary,
} from '@/lib/adminApi';
import { Notice } from '@/components/ui/Notice';
import { cardClassName, cardTitleClassName, panelClassName } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';

const SORT_FIELDS = ['created_at', 'sent_at', 'called_at', 'business', 'status'] as const;
const FILTER_KEYS = ['called', 'status', 'reply'] as const;
const COLUMNS = 6;

const CALLED_OPTIONS = [
  { value: 'no', label: 'To call' },
  { value: 'yes', label: 'Called' },
];

/** What each subject line has done so far: the numbers the five-way test is read from. */
function SubjectSummary({ subjects }: { subjects: ReportSubjectSummary[] }) {
  return (
    <div className="grid gap-m sm:grid-cols-3 lg:grid-cols-5">
      {subjects.map((row) => (
        <section key={row.subject_version} className={cardClassName}>
          <h2 className={cardTitleClassName}>{row.label}</h2>
          <dl className="grid grid-cols-2 gap-x-m gap-y-2xs text-body-sm">
            <dt className="text-text-subtle">Queued</dt>
            <dd className="m-0 font-heavy">{row.queued}</dd>
            <dt className="text-text-subtle">Reached</dt>
            <dd className="m-0 font-heavy">{row.sent + row.delivered}</dd>
            <dt className="text-text-subtle">Bounced or failed</dt>
            <dd className="m-0 font-heavy">{row.bounced + row.failed + row.suppressed}</dd>
            <dt className="text-text-subtle">Called</dt>
            <dd className="m-0 font-heavy">{row.called}</dd>
            <dt className="text-text-subtle">Positive replies</dt>
            <dd className="m-0 font-heavy">{row.positive}</dd>
          </dl>
        </section>
      ))}
    </div>
  );
}

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
  const [subjects, setSubjects] = useState<ReportSubjectSummary[]>([]);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    let active = true;
    getReportProspectSummary()
      .then((result) => {
        if (active) setSubjects(result.subjects);
      })
      .catch(() => {
        if (active) setSummaryError('The subject totals could not be loaded.');
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={pageClassName}>
      <PageHeader
        kicker="Prospect SEO reports"
        title="Prospects"
        subtitle="Every business sent a free report, the ones still to call first."
      />

      {summaryError ? (
        <Notice tone="danger">{summaryError}</Notice>
      ) : (
        <SubjectSummary subjects={subjects} />
      )}

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
                <th className={adminThClassName}>Report</th>
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
                  </td>
                  <td className={adminTdClassName}>
                    <StatusPill status={prospect.called_at ? 'called' : 'to_call'} />
                    {prospect.called_at && (
                      <CellNote>{formatDateTime(prospect.called_at)}</CellNote>
                    )}
                  </td>
                  <td className={adminTdClassName}>
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
