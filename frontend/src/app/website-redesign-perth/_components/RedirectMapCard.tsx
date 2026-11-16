/**
 * Scooter Shop's move to its new site, as a redirect map: four of the old site's addresses and the
 * pages they lead to now. The rows and the count are the site's own, from
 * allbikes/frontend/src/lib/legacyRedirects.ts (64 old addresses, each listed with and without its
 * trailing slash; old pages with no replacement answer 410 in its proxy.ts) - if this card is ever refreshed, take them from there rather than inventing rows.
 */
const ROWS = [
  ['/showroom/new-scooters/mopeds/', '/50cc-scooters-perth'],
  ['/blog/latest-news-and-updates/scooter-reviews/piaggio-zip-50-review/', '/50cc-scooters-perth'],
  ['/showroom/new-scooters/', '/inventory/scooters/new'],
  ['/view-all/', '/inventory/scooters/new'],
] as const;

const OLD_ADDRESSES = 64;

const labelClassName = 'font-heavy text-text-primary';

export function RedirectMapCard() {
  return (
    <article
      className="border border-border-strong bg-surface-page p-l text-body-sm leading-relaxed text-text-secondary shadow-block-s sm:p-xl sm:shadow-block-l"
      aria-labelledby="redirect-map-card-title"
    >
      <header className="mb-m flex flex-wrap items-center justify-between gap-s">
        {/* A paragraph, not a heading: the card is an example, not a section of the page. */}
        <p
          id="redirect-map-card-title"
          className="m-0 text-lead leading-snug font-heavy tracking-[-0.02em] text-text-primary"
        >
          Scooter Shop&apos;s old addresses, redirected
        </p>
        <span className="rounded-full bg-surface-tint px-s py-3xs text-caption font-heavy text-text-action">
          Permanent
        </span>
      </header>

      <p className="m-0">
        <strong className={labelClassName}>What.</strong> {OLD_ADDRESSES} of the old site&apos;s
        addresses were each given a permanent redirect to the page that replaced them.
      </p>
      <p className="mt-s mb-0">
        <strong className={labelClassName}>Why.</strong> A redirect carries the old page&apos;s
        standing to the new one. An address that simply disappears takes its searches with it.
      </p>

      <figure className="m-0 mt-l">
        <figcaption>
          <strong className="block text-body-sm font-heavy text-text-primary">
            Four of the {OLD_ADDRESSES} old addresses
          </strong>
          <span className="mt-3xs block text-caption text-text-muted">
            The old address, and the page on the new site it now leads to.
          </span>
        </figcaption>
        <ul className="m-0 mt-s list-none divide-y divide-border-subtle border-y border-border-subtle p-0">
          {ROWS.map(([from, to]) => (
            <li
              key={from}
              className="grid grid-cols-1 gap-3xs py-s sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,0.8fr)] sm:items-center sm:gap-s"
            >
              <span className="text-caption break-all text-text-muted">{from}</span>
              <span aria-hidden="true" className="hidden font-heavy text-action-primary sm:block">
                →
              </span>
              <span className="text-caption font-heavy break-all text-text-primary">
                <span className="sr-only">leads to </span>
                <span aria-hidden="true" className="text-action-primary sm:hidden">
                  ↳{' '}
                </span>
                {to}
              </span>
            </li>
          ))}
        </ul>
      </figure>

      <p className="mt-m mb-0">
        <strong className={labelClassName}>The rest.</strong> An old page with nothing to replace it
        answers that it is gone for good, so Google drops it instead of reporting an error.
      </p>
    </article>
  );
}
