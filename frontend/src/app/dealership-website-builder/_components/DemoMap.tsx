import styles from "../_styles/preview.module.css";

type DemoMapProps = {
  ariaLabel: string;
  className?: string;
  actionLabel?: string;
  onClick?: () => void;
};

export function DemoMap({ ariaLabel, className = "", actionLabel, onClick }: DemoMapProps) {
  const drawing = (
    <>
      <svg className={styles.demoMapArtwork} viewBox="0 0 320 180" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-80 164 400 4" />
        <path d="M146-80 238 260" />
        <g className={styles.demoMapPin} transform="translate(188 75) scale(.58)">
          <path d="M0 0c-15 0-27 12-27 27 0 20 27 48 27 48s27-28 27-48C27 12 15 0 0 0Z" />
          <circle cx="0" cy="27" r="9" />
        </g>
      </svg>
      {actionLabel && <span className={styles.demoMapAction}>{actionLabel}</span>}
    </>
  );

  if (onClick)
    return (
      <button type="button" className={`${styles.demoMap} ${className}`} onClick={onClick} aria-label={ariaLabel}>
        {drawing}
      </button>
    );
  return (
    <div className={`${styles.demoMap} ${className}`} role="img" aria-label={ariaLabel}>
      {drawing}
    </div>
  );
}
