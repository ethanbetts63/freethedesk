import { GoogleLogo } from "@/components/GoogleLogo";
import { SectionNumber } from "@/components/SectionNumber";

import styles from "./GoogleBusinessProfileAudit.module.css";

const AUDIT_AREAS = [
  ["Business details", "Contact information, opening hours and attributes"],
  ["Categories", "Primary and supporting category fit"],
  ["Services", "Service groups, products and descriptions"],
  ["Reviews", "Request process and response quality"],
  ["Photos", "Logo, cover, premises, team and product imagery"],
  ["Customer actions", "Website, booking and social links"],
] as const;

export function GoogleBusinessProfileAudit({ eyebrow = "Your local search presence" }: { eyebrow?: string }) {
  return (
    <section className={styles.audit} aria-labelledby="gbp-audit-title" id="gbp-audit">
      <div className={`shell ${styles.auditInner}`}>
        <div className={styles.copy}>
          <div className={styles.googleLockup}>
            <span className={styles.googleMark}>
              <GoogleLogo size={31} />
            </span>
            <span>
              <small>One-time audit · available alone or with SEO</small>
              <strong>Google Business Profile</strong>
            </span>
          </div>

          <SectionNumber onDark>{eyebrow}</SectionNumber>
          <h3 id="gbp-audit-title">A one-time Google Business Profile audit.</h3>
          <p className={styles.intro}>
            We review the parts of your profile that influence local visibility, then send you a prioritised list of
            what to correct or improve. One audit, one action list, no recurring subscription.
          </p>
        </div>

        <div className={styles.preview} aria-label="Example Google Business Profile audit coverage">
          <header className={styles.previewHeader}>
            <div>
              <GoogleLogo size={24} />
              <span>
                <small>Profile audit</small>
                <strong>Your business</strong>
              </span>
            </div>
            <span className={styles.areaCount}>6 review areas</span>
          </header>

          <ol className={styles.auditList}>
            {AUDIT_AREAS.map(([title, description], index) => (
              <li key={title}>
                <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.check} aria-hidden="true">
                  ✓
                </span>
                <span className={styles.auditCopy}>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
                <span className={styles.reviewed}>Reviewed</span>
              </li>
            ))}
          </ol>

          <footer className={styles.previewFooter}>
            <span>
              <i aria-hidden="true" /> Delivered as
            </span>
            <strong>Prioritised action list</strong>
          </footer>
        </div>
      </div>
    </section>
  );
}
