import type { ReactNode } from "react";

import styles from "./ReportCardVisual.module.css";

export type ReportCardItem = {
  title: string;
  description: string;
  icon?: ReactNode;
  tag?: string;
};

type ReportCardVisualProps = {
  title: string;
  subtitle: string;
  badge: string;
  items: readonly ReportCardItem[];
  footerItems: readonly string[];
  ariaLabel?: string;
};

export function ReportCardVisual({ title, subtitle, badge, items, footerItems, ariaLabel }: ReportCardVisualProps) {
  return (
    <div className={styles.card} aria-label={ariaLabel}>
      <header className={styles.head}>
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div>
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </div>
        <span className={styles.badge}>{badge}</span>
      </header>

      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={item.title}>
            <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.icon} aria-hidden="true">
              {item.icon ?? "✓"}
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            {item.tag ? <span className={styles.tag}>{item.tag}</span> : null}
          </li>
        ))}
      </ol>

      <footer className={styles.foot}>
        {footerItems.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </footer>
    </div>
  );
}
