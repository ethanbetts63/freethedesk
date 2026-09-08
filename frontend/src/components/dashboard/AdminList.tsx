"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/** A sortable column header. `field` must be one of the list's whitelisted sort fields. */
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
  const active = ordering.replace(/^-/, "") === field;
  const arrow = !active ? "↕" : ordering.startsWith("-") ? "↓" : "↑";
  return (
    <th aria-sort={!active ? "none" : ordering.startsWith("-") ? "descending" : "ascending"}>
      <button type="button" onClick={() => onSort(field)}>
        {children} {arrow}
      </button>
    </th>
  );
}

/** A `<select>` bound to one of the list's query-string filters. */
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
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="all">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** Title, result count, the filter controls and an optional row-colour legend. */
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
    <div className="admin-filter-bar">
      <div>
        <strong>Filters</strong>
        <p>
          {total} {total === 1 ? noun : nounPlural} matching this view
        </p>
      </div>
      <div className="admin-filters">
        {children}
        <form
          className="admin-search"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
        >
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
          />
          <button type="submit">Search</button>
        </form>
      </div>
      {legend && legend.length > 0 && (
        <div className="admin-legend">
          <b>Row colour:</b>
          {legend.map((value) => (
            <span key={value}>
              <i className={`admin-swatch admin-swatch-${value}`} />
              {value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The body of a list table: one loading row, one empty row, or the rows.
 * `colSpan` is taken from the header definition so it can never drift.
 */
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
          <td colSpan={columns} className="admin-empty">
            {loadingLabel}
          </td>
        </tr>
      </tbody>
    );
  if (rows.length === 0)
    return (
      <tbody>
        <tr>
          <td colSpan={columns} className="admin-empty">
            {emptyLabel}
          </td>
        </tr>
      </tbody>
    );
  return <tbody>{rows.map(children)}</tbody>;
}

/**
 * The first cell of a clickable row. A real link, so the row is reachable by
 * keyboard and openable in a new tab — the whole-row `onClick` it replaces was
 * neither.
 */
export function RowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="admin-row-link" href={href}>
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
    <footer className="admin-pagination">
      <span>
        {total ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div>
        <button type="button" disabled={page <= 1 || loading} onClick={() => onPage(page - 1)}>
          ← Previous
        </button>
        <span>
          Page {page} of {pageCount}
        </span>
        <button type="button" disabled={!hasNext || loading} onClick={() => onPage(page + 1)}>
          Next →
        </button>
      </div>
    </footer>
  );
}
