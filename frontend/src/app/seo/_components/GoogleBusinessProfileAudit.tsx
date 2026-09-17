import { GoogleLogo } from '@/components/GoogleLogo';
import { SectionNumber } from '@/components/SectionNumber';

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
      <div className="site-shell relative z-1 grid grid-cols-1 gap-[clamp(45px,7vw,90px)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div>
          <div className="mb-2xl flex items-center gap-s sm:mb-[clamp(48px,6vw,78px)]">
            <span className="flex h-[46px] w-[46px] items-center justify-center rounded-circle bg-surface-page">
              <GoogleLogo size={31} />
            </span>
            <span>
              <small className="mb-3xs block text-label font-black tracking-label-tight text-accent uppercase">
                One-time audit · available alone or with SEO
              </small>
              <strong className="block text-small">Google Business Profile</strong>
            </span>
          </div>

          <SectionNumber onDark>{eyebrow}</SectionNumber>
          <h3
            id="gbp-audit-title"
            className="m-0 max-w-[680px] text-display-3 leading-[0.98] tracking-[-0.06em] lg:max-w-[520px]"
          >
            A one-time Google Business Profile audit.
          </h3>
          <p className="mt-xl mb-m max-w-[680px] text-lead leading-[1.72] text-text-on-dark-muted lg:max-w-[570px]">
            We review the parts of your profile that influence local visibility, then send you a
            prioritised list of what to correct or improve. One audit, one action list, no recurring
            subscription.
          </p>
        </div>

        {/* The audit card. Only the animated gradient border, the gradient
            text and the gradient footer come from CSS; everything else is
            ordinary layout. */}
        <div
          className="moving-colour-border mx-auto w-full max-w-[660px] self-center text-text-primary shadow-contrast-l lg:mx-0 lg:max-w-none lg:w-auto"
          aria-label="Example Google Business Profile audit coverage"
        >
          <header className="flex items-start justify-between gap-s border-b border-border-default bg-surface-tint px-ml py-m sm:items-center sm:gap-0">
            <div className="flex items-center gap-xs">
              <GoogleLogo size={24} />
              <span>
                <small className="mb-4xs block text-nano font-black tracking-label text-text-subtle uppercase">
                  Profile audit
                </small>
                <strong className="block text-ui">Your business</strong>
              </span>
            </div>
            <span className="moving-colour-text text-label font-black uppercase">
              6 review areas
            </span>
          </header>

          <ol className="m-0 list-none px-ml py-0">
            {AUDIT_AREAS.map(([title, description], index) => (
              <li
                key={title}
                className="grid grid-cols-[22px_27px_minmax(0,1fr)] items-center gap-s border-b border-border-subtle py-m sm:grid-cols-[24px_27px_minmax(0,1fr)_auto]"
              >
                <span className="text-label font-black text-text-on-dark-subtle">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className="flex h-[27px] w-[27px] items-center justify-center rounded-[var(--radius-circle)] bg-surface-tint-strong text-meta font-black text-text-action"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span>
                  <strong className="mb-4xs block text-ui">{title}</strong>
                  <small className="block text-label leading-[1.4] text-text-subtle">
                    {description}
                  </small>
                </span>
                {/* Cut on a phone: the row is already three columns wide and
                    the tick has said this. */}
                <span className="hidden text-tiny font-black tracking-label-tight text-text-muted uppercase sm:block">
                  Reviewed
                </span>
              </li>
            ))}
          </ol>

          <footer className="moving-colour-fill flex flex-col items-start justify-between gap-xs px-ml py-m sm:flex-row sm:items-center sm:gap-0">
            <span className="flex items-center gap-2xs text-label font-heavy text-[color-mix(in_srgb,var(--surface-page)_82%,transparent)] uppercase">
              <i
                aria-hidden="true"
                className="h-[6px] w-[6px] rounded-[var(--radius-circle)] bg-surface-page"
              />{' '}
              Delivered as
            </span>
            <strong className="text-caption text-text-on-dark">Prioritised action list</strong>
          </footer>
        </div>
      </div>
    </section>
  );
}
