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
  prospectStatuses,
  StatusPill,
  statusLabel,
  statusTone,
} from '@/components/dashboard/StatusPill';
import {
  formatDateTime,
  getOutreachSummary,
  getProspects,
  type OutreachVersionSummary,
  type Prospect,
} from '@/lib/adminApi';
import { Notice } from '@/components/ui/Notice';
import { cardClassName, cardTitleClassName, panelClassName } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';

const SORT_FIELDS = [
  'created_at',
  'pitched_at',
  'podcast_name',
  'version',
  'relevance',
  'status',
] as const;
const FILTER_KEYS = ['status', 'version', 'reply', 'relevance'] as const;
const COLUMNS = 8;

const VERSION_OPTIONS = [
  { value: 'a', label: 'Version A' },
  { value: 'b', label: 'Version B' },
  { value: 'c', label: 'Version C' },
];

const RELEVANCE_OPTIONS = [
  { value: 'high', label: 'High relevance' },
  { value: 'medium', label: 'Medium relevance' },
  { value: 'low', label: 'Low relevance' },
];

/** What each version has done so far: the numbers the A/B/C test is read from. */
function VersionSummary({ versions }: { versions: OutreachVersionSummary[] }) {
  return (
    <div className="grid gap-m sm:grid-cols-3">
      {versions.map((row) => {
        const reached = row.sent + row.delivered;
        return (
          <section key={row.version} className={cardClassName}>
            <h2 className={cardTitleClassName}>Version {row.version.toUpperCase()}</h2>
            <dl className="grid grid-cols-2 gap-x-m gap-y-2xs text-body-sm">
              <dt className="text-text-subtle">Queued</dt>
              <dd className="m-0 font-heavy">{row.queued}</dd>
              <dt className="text-text-subtle">Reached</dt>
              <dd className="m-0 font-heavy">{reached}</dd>
              <dt className="text-text-subtle">Bounced or failed</dt>
              <dd className="m-0 font-heavy">{row.bounced + row.failed + row.suppressed}</dd>
              <dt className="text-text-subtle">Positive replies</dt>
              <dd className="m-0 font-heavy">{row.positive}</dd>
              <dt className="text-text-subtle">Signed up</dt>
              <dd className="m-0 font-heavy">{row.signed_up}</dd>
            </dl>
          </section>
        );
      })}
    </div>
  );
}

function OutreachContent() {
  const fetchPage = useCallback((view: AdminListView) => getProspects(adminListParams(view)), []);
  const list = useAdminList<Prospect>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: 'Prospects could not be loaded.',
  });
  const [versions, setVersions] = useState<OutreachVersionSummary[]>([]);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    let active = true;
    getOutreachSummary()
      .then((result) => {
        if (active) setVersions(result.versions);
      })
      .catch(() => {
        if (active) setSummaryError('The version totals could not be loaded.');
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={pageClassName}>
      <PageHeader
        kicker="Podcast affiliate program"
        title="Outreach"
        subtitle="Every podcast host the hourly pitch has been, or will be, sent to."
      />

      {summaryError ? (
        <Notice tone="danger">{summaryError}</Notice>
      ) : (
        <VersionSummary versions={versions} />
      )}

      <section className={panelClassName}>
        <AdminFilterBar
          total={list.total}
          noun="prospect"
          nounPlural="prospects"
          legend={prospectStatuses}
          search={list.searchDraft}
          onSearchChange={list.setSearchDraft}
          onSearchSubmit={list.submitSearch}
          searchPlaceholder="Search podcast, host or email"
        >
          <FilterSelect
            label="Filter prospects by status"
            value={list.filters.status}
            onChange={(value) => list.setFilter('status', value)}
            allLabel="All statuses"
            options={prospectStatuses.map((value) => ({ value, label: statusLabel(value) }))}
          />
          <FilterSelect
            label="Filter prospects by pitch version"
            value={list.filters.version}
            onChange={(value) => list.setFilter('version', value)}
            allLabel="All versions"
            options={VERSION_OPTIONS}
          />
          <FilterSelect
            label="Filter prospects by audience relevance"
            value={list.filters.relevance}
            onChange={(value) => list.setFilter('relevance', value)}
            allLabel="Any relevance"
            options={RELEVANCE_OPTIONS}
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
                <SortHeader field="created_at" ordering={list.ordering} onSort={list.toggleSort}>
                  Added
                </SortHeader>
                <SortHeader field="podcast_name" ordering={list.ordering} onSort={list.toggleSort}>
                  Podcast
                </SortHeader>
                <th className={adminThClassName}>Host</th>
                <SortHeader field="version" ordering={list.ordering} onSort={list.toggleSort}>
                  Version
                </SortHeader>
                <SortHeader field="relevance" ordering={list.ordering} onSort={list.toggleSort}>
                  Relevance
                </SortHeader>
                <SortHeader field="status" ordering={list.ordering} onSort={list.toggleSort}>
                  Status
                </SortHeader>
                <SortHeader field="pitched_at" ordering={list.ordering} onSort={list.toggleSort}>
                  Pitched
                </SortHeader>
                <th className={adminThClassName}>Reply</th>
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
                  style={statusTone(prospect.status)}
                >
                  <td className={adminTdClassName}>
                    <RowLink href={`/dashboard/admin/outreach/${prospect.id}`}>
                      {formatDateTime(prospect.created_at)}
                    </RowLink>
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{prospect.podcast_name}</CellTitle>
                    {prospect.website && <CellNote>{prospect.website}</CellNote>}
                  </td>
                  <td className={adminTdClassName}>
                    <CellTitle>{prospect.host_name || '—'}</CellTitle>
                    <CellNote>{prospect.email}</CellNote>
                  </td>
                  <td className={adminTdClassName}>{prospect.version_label}</td>
                  <td className={adminTdClassName}>{prospect.relevance_label || '—'}</td>
                  <td className={adminTdClassName}>
                    <StatusPill status={prospect.status} />
                    {prospect.affiliate_name && <CellNote>{prospect.affiliate_name}</CellNote>}
                  </td>
                  <td className={adminTdClassName}>
                    {prospect.pitched_at ? formatDateTime(prospect.pitched_at) : '—'}
                  </td>
                  <td className={adminTdClassName}>
                    {prospect.reply === 'none' ? '—' : <StatusPill status={prospect.reply} />}
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

export default function OutreachPage() {
  return (
    <Suspense
      fallback={
        <div className={pageClassName}>
          <p className="text-text-subtle">Loading prospects…</p>
        </div>
      }
    >
      <OutreachContent />
    </Suspense>
  );
}
