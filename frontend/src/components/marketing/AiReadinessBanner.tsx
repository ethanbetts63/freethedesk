import { AiReadinessForm } from "./AiReadinessForm";
import styles from "./AiReadinessBanner.module.css";

/* Deliberately has no "use client": rendered from a server page it stays on the
   server, and only AiReadinessForm ships. The mobile dialog pulls it into the
   client bundle instead, which is why the markup lives here rather than in a
   server-only component the dialog could not import. */
export function AiReadinessBanner({
  className = "",
  titleId = "ai-readiness-banner-title",
}: {
  className?: string;
  titleId?: string;
}) {
  return (
    <section className={`${styles.banner} ${className}`} aria-labelledby={titleId}>
      <div className={`shell ${styles.inner}`}>
        <div className={styles.copy}>
          <h2 id={titleId}>
            Can AI systems <span className="moving-colour-text">read your site?</span>
          </h2>
        </div>
        <AiReadinessForm />
      </div>
    </section>
  );
}
