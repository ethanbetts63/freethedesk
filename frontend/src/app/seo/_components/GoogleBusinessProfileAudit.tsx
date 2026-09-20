import { GoogleLogo } from '@/components/GoogleLogo';
import { ChecklistCard } from '@/components/visuals/ChecklistCard';
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
      <div className="site-shell relative z-1 grid grid-cols-1 gap-split lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div>
          <div className="mb-2xl flex items-center gap-s sm:mb-3xl">
            <span className="flex h-[46px] w-[46px] items-center justify-center rounded-circle bg-surface-page">
              <GoogleLogo size={31} />
            </span>
            <span>
              <small className="mb-3xs block text-label font-black tracking-label-tight text-accent uppercase">
                One-time audit · available alone or with SEO
              </small>
              <strong className="block text-body-sm">Google Business Profile</strong>
            </span>
          </div>

          <SectionNumber onDark>{eyebrow}</SectionNumber>
          <h3
            id="gbp-audit-title"
            className="m-0 max-w-[680px] text-display leading-[0.98] tracking-[-0.06em] lg:max-w-[520px]"
          >
            A one-time Google Business Profile audit.
          </h3>
          <p className="mt-xl mb-m max-w-[680px] text-lead leading-[1.72] text-text-on-dark-muted lg:max-w-[570px]">
            We review the parts of your profile that influence local visibility, then send you a
            prioritised list of what to correct or improve. One audit, one action list, no recurring
            subscription.
          </p>
        </div>

        <ChecklistCard
          layout="framed"
          className="shadow-contrast-l"
          mark={<GoogleLogo size={24} />}
          eyebrow="Profile audit"
          title="Your business"
          countLabel={`${AUDIT_AREAS.length} review areas`}
          items={AUDIT_AREAS.map(([title, description]) => ({
            title,
            description,
            tag: 'Reviewed',
          }))}
          ariaLabel="Example Google Business Profile audit coverage"
          footer={
            <footer className="moving-colour-fill flex flex-col items-start justify-between gap-xs px-ml py-m sm:flex-row sm:items-center sm:gap-0">
              <span className="flex items-center gap-2xs text-label font-heavy text-[color-mix(in_srgb,var(--surface-page)_82%,transparent)] uppercase">
                <i aria-hidden="true" className="h-[6px] w-[6px] rounded-circle bg-surface-page" />{' '}
                Delivered as
              </span>
              <strong className="text-caption text-text-on-dark">Prioritised action list</strong>
            </footer>
          }
        />
      </div>
    </section>
  );
}
