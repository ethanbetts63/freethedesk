import { STATIC_PAGES, breadcrumbItemsFor, type StaticPage, type PagePath } from '@/lib/pages';
import { buildBreadcrumbSchema, buildServiceSchema, buildWebPageSchema } from '@/lib/seo';
import StructuredDataScript from '@/components/seo/StructuredDataScript';

/**
 * Every schema node a registry-declared page emits.
 *
 * `serviceOffers` is the one thing the registry cannot hold: the priced pages
 * read their prices from the admin at request time, so they pass their offer
 * nodes in. Everything else is declared once in STATIC_PAGES.
 */
export function PageSchema({ path, serviceOffers }: { path: PagePath; serviceOffers?: object }) {
  // Annotated rather than inferred: `as const satisfies` narrows each STATIC_PAGES
  // entry to its own literal shape, so the optional fields are absent from the
  // union unless every page happens to declare them.
  const page: StaticPage = STATIC_PAGES[path];
  const { title, description, updated, service } = page;
  const schemas: object[] = [buildWebPageSchema({ title, description, path, updated })];

  // Same list the visible <Breadcrumbs> renders, so the two cannot drift.
  const crumbs = breadcrumbItemsFor(path);
  if (crumbs.length > 1) schemas.push(buildBreadcrumbSchema(crumbs));

  if (service) {
    schemas.push(buildServiceSchema({ service, path, description, offers: serviceOffers }));
  }

  return <StructuredDataScript structuredData={schemas} />;
}
