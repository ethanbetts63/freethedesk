import Link from 'next/link';

import { breadcrumbItemsFor, type PagePath } from '@/lib/pages';

/**
 * The visible trail. Shares `breadcrumbItemsFor` with the BreadcrumbList in
 * PageSchema, so what a reader sees and what Google is told are the same list.
 * Renders nothing on a page that is only one level deep from home.
 *
 * `overlay` floats it in the top-right of a hero and needs a positioned
 * ancestor; `band` is the standalone strip for pages that have no hero.
 */
export function Breadcrumbs({
  path,
  variant = 'band',
}: {
  path: PagePath;
  variant?: 'band' | 'overlay';
}) {
  const items = breadcrumbItemsFor(path);
  if (items.length < 2) return null;

  const isOverlay = variant === 'overlay';

  return (
    <nav
      className={
        isOverlay
          ? 'absolute inset-x-0 top-0 z-2 bg-transparent'
          : 'border-b border-[var(--slate-100)] bg-surface-page'
      }
      aria-label="Breadcrumb"
    >
      <ol
        className={`site-shell m-0 flex list-none flex-wrap items-center gap-xs text-body ${
          isOverlay ? 'min-h-0 pt-ml pb-0 justify-end' : 'min-h-[46px] py-s'
        }`}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex min-w-0 items-center gap-xs">
              {isLast ? (
                <span
                  className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[var(--slate-800)]"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  className="text-[var(--slate-600)] no-underline hover:text-action-primary hover:underline"
                  href={item.path}
                >
                  {item.name}
                </Link>
              )}
              {!isLast && (
                <span className="text-[var(--slate-300)]" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
