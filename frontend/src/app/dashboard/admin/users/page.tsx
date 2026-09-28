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
import { formatDateTime } from '@/lib/formatting';
import { adminGetAccountRoles, adminGetAccounts } from '@/lib/staffAccountApi';
import {
  STAFF_ACCOUNTS_PATH,
  type StaffAccountRole,
  type StaffAccountRow,
} from '@/types/StaffAccount';
import { Notice } from '@/components/ui/Notice';
import { cn } from '@/lib/utils';
import { panelClassName } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';

const SORT_FIELDS = ['joined', 'name', 'email', 'last_login'] as const;
const FILTER_KEYS = ['role', 'is_active'] as const;
const COLUMNS = 5;

function UsersContent() {
  const [roles, setRoles] = useState<StaffAccountRole[]>([]);
  const fetchPage = useCallback(
    (view: AdminListView) => adminGetAccounts(adminListParams(view)),
    [],
  );
  const list = useAdminList<StaffAccountRow>({
    fetchPage,
    filterKeys: FILTER_KEYS,
    sortFields: SORT_FIELDS,
    loadError: 'Users could not be loaded.',
  });

  // The role list is the site's and does not change while the screen is open.
  useEffect(() => {
    let active = true;
    adminGetAccountRoles()
      .then((next) => {
        if (active) setRoles(next);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={pageClassName}>
      <PageHeader kicker="Every account" title="Users" />

      <section className={panelClassName}>
        <AdminFilterBar
          total={list.total}
          noun="user"
          nounPlural="users"
          search={list.searchDraft}
          onSearchChange={list.setSearchDraft}
          onSearchSubmit={list.submitSearch}
          searchPlaceholder="Search name, email or username"
        >
          <FilterSelect
            label="Filter users by role"
            value={list.filters.role}
            onChange={(value) => list.setFilter('role', value)}
            allLabel="All roles"
            options={roles}
          />
          <FilterSelect
            label="Filter users by status"
            value={list.filters.is_active}
            onChange={(value) => list.setFilter('is_active', value)}
            allLabel="Active and deactivated"
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Deactivated' },
            ]}
          />
        </AdminFilterBar>

        {list.error && <Notice tone="danger">{list.error}</Notice>}
        <div className={adminTableWrapClassName}>
          <table className={adminTableClassName}>
            <thead>
              <tr>
                <SortHeader field="name" ordering={list.ordering} onSort={list.toggleSort}>
                  Name
                </SortHeader>
                <SortHeader field="email" ordering={list.ordering} onSort={list.toggleSort}>
                  Email
                </SortHeader>
                <th className={adminThClassName}>Role</th>
                <SortHeader field="last_login" ordering={list.ordering} onSort={list.toggleSort}>
                  Last sign-in
                </SortHeader>
                <SortHeader field="joined" ordering={list.ordering} onSort={list.toggleSort}>
                  Joined
                </SortHeader>
              </tr>
            </thead>
            <AdminTableBody
              rows={list.rows}
              loading={list.loading}
              columns={COLUMNS}
              loadingLabel="Loading users…"
              emptyLabel="No users match these filters."
            >
              {(account) => (
                <tr key={account.id} className={adminRowClassName}>
                  <td className={cn(adminTdClassName, 'relative')}>
                    <RowLink href={`${STAFF_ACCOUNTS_PATH}/${account.id}`}>
                      <CellTitle>{account.name || account.username}</CellTitle>
                    </RowLink>
                    {account.name && account.username !== account.email && (
                      <CellNote>{account.username}</CellNote>
                    )}
                  </td>
                  <td className={adminTdClassName}>{account.email || '—'}</td>
                  <td className={adminTdClassName}>
                    {account.is_superuser ? 'Superuser' : account.role_label}
                    {account.locked && <CellNote>Locked out</CellNote>}
                    {!account.is_active && <CellNote>Deactivated</CellNote>}
                  </td>
                  <td className={adminTdClassName}>
                    {account.last_login ? formatDateTime(account.last_login) : 'Never'}
                  </td>
                  <td className={adminTdClassName}>{formatDateTime(account.date_joined)}</td>
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

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className={pageClassName}>
          <p className="text-text-subtle">Loading users…</p>
        </div>
      }
    >
      <UsersContent />
    </Suspense>
  );
}
