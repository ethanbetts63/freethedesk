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
 * The visible trail, from the same `{ name, path }[]` fed to `buildBreadcrumbSchema`, so page and schema agree.
 * Renders nothing for fewer than two crumbs (the home page).
 * `overlay` floats top-right in a hero and needs a positioned ancestor; `band` is the standalone strip.
 */
export function Breadcrumbs({
  items,
  variant = 'band',
}: {
  items: BreadcrumbItem[];
  variant?: 'band' | 'overlay';
}) {
  if (items.length < 2) return null;

  const isOverlay = variant === 'overlay';

  return (
    <nav
      aria-label="Breadcrumb"
      className={
        isOverlay
          ? 'absolute inset-x-0 top-0 z-2 bg-transparent'
          : 'border-b border-border-default bg-surface-page'
      }
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
