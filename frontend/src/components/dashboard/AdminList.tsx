'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { AdminButton } from './AdminButton';
import { formControlClassName, formControlPaddingClassName } from './formControl';
import { statusTone } from './StatusPill';

/**
 * The list-table surface shared by the four dashboard list pages.
 *
 * Replaces `admin.css`'s `.admin-table-wrap` / `.admin-table` rules, including
 * the `td`/`th`/`strong`/`small` descendant selectors that styled markup the
 * pages wrote by hand. Those are class constants and two tiny elements now, so
 * a cell's appearance is visible where the cell is written rather than three
 * files away. `<CellTitle>` and `<CellNote>` keep the `<strong>`/`<small>`
 * semantics the originals relied on.
 */
export const adminTableWrapClassName = 'overflow-x-auto';

export const adminTableClassName = 'w-full min-w-[960px] border-collapse';

export const adminThClassName =
  'border-b border-border-default bg-surface-tint px-m py-s text-left text-caption tracking-[0.04em] text-text-muted uppercase';

export const adminTdClassName =
  'border-b border-tint-wash p-m align-middle text-ui leading-[1.45] text-text-muted';

/**
 * Row tint, hover and focus treatment. The tint reads from `--status-tone`, so
 * pair it with `style={statusTone(row.status)}`.
 *
 * `focus-within` rather than `focus` because the focusable thing is the first
 * cell's `<RowLink>`, not the row: the whole row lights up when the link that
 * covers it takes focus.
 */
export const adminRowClassName = [
  'bg-[color-mix(in_srgb,var(--status-tone)_12%,var(--surface-page))]',
  'transition-[filter] duration-150 hover:brightness-[0.975]',
  'focus-within:brightness-[0.95] focus-within:outline-2 focus-within:-outline-offset-2',
  'focus-within:outline-[var(--outline-focus)]',
].join(' ');

/** Bold first line of a cell. */
export function CellTitle({ children }: { children: ReactNode }) {
  return <strong className="block text-small text-text-primary">{children}</strong>;
}

/** Muted second line of a cell, clipped rather than allowed to widen the column. */
export function CellNote({ children }: { children: ReactNode }) {
  return (
    <small className="mt-4xs block max-w-[230px] overflow-hidden text-meta text-ellipsis text-text-subtle">
      {children}
    </small>
  );
}

export function SortHeader({
  field,
  ordering,
  onSort,
  children,
}: {
  field: string;
  ordering: string;
  onSort: (field: string) => void;
  children: ReactNode;
}) {
  const active = ordering.replace(/^-/, '') === field;
  const arrow = !active ? '↕' : ordering.startsWith('-') ? '↓' : '↑';
  return (
    <th
      aria-sort={!active ? 'none' : ordering.startsWith('-') ? 'descending' : 'ascending'}
      className={adminThClassName}
    >
      <button
        className="cursor-pointer border-0 bg-transparent p-0 font-heavy tracking-[inherit] text-inherit [font-size:inherit] [text-transform:inherit]"
        type="button"
        onClick={() => onSort(field)}
      >
        {children} {arrow}
      </button>
    </th>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  allLabel,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      className={cn(formControlClassName, formControlPaddingClassName)}
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="all">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function AdminFilterBar({
  total,
  noun,
  nounPlural,
  legend,
  children,
  search,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder,
}: {
  total: number;
  noun: string;
  nounPlural: string;
  legend?: readonly string[];
  children?: ReactNode;
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  searchPlaceholder: string;
}) {
  return (
    <div className="border-b border-border-default bg-surface-tint p-ml">
      <div>
        <strong className="text-body">Filters</strong>
        <p className="mt-3xs mb-0 text-ui text-text-subtle">
          {total} {total === 1 ? noun : nounPlural} matching this view
        </p>
      </div>
      <div className="mt-m grid grid-cols-[minmax(0,1fr)] gap-xs sm:grid-cols-2 lg:grid-cols-[minmax(155px,0.55fr)_minmax(190px,0.8fr)_minmax(300px,1.5fr)]">
        {children}
        <form
          className="col-auto flex gap-2xs sm:col-[1/-1] lg:col-auto"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
        >
          <input
            className={cn(formControlClassName, formControlPaddingClassName)}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
          />
          <AdminButton variant="quiet" type="submit">
            Search
          </AdminButton>
        </form>
      </div>
      {legend && legend.length > 0 && (
        <div className="mt-m flex flex-wrap items-center gap-s text-meta leading-[1.8] text-text-subtle capitalize sm:leading-[inherit]">
          <b>Row colour:</b>
          {legend.map((value) => (
            <span className="inline-flex items-center gap-3xs" key={value}>
              <i
                className="inline-block h-[10px] w-[10px] rounded-2xs bg-[var(--status-tone)]"
                style={statusTone(value)}
              />
              {value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const emptyCellClassName = cn(adminTdClassName, 'h-[180px] text-center text-text-subtle');

/** List-table body: a loading row, an empty row, or the rows. */
export function AdminTableBody<Row>({
  rows,
  loading,
  columns,
  loadingLabel,
  emptyLabel,
  children,
}: {
  rows: Row[];
  loading: boolean;
  columns: number;
  loadingLabel: string;
  emptyLabel: string;
  children: (row: Row) => ReactNode;
}) {
  if (loading)
    return (
      <tbody>
        <tr>
          <td colSpan={columns} className={emptyCellClassName}>
            {loadingLabel}
          </td>
        </tr>
      </tbody>
    );
  if (rows.length === 0)
    return (
      <tbody>
        <tr>
          <td colSpan={columns} className={emptyCellClassName}>
            {emptyLabel}
          </td>
        </tr>
      </tbody>
    );
  return <tbody>{rows.map(children)}</tbody>;
}

/** First cell of a clickable row — a real link, so it works with the keyboard and new-tab. */
export function RowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      className="block focus-visible:outline-0 after:absolute after:inset-0 after:content-['']"
      href={href}
    >
      {children}
    </Link>
  );
}

export function AdminPagination({
  page,
  total,
  pageSize,
  loading,
  hasNext,
  onPage,
}: {
  page: number;
  total: number;
  pageSize: number;
  loading: boolean;
  hasNext: boolean;
  onPage: (page: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return (
    <footer className="flex flex-col items-start justify-between gap-s px-m py-s text-caption text-text-subtle sm:flex-row sm:items-center sm:gap-0">
      <span>
        {total ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div className="flex items-center gap-xs">
        <AdminButton
          variant="quiet"
          disabled={page <= 1 || loading}
          onClick={() => onPage(page - 1)}
        >
          ← Previous
        </AdminButton>
        <span>
          Page {page} of {pageCount}
        </span>
        <AdminButton
          variant="quiet"
          disabled={!hasNext || loading}
          onClick={() => onPage(page + 1)}
        >
          Next →
        </AdminButton>
      </div>
    </footer>
  );
}
