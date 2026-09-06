import { buildBreadcrumbItems, buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo";

/** Drop into any indexable page: emits WebPage + BreadcrumbList JSON-LD tied to the sitewide Organization/WebSite schema. */
export function PageSchema({ title, description, path }: { title: string; description?: string; path: string }) {
  const schemas: object[] = [buildWebPageSchema({ title, description, path })];
  if (path !== "/") schemas.push(buildBreadcrumbSchema(buildBreadcrumbItems(path, title)));

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />;
}
