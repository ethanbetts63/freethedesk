import { SectionNumber } from "@/components/SectionNumber";

import styles from "./IndexedFeatureSection.module.css";

export type IndexedFeature = readonly [string, string];

export function IndexedFeatureSection({
  eyebrow,
  title,
  accentTitle,
  lead,
  items,
  id,
  footer,
}: {
  eyebrow: string;
  title: string;
  accentTitle: string;
  lead: string;
  items: readonly IndexedFeature[];
  id?: string;
  footer?: React.ReactNode;
}) {
  return (
    <section className={styles.section} id={id}>
      <div className="shell">
        <div className={styles.heading}>
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2>
            {title} <span className="moving-colour-text">{accentTitle}</span>
          </h2>
          <p className={styles.lead}>{lead}</p>
        </div>

        <ol className={`${styles.items} ${items.length === 2 ? styles.twoColumns : ""}`}>
          {items.map(([itemTitle, body], index) => (
            <li key={itemTitle}>
              <span className={styles.itemIndex}>{String(index + 1).padStart(2, "0")}</span>
              <strong>{itemTitle}</strong>
              <p>{body}</p>
            </li>
          ))}
        </ol>

        {footer}
      </div>
    </section>
  );
}
