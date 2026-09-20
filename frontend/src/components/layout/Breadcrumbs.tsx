/* Component registry: freetheplatform/frontend/registry/src/components/layout/Breadcrumbs.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Link from 'next/link';

import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/**
 * The visible trail.
 *
 * It takes the same `{ name, path }[]` that every site already feeds to its
 * `buildBreadcrumbSchema`, so a page that renders this and emits a
 * `BreadcrumbList` cannot tell a reader one thing and Google another. Resolving
 * that list from a route stays with each site, which is the part that knows its
 * own page registry.
 *
 * Renders nothing when handed fewer than two crumbs — that is, on the home
 * page itself, whose trail would be the single word "Home". Every other page
 * draws, including one whose trail is just `Home / This page`.
 *
 * `overlay` floats it in the top-right of a hero and needs a positioned
 * ancestor; `band` is the standalone strip for pages that have no hero.
 */
export function Breadcrumbs({
  items,
  variant = 'band',
  className,
}: {
  items: BreadcrumbItem[];
  variant?: 'band' | 'overlay';
  className?: string;
}) {
  if (items.length < 2) return null;

  const isOverlay = variant === 'overlay';

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        isOverlay
          ? 'absolute inset-x-0 top-0 z-2 bg-transparent'
          : 'border-b border-border-default bg-surface-page',
        className,
      )}
    >
      <ol
        className={cn(
          'site-shell m-0 flex list-none flex-wrap items-center gap-xs text-body-sm',
          isOverlay ? 'min-h-0 justify-end pt-ml pb-0' : 'min-h-[46px] py-s',
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex min-w-0 items-center gap-xs">
              {isLast ? (
                <span
                  aria-current="page"
                  className="overflow-hidden font-semibold text-ellipsis whitespace-nowrap text-text-primary"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="text-text-muted no-underline hover:text-action-primary hover:underline"
                >
                  {item.name}
                </Link>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-text-muted opacity-60">
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

export default Breadcrumbs;
