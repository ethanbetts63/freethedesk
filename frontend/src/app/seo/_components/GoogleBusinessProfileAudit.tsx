import { GoogleLogo } from "@/components/GoogleLogo";
import { PrimaryButton } from "@/components/PrimaryButton";
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

export function GoogleBusinessProfileAudit({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  return (
    <section className={styles.audit} aria-labelledby="gbp-audit-title">
      <div className={`shell ${styles.auditInner}`}>
        <div className={styles.copy}>
          <div className={styles.googleLockup}>
            <span className={styles.googleMark}>
              <GoogleLogo size={31} />
            </span>
            <span>
              <small>Available alone or with SEO</small>
              <strong>Google Business Profile</strong>
            </span>
          </div>

          <SectionNumber onDark>Your local search presence</SectionNumber>
          <h3 id="gbp-audit-title">Google Business Profile audit</h3>
          <p className={styles.intro}>
            Google says local results are shaped mainly by relevance, distance and prominence. You cannot change where
            your business is, but you can make the profile clearer, more complete and more useful when a nearby customer
            finds it.
          </p>

          <div className={styles.actions}>
            {/* This block sits above the signup panel, so an on-page target is below it. */}
            <PrimaryButton href={ctaHref} direction={ctaHref.startsWith("#") ? "down" : "page"}>
              {ctaLabel}
            </PrimaryButton>
          </div>
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
