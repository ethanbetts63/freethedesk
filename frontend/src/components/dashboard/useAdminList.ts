"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { Paginated } from "@/lib/api";

export const ADMIN_PAGE_SIZE = 50;

/** Everything `fetchPage` needs to describe the current view. */
export interface AdminListView {
  filters: Record<string, string>;
  search: string;
  ordering: string;
  page: number;
  pageSize: number;
}

interface Options<Row> {
  /** Fetches one page. Called from an effect keyed only on the serialised view. */
  fetchPage: (view: AdminListView) => Promise<Paginated<Row>>;
  /** Query-string keys this list filters on. `search` is always included. */
  filterKeys: readonly string[];
  /** Whitelisted sort columns; the first is the default, newest-first. */
  sortFields: readonly string[];
  /** Shown if the fetch throws. */
  loadError: string;
  pageSize?: number;
}

/**
 * The URL-driven state machine behind every dashboard list.
 *
 * Filters, search, sort and page all live in the query string, so Back/Forward
 * work and a filtered view can be linked to. `loading` is *derived* — true
 * whenever the requested view is not the one last loaded — which keeps it
 * honest when a filter changes without a setState inside the effect.
 */
export function useAdminList<Row>({
  fetchPage,
  filterKeys,
  sortFields,
  loadError,
  pageSize = ADMIN_PAGE_SIZE,
}: Options<Row>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const params = useMemo(() => new URLSearchParams(queryString), [queryString]);

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filters = useMemo(() => {
    const out: Record<string, string> = {};
    for (const key of filterKeys) out[key] = params.get(key) ?? "all";
    return out;
  }, [params, filterKeys]);

  const search = params.get("search") ?? "";
  const [searchDraft, setSearchDraft] = useState(search);
  // Re-sync the uncommitted draft when the committed search changes by some
  // route other than typing — Back/Forward, or a shared link. Adjusted during
  // render rather than in an effect.
  const [lastSyncedSearch, setLastSyncedSearch] = useState(search);
  if (search !== lastSyncedSearch) {
    setLastSyncedSearch(search);
    setSearchDraft(search);
  }

  const ordering = useMemo(() => {
    const value = params.get("ordering") ?? "";
    return sortFields.includes(value.replace(/^-/, "")) ? value : `-${sortFields[0]}`;
  }, [params, sortFields]);

  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);

  const view: AdminListView = useMemo(
    () => ({ filters, search, ordering, page, pageSize }),
    [filters, search, ordering, page, pageSize],
  );
  const viewKey = useMemo(() => JSON.stringify(view), [view]);
  const loading = loadedKey !== viewKey;

  const setQuery = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(queryString);
      Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
      const text = next.toString();
      router.replace(text ? `${pathname}?${text}` : pathname, { scroll: false });
    },
    [pathname, queryString, router],
  );

  // Any filter or search change resets to page 1: page 4 of the old view is
  // rarely a sensible place to land in the new one.
  const setFilter = useCallback(
    (key: string, value: string) => setQuery({ [key]: value === "all" ? null : value, page: null }),
    [setQuery],
  );

  const submitSearch = useCallback(
    () => setQuery({ search: searchDraft.trim() || null, page: null }),
    [setQuery, searchDraft],
  );

  const toggleSort = useCallback(
    (field: string) => {
      const active = ordering.replace(/^-/, "") === field;
      setQuery({ ordering: active && !ordering.startsWith("-") ? `-${field}` : field, page: null });
    },
    [ordering, setQuery],
  );

  const setPage = useCallback((next: number) => setQuery({ page: next > 1 ? String(next) : null }), [setQuery]);

  useEffect(() => {
    let active = true;
    fetchPage(view)
      .then((result) => {
        if (!active) return;
        setRows(result.results);
        setTotal(result.count);
        setHasNext(Boolean(result.next));
        setError("");
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : loadError);
      })
      .finally(() => {
        if (active) setLoadedKey(viewKey);
      });
    return () => {
      active = false;
    };
    // viewKey is the real trigger; fetchPage and loadError are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey]);

  return {
    rows,
    total,
    loading,
    error,
    hasNext,
    filters,
    setFilter,
    search,
    searchDraft,
    setSearchDraft,
    submitSearch,
    ordering,
    toggleSort,
    page,
    pageSize,
    setPage,
  };
}

/** Turns the hook's view into the query params the admin API expects. */
export function adminListParams(view: AdminListView): Record<string, string | number | undefined> {
  return { ...view.filters, search: view.search, ordering: view.ordering, page: view.page, page_size: view.pageSize };
}
