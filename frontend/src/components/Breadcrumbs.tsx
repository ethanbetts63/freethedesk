import { Breadcrumbs as BreadcrumbTrail } from '@/components/layout/Breadcrumbs';
import { breadcrumbItemsFor, type PagePath } from '@/lib/pages';

/**
 * This site's route-aware wrapper around the shared trail. `breadcrumbItemsFor`
 * is the part that knows the page registry, and it is the same list PageSchema
 * feeds to `BreadcrumbList`, so what a reader sees and what Google is told
 * cannot drift.
 */
export function Breadcrumbs({
  path,
  variant = 'band',
}: {
  path: PagePath;
  variant?: 'band' | 'overlay';
}) {
  return <BreadcrumbTrail items={breadcrumbItemsFor(path)} variant={variant} />;
}
