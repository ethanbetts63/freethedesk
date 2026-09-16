import { GoogleLogo } from '@/components/GoogleLogo';
import { SectionNumber } from '@/components/SectionNumber';

import styles from './GoogleBusinessProfileAudit.module.css';

const AUDIT_AREAS = [
  ['Business details', 'Contact information, opening hours and attributes'],
  ['Categories', 'Primary and supporting category fit'],
  ['Services', 'Service groups, products and descriptions'],
  ['Reviews', 'Request process and response quality'],
  ['Photos', 'Logo, cover, premises, team and product imagery'],
  ['Customer actions', 'Website, booking and social links'],
] as const;

export function GoogleBusinessProfileAudit({
  eyebrow = 'Your local search presence',
}: {
  eyebrow?: string;
}) {
  return (
    <section
      className="relative mt-section overflow-hidden bg-surface-dark py-section text-text-on-dark before:absolute before:inset-0 before:content-[''] before:[background-image:linear-gradient(color-mix(in_srgb,var(--blue-400)_4.5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--blue-400)_4.5%,transparent)_1px,transparent_1px)] before:[background-size:42px_42px] before:[mask-image:linear-gradient(90deg,var(--text-primary),transparent_82%)]"
      aria-labelledby="gbp-audit-title"
      id="gbp-audit"
    >
      <div className="shell relative z-1 grid grid-cols-1 gap-[clamp(45px,7vw,90px)] min-[900px]:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div>
          <div className="mb-2xl flex items-center gap-s sm:mb-[clamp(48px,6vw,78px)]">
            <span className="flex h-[46px] w-[46px] items-center justify-center rounded-circle bg-surface-page">
              <GoogleLogo size={31} />
            </span>
            <span>
              <small className="mb-3xs block text-label font-black tracking-[0.09em] text-accent uppercase">
                One-time audit · available alone or with SEO
              </small>
              <strong className="block text-small">Google Business Profile</strong>
            </span>
          </div>

          <SectionNumber onDark>{eyebrow}</SectionNumber>
          <h3
            id="gbp-audit-title"
            className="m-0 max-w-[680px] text-display-3 leading-[0.98] tracking-[-0.06em] min-[900px]:max-w-[520px]"
          >
            A one-time Google Business Profile audit.
          </h3>
          <p className="mt-xl mb-m max-w-[680px] text-lead leading-[1.72] text-text-on-dark-muted min-[900px]:max-w-[570px]">
            We review the parts of your profile that influence local visibility, then send you a
            prioritised list of what to correct or improve. One audit, one action list, no recurring
            subscription.
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
                <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
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
