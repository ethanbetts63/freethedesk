import Image from 'next/image';

import { CallRequestForm } from './CallRequestForm';

/**
 * "Get in touch": one of the guides' pictures on the left and the call-back form on the right, in
 * a rounded tinted panel (after the "value of the badge" block on Google's partner page). Stacked
 * below `lg`, picture first. It replaced the project enquiry form everywhere on 2026-11-15.
 * `source` records which page a request came from.
 */
export function CallRequest({ id = 'call-back', source }: { id?: string; source: string }) {
  return (
    <section className="site-shell py-section" id={id} aria-labelledby={`${id}-title`}>
      {/* eslint-disable-next-line no-restricted-syntax -- the panel's large radius is the point of this layout; no radius token is this big */}
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-xl rounded-[2rem] bg-surface-tint p-l sm:p-2xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-3xl">
        {/* eslint-disable-next-line no-restricted-syntax -- as above, one step inside the panel's */}
        <div className="overflow-hidden rounded-[1.5rem] border border-border-default bg-surface-page">
          <Image
            src="/images/guides/how-to-show-up-in-ai-search.webp"
            alt=""
            width={1536}
            height={1024}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="aspect-[3/2] h-auto w-full object-cover"
          />
        </div>
        <div>
          <h2
            id={`${id}-title`}
            className="m-0 mb-xl text-display leading-[1.02] tracking-[-0.058em] text-text-secondary"
          >
            Get in touch.
          </h2>
          <CallRequestForm source={source} />
        </div>
      </div>
    </section>
  );
}
