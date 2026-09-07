import Link from "next/link";

import { GoogleLogo } from "@/components/GoogleLogo";

import styles from "./GoogleBusinessProfileAudit.module.css";

const AUDIT_AREAS = [
  ["Business details", "Contact information, opening hours and attributes"],
  ["Categories", "Primary and supporting category fit"],
  ["Services", "Service groups, products and descriptions"],
  ["Reviews", "Request process and response quality"],
  ["Photos", "Logo, cover, premises, team and product imagery"],
  ["Customer actions", "Website, booking and social links"],
] as const;

export function GoogleBusinessProfileAudit({ standalonePrice }: { standalonePrice: string }) {
  return (
    <section className={styles.audit} aria-labelledby="gbp-audit-title">
      <div className={styles.copy}>
        <div className={styles.googleLockup}>
          <span className={styles.googleMark}><GoogleLogo size={31} /></span>
          <span><small>Included with every SEO report</small><strong>Google Business Profile</strong></span>
        </div>

        <p className={styles.eyebrow}>Your local search presence</p>
        <h3 id="gbp-audit-title">Google Business Profile audit</h3>
        <p className={styles.intro}>
          Google says local results are shaped mainly by relevance, distance and prominence.
          You cannot change where your business is, but you can make the profile clearer,
          more complete and more useful when a nearby customer finds it.
        </p>
        <p className={styles.deliverable}>
          We return a prioritised action list—not a vague score. Every issue shows what we
          found, what we would change and the exact information or asset needed.
        </p>

        <div className={styles.offer}>
          <span><strong>Included free</strong><small>with every report plan</small></span>
          <i aria-hidden="true" />
          <span><strong>{standalonePrice}</strong><small>as a one-off audit</small></span>
        </div>

        <div className={styles.actions}>
          <Link href="/contact">Request an audit <span aria-hidden="true">→</span></Link>
          <a href="https://support.google.com/business/answer/7091?hl=en" target="_blank" rel="noopener noreferrer">
            Google&apos;s published guidance ↗
          </a>
        </div>
      </div>

      <div className={styles.preview} aria-label="Example Google Business Profile audit coverage">
        <header className={styles.previewHeader}>
          <div><GoogleLogo size={24} /><span><small>Profile audit</small><strong>Your business</strong></span></div>
          <span className={styles.areaCount}>6 review areas</span>
        </header>

        <ol className={styles.auditList}>
          {AUDIT_AREAS.map(([title, description], index) => (
            <li key={title}>
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.check} aria-hidden="true">✓</span>
              <span className={styles.auditCopy}><strong>{title}</strong><small>{description}</small></span>
              <span className={styles.reviewed}>Reviewed</span>
            </li>
          ))}
        </ol>

        <footer className={styles.previewFooter}>
          <span><i aria-hidden="true" /> Delivered as</span>
          <strong>Prioritised action list</strong>
        </footer>
      </div>
    </section>
  );
}
