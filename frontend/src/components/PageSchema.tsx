import { PAGES, type PagePath } from "@/lib/pages";
import { buildBreadcrumbItems, buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo";

export function PageSchema({ path }: { path: PagePath }) {
  const { title, description, updated, label } = PAGES[path];
  const schemas: object[] = [buildWebPageSchema({ title, description, path, updated })];
  if (path !== "/") schemas.push(buildBreadcrumbSchema(buildBreadcrumbItems(path, label ?? title)));

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />;
}
