import Link from 'next/link';

/**
 * The free SEO review as a quiet second option under the audits, on /seo. The page's push is to
 * buy an audit, so this is one line linking to the booking on /contact, not the booking section itself.
 */
export function CallBookingNudge() {
  return (
    <section className="site-shell pb-section-half">
      <p className="m-0 border-t border-border-subtle pt-l text-body leading-relaxed text-text-muted">
        Not sure which audit you need?{' '}
        <Link
          className="font-heavy text-action-primary underline underline-offset-2"
          href="/contact#book-a-call"
        >
          Book a free 30-minute SEO review
        </Link>{' '}
        and we&apos;ll ring you with the three things holding your site back.
      </p>
    </section>
  );
}
