import styles from "./StatusPanelVisual.module.css";

export type StatusPanelItem = {
  title: string;
  description?: string;
  tag: string;
};

type StatusPanelVisualProps = {
  eyebrow: string;
  title: string;
  countLabel: string;
  items: readonly StatusPanelItem[];
  ariaLabel?: string;
};

export function StatusPanelVisual({ eyebrow, title, countLabel, items, ariaLabel }: StatusPanelVisualProps) {
  return (
    <div className={styles.panel} aria-label={ariaLabel}>
      <header className={styles.head}>
        <div>
          <span className={styles.dot} aria-hidden="true" />
          <span>
            <small>{eyebrow}</small>
            <strong>{title}</strong>
          </span>
        </div>
        <span className={styles.count}>{countLabel}</span>
      </header>
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={item.title}>
            <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.check} aria-hidden="true">
              ✓
            </span>
            <span className={styles.copy}>
              <strong>{item.title}</strong>
              {item.description ? <small>{item.description}</small> : null}
            </span>
            <span className={styles.tag}>{item.tag}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
