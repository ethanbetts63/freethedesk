import { GoogleLogo } from '@/components/GoogleLogo';
import { ChecklistCard } from '@/components/visuals/ChecklistCard';
import { SectionNumber } from '@/components/SectionNumber';

/** The sources a cycle reads, as a customer would name them. */
const ACCESS = [
  [
    'Google Search Console',
    'Searches, clicks, the pages Google has and has not added, and AI results',
  ],
  ['Google Business Profile', 'Searches, calls, directions and the details customers see'],
  ['Website analytics', 'What visitors do after they land, from GA4, Clarity or your host'],
  ['Your enquiries', 'How many came in, so changes are judged by what they earn'],
  ['A short brief', 'What you sell, the suburbs you serve and who you compete with'],
] as const;

export function SeoAccess({ eyebrow }: { eyebrow: string }) {
  return (
    <section
      className="relative mt-section overflow-hidden bg-surface-dark py-section text-text-on-dark before:absolute before:inset-0 before:content-[''] before:[background-image:linear-gradient(var(--tint-grid-on-dark)_1px,transparent_1px),linear-gradient(90deg,var(--tint-grid-on-dark)_1px,transparent_1px)] before:[background-size:42px_42px] before:[mask-image:linear-gradient(90deg,var(--text-primary),transparent_82%)]"
      aria-labelledby="seo-access-title"
      id="access"
    >
      <div className="site-shell relative z-1 grid grid-cols-1 gap-split lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div>
          <div className="mb-2xl flex items-center gap-s sm:mb-3xl">
            <span className="flex h-[46px] w-[46px] items-center justify-center rounded-circle bg-surface-page">
              <GoogleLogo size={31} />
            </span>
            <span>
              <small className="mb-3xs block text-label font-black tracking-label-tight text-accent uppercase">
                Read-only · nothing installed
              </small>
              <strong className="block text-body-sm">What we need from you</strong>
            </span>
          </div>

          <SectionNumber onDark>{eyebrow}</SectionNumber>
          <h3
            id="seo-access-title"
            className="m-0 max-w-[680px] text-display leading-[0.98] tracking-[-0.06em] lg:max-w-[520px]"
          >
            Five things, connected once.
          </h3>
          <p className="mt-xl mb-m max-w-[680px] text-lead leading-relaxed text-text-on-dark-muted lg:max-w-[570px]">
            After payment you connect your data and fill in a short brief. We read; we never change
            your site, your profile or your ads. Anything you can&apos;t share just narrows what the
            findings can say, and they say so.
          </p>
        </div>

        <ChecklistCard
          layout="framed"
          className="shadow-contrast-l"
          mark={<GoogleLogo size={24} />}
          eyebrow="Onboarding"
          title="Your business"
          countLabel={`${ACCESS.length} sources`}
          items={ACCESS.map(([title, description]) => ({
            title,
            description,
            tag: 'Read',
          }))}
          ariaLabel="The data an SEO subscription reads"
          footer={
            <footer className="moving-colour-fill flex flex-col items-start justify-between gap-xs px-ml py-m sm:flex-row sm:items-center sm:gap-0">
              <span className="flex items-center gap-2xs text-label font-heavy text-[color-mix(in_srgb,var(--surface-page)_82%,transparent)] uppercase">
                <i
                  aria-hidden="true"
                  className="h-[var(--size-dot)] w-[var(--size-dot)] rounded-circle bg-surface-page"
                />{' '}
                Access level
              </span>
              <strong className="text-caption text-text-on-dark">Read-only</strong>
            </footer>
          }
        />
      </div>
    </section>
  );
}
