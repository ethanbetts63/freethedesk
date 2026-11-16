import Image from 'next/image';

import { pagePicture } from '@/lib/relatedPages';
import { cn } from '@/lib/utils';

import { CallRequestForm } from './CallRequestForm';
import { GoogleRatingBadge } from './GoogleRatingBadge';

const DEFAULT_PICTURE = '/images/guides/business-not-showing-up-on-google.webp';

/**
 * The call-back form, under a heading of the page's own ("Ready to be found?" on the homepage): a
 * picture, with the Google rating under it, on the left and the form on the right, in a rounded
 * tinted panel (after the "value of the badge" block on Google's partner page). Stacked below
 * `lg`, picture first. It replaced the project enquiry form everywhere on 2026-11-15, and each
 * page's closing call-to-action panel on 2026-11-16. The picture is the page's own related-card
 * illustration where it has one, so it never repeats a card in the related block beneath it.
 * `source` records which page a request came from.
 */
export function CallRequest({
  id = 'call-back',
  source,
  title,
}: {
  id?: string;
  source: string;
  title: string;
}) {
  return (
    <section
      className={cn(
        'site-shell py-section',
        // The related block after it pads its own top; this padding as well doubles the gap.
        '[&:has(+nav[aria-labelledby=related-pages-title])]:pb-0',
      )}
      id={id}
      aria-labelledby={`${id}-title`}
    >
      {/* eslint-disable-next-line no-restricted-syntax -- the panel's large radius is the point of this layout; no radius token is this big */}
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-xl rounded-[2rem] bg-surface-tint p-l sm:p-2xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-3xl">
        <div className="grid justify-items-center gap-m">
          {/* eslint-disable-next-line no-restricted-syntax -- as above, one step inside the panel's */}
          <div className="w-full overflow-hidden rounded-[1.5rem] border border-border-default bg-surface-page">
            <Image
              src={pagePicture(source) ?? DEFAULT_PICTURE}
              alt=""
              width={1536}
              height={1024}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="aspect-[3/2] h-auto w-full object-cover"
            />
          </div>
          <GoogleRatingBadge />
        </div>
        <div>
          <h2
            id={`${id}-title`}
            className="m-0 mb-xl text-display leading-[1.02] tracking-[-0.058em] text-text-secondary"
          >
            {title}
          </h2>
          <CallRequestForm source={source} />
        </div>
      </div>
    </section>
  );
}
