import { Wordmark } from '@/components/Wordmark';
import { cn } from '@/lib/utils';

import { BUSINESS, HIGHLIGHTS } from '../_lib/report';
import { display } from './ReportPrimitives';
import { DesktopMock, PhoneMock } from './SiteMock';

/**
 * Page one of the PDF: white paper on a faint grid, heavy black type over a
 * blue second line, the site in a browser frame with the phone over its
 * corner, the four readings under a black rule, and the credit at the foot.
 */
export function ReportCover() {
  return (
    <header className="relative overflow-hidden bg-surface-page [background-image:linear-gradient(var(--tint-grid)_1px,transparent_1px),linear-gradient(90deg,var(--tint-grid)_1px,transparent_1px)] [background-size:34px_34px]">
      <div className={cn(display, 'site-shell')}>
        <div className="mx-auto max-w-4xl pt-2xl pb-xl">
          <div className="flex flex-wrap items-center justify-between gap-m">
            {/* The page's h1 says what it is; the cover's big title is the sample's own. */}
            <h1 className="m-0 inline-flex items-center gap-xs text-caption font-strong tracking-label-eyebrow text-action-primary uppercase">
              <span
                aria-hidden="true"
                className="size-2xs rounded-circle bg-action-primary shadow-halo"
              />
              Sample SEO report
            </h1>
            <span className="text-body-sm font-strong text-text-secondary">{BUSINESS.host}</span>
          </div>

          <p className="m-0 mt-2xl text-hero leading-none font-black tracking-tighter text-text-primary">
            {BUSINESS.name}
            <span className="block text-action-primary">search report.</span>
          </p>
          <p className="m-0 mt-ml max-w-copy text-lead leading-normal text-text-muted">
            How people found and used {BUSINESS.host} in search,{' '}
            <strong className="font-semibold text-text-secondary">{BUSINESS.period}</strong>.
          </p>

          <div className="relative mt-xl mb-2xl sm:mb-3xl">
            <figure className="m-0 overflow-hidden rounded-md border border-border-default bg-surface-page shadow-block-m">
              <div className="flex h-l items-center gap-3xs border-b border-border-default bg-surface-muted px-xs">
                <i className="size-xs rounded-circle bg-fill-danger" />
                <i className="size-xs rounded-circle bg-fill-warning" />
                <i className="size-xs rounded-circle bg-fill-success" />
                <span className="mx-auto rounded-xs border border-border-default bg-surface-page px-m py-4xs text-caption text-text-subtle">
                  {BUSINESS.host}
                </span>
              </div>
              <DesktopMock />
              <figcaption className="sr-only">
                The invented business’s homepage on a desktop, and the same page on a phone.
              </figcaption>
            </figure>
            <div className="absolute right-s -bottom-xl w-1/4 min-w-20 sm:right-l sm:-bottom-2xl">
              <PhoneMock />
            </div>
          </div>

          <dl className="m-0 grid grid-cols-2 gap-x-m border-t-2 border-text-primary sm:grid-cols-4">
            {HIGHLIGHTS.map((reading) => (
              <div key={reading.label} className="flex flex-col pt-s pb-xs">
                <dt className="order-last mt-xs text-caption font-strong tracking-label-wide text-action-primary uppercase">
                  {reading.label}
                </dt>
                <dd className="m-0 flex flex-wrap items-baseline gap-x-2xs text-title leading-none font-black tracking-tighter text-text-primary tabular-nums">
                  {reading.value}
                  {reading.unit && (
                    <span className="text-body-sm font-strong tracking-normal text-text-muted">
                      {reading.unit}
                    </span>
                  )}
                  <span className="text-caption font-strong tracking-label text-text-subtle uppercase">
                    {reading.direction}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-l flex items-center justify-between gap-m border-t border-border-subtle pt-s">
            <span className="text-caption font-strong tracking-label-wide text-text-subtle uppercase">
              Report written by
            </span>
            <Wordmark size="mini" className="text-body" />
          </div>
        </div>
      </div>
    </header>
  );
}
