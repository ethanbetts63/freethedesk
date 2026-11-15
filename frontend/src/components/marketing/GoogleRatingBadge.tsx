import Image from 'next/image';

import { GOOGLE_RATING } from '@/lib/contact';
import { cn } from '@/lib/utils';

/** A review star, in the site's warning gold: the colour people read as a rating. */
function Star() {
  return (
    <svg className="size-5 fill-fill-warning" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5l2.94 6.1 6.56.9-4.78 4.6 1.17 6.6L12 17.6l-5.89 3.1 1.17-6.6L2.5 9.5l6.56-.9L12 2.5z" />
    </svg>
  );
}

/**
 * The Google rating as a dark pill: the G, "5.0", five stars, "by our clients" and a link to the
 * reviews on Google Maps. Copied from otterair.com.au's hero (owner's choice, 2026-11-15), and,
 * like theirs, it shows no review count. The rating is typed in `GOOGLE_RATING`: it must be checked
 * whenever a review arrives, so it never claims more than Google shows.
 */
export function GoogleRatingBadge({ className }: { className?: string }) {
  return (
    <a
      href={GOOGLE_RATING.reviewsUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={`Rated ${GOOGLE_RATING.rating} on Google. Read the reviews on Google Maps.`}
      className={cn(
        'group inline-flex flex-nowrap items-center gap-xs rounded-full bg-surface-dark py-2xs pr-m pl-2xs no-underline shadow-l ring-1 ring-inset ring-white/15 transition hover:-translate-y-0.5',
        className,
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-page">
        {/* Google's "G" in Google's colours, kept as a file because it is their mark, not our palette. */}
        <Image src="/images/brand/google-g.svg" alt="" width={16} height={16} unoptimized />
      </span>
      <span className="text-lead font-heavy text-text-on-dark">{GOOGLE_RATING.rating}</span>
      <span className="flex gap-4xs">
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} />
        ))}
      </span>
      <span className="hidden text-body whitespace-nowrap text-text-on-dark-muted sm:inline">
        by our clients
      </span>
      <span className="text-body font-heavy whitespace-nowrap text-accent-on-dark-soft underline underline-offset-2">
        Read reviews
      </span>
    </a>
  );
}
