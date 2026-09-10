import Link from "next/link";
import type { ReactNode } from "react";

import { SectionNumber } from "./SectionNumber";
import "./PageOverview.css";

export type PageOverviewItem = {
  title: string;
  description: string;
  href: string;
  meta?: string;
};

export function PageOverview({
  eyebrow,
  title,
  description,
  items,
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  items: readonly PageOverviewItem[];
  id?: string;
}) {
  return (
    <section className="page-overview shell" id={id}>
      <div className="page-overview-copy">
        <SectionNumber>{eyebrow}</SectionNumber>
        <h2>{title}</h2>
        <div className="page-overview-description">{description}</div>
      </div>
      <ol className="page-overview-links">
        {items.map((item, index) => (
          <li key={item.title}>
            <Link href={item.href}>
              <span className="page-overview-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="page-overview-item-copy">
                {item.meta && <small>{item.meta}</small>}
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </span>
              <b aria-hidden="true">↓</b>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
