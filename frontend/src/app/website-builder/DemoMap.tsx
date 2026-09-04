import styles from "./page.module.css";

type DemoMapProps = {
  ariaLabel: string;
  className?: string;
  actionLabel?: string;
  onClick?: () => void;
};

export function DemoMap({ ariaLabel, className = "", actionLabel, onClick }: DemoMapProps) {
  const drawing = <><i className={styles.demoMapRoadOne} /><i className={styles.demoMapRoadTwo} /><b className={styles.demoMapPin}><i /></b>{actionLabel && <span className={styles.demoMapAction}>{actionLabel}</span>}</>;

  if (onClick) return <button type="button" className={`${styles.demoMap} ${className}`} onClick={onClick} aria-label={ariaLabel}>{drawing}</button>;
  return <div className={`${styles.demoMap} ${className}`} role="img" aria-label={ariaLabel}>{drawing}</div>;
}
