import { PAGES, type PagePath } from "@/lib/pages";
import { buildBreadcrumbItems, buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo";

/**
 * Drop into any registered page: emits WebPage + BreadcrumbList JSON-LD tied to
 * the sitewide Organization/WebSite schema. Title and description come from the
 * page registry, so they cannot drift from the page's own `<head>` metadata.
 */
export function PageSchema({ path }: { path: PagePath }) {
  const { title, description } = PAGES[path];
  const schemas: object[] = [buildWebPageSchema({ title, description, path })];
  if (path !== "/") schemas.push(buildBreadcrumbSchema(buildBreadcrumbItems(path, title)));

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />;
}
