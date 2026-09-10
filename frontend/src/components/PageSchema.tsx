import { PAGES, breadcrumbItemsFor, type PagePath } from "@/lib/pages";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo";

export function PageSchema({ path }: { path: PagePath }) {
  const { title, description, updated } = PAGES[path];
  const schemas: object[] = [buildWebPageSchema({ title, description, path, updated })];

  // Same list the visible <Breadcrumbs> renders, so the two cannot drift.
  const crumbs = breadcrumbItemsFor(path);
  if (crumbs.length > 1) schemas.push(buildBreadcrumbSchema(crumbs));

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />;
}
