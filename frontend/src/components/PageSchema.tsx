import { PAGES, breadcrumbItemsFor, type PageDefinition, type PagePath } from '@/lib/pages';
import { buildBreadcrumbSchema, buildServiceSchema, buildWebPageSchema } from '@/lib/seo';

/**
 * Every schema node a registry-declared page emits.
 *
 * `serviceOffers` is the one thing the registry cannot hold: the only page with
 * a published price reads it from the admin at request time, so that page passes
 * its offer node in. Everything else is declared once in PAGES.
 */
export function PageSchema({ path, serviceOffers }: { path: PagePath; serviceOffers?: object }) {
  // Annotated rather than inferred: `as const satisfies` narrows each PAGES
  // entry to its own literal shape, so the optional fields are absent from the
  // union unless every page happens to declare them.
  const page: PageDefinition = PAGES[path];
  const { title, description, updated, service } = page;
  const schemas: object[] = [buildWebPageSchema({ title, description, path, updated })];

  // Same list the visible <Breadcrumbs> renders, so the two cannot drift.
  const crumbs = breadcrumbItemsFor(path);
  if (crumbs.length > 1) schemas.push(buildBreadcrumbSchema(crumbs));

  if (service) {
    schemas.push(buildServiceSchema({ service, path, description, offers: serviceOffers }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
    />
  );
}
