import Link from "next/link";

import { breadcrumbItemsFor, type PagePath } from "@/lib/pages";

import "./Breadcrumbs.css";

/**
 * The visible trail. Shares `breadcrumbItemsFor` with the BreadcrumbList in
 * PageSchema, so what a reader sees and what Google is told are the same list.
 * Renders nothing on a page that is only one level deep from home.
 *
 * `overlay` floats it in the top-right of a hero and needs a positioned
 * ancestor; `band` is the standalone strip for pages that have no hero.
 */
export function Breadcrumbs({ path, variant = "band" }: { path: PagePath; variant?: "band" | "overlay" }) {
  const items = breadcrumbItemsFor(path);
  if (items.length < 2) return null;

  return (
    <nav className={variant === "overlay" ? "breadcrumbs breadcrumbs-overlay" : "breadcrumbs"} aria-label="Breadcrumb">
      <ol className="shell breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path}>
              {isLast ? (
                <span className="breadcrumbs-current" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path}>{item.name}</Link>
              )}
              {!isLast && (
                <span className="breadcrumbs-sep" aria-hidden="true">
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
