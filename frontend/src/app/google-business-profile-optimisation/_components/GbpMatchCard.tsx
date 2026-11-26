import { BUSINESS } from '@/app/seo/sample-report/_lib/report';

/**
 * The profile and the website checked side by side, for the sample report's invented plumber. A
 * service-area business, so no street address: the suburbs it travels to stand in for one.
 */
const DETAILS = [
  { label: 'Name', value: BUSINESS.fullName },
  { label: 'Phone', value: BUSINESS.phone },
  { label: 'Service area', value: 'Perth northern suburbs' },
  { label: 'Hours', value: 'Mon to Fri, 7am to 5pm' },
  { label: 'Booking button', value: '/book' },
  { label: 'Website link', value: 'Tagged, counted in analytics' },
] as const;

const labelClassName = 'font-heavy text-text-primary';

/** The /seo page's experiment card, drawn as the check that the profile and the site agree. */
export function GbpMatchCard() {
  return (
    <article
      className="border border-border-strong bg-surface-page p-l text-body-sm leading-relaxed text-text-secondary shadow-block-s sm:p-xl sm:shadow-block-l"
      aria-labelledby="gbp-match-card-title"
    >
      <header className="mb-m flex flex-wrap items-center justify-between gap-s">
        {/* A paragraph, not a heading: the card is an example, not a section of the page. */}
        <p
          id="gbp-match-card-title"
          className="m-0 text-lead leading-snug font-heavy tracking-[-0.02em] text-text-primary"
        >
          {BUSINESS.name}: profile and website
        </p>
        <span className="border border-border-success bg-surface-success px-xs py-3xs text-caption font-heavy text-text-success">
          All match
        </span>
      </header>

      <dl className="m-0 border-t border-border-subtle">
        {DETAILS.map(({ label, value }) => (
          <div
            key={label}
            className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] items-center gap-s border-b border-border-subtle py-s"
          >
            <dt className={labelClassName}>{label}</dt>
            <dd className="m-0">{value}</dd>
            <span className="text-text-success" aria-label="Matches on both">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                <path
                  d="m5 12.5 4.5 4.5L19 7.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        ))}
      </dl>

      <p className="mt-m mb-0">
        <strong className={labelClassName}>Why.</strong> When the two agree, Google can tell they
        are the same business, and every visit the profile sends shows in your analytics.
      </p>
    </article>
  );
}
