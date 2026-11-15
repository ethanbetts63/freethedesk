import Link from 'next/link';

/**
 * A quiet second option under the audits on /seo. The page's push is to buy an audit, so this is
 * one line linking to the call-back form on /contact, not the form itself.
 */
export function CallRequestNudge() {
  return (
    <section className="site-shell pb-section-half">
      <p className="m-0 border-t border-border-subtle pt-l text-body leading-relaxed text-text-muted">
        Not sure which audit you need?{' '}
        <Link
          className="font-heavy text-action-primary underline underline-offset-2"
          href="/contact#call-back"
        >
          Leave your number
        </Link>{' '}
        and we&apos;ll ring you back.
      </p>
    </section>
  );
}
