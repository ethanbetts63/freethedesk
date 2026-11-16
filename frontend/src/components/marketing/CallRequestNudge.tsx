import Link from 'next/link';

/**
 * A quiet second option under the packages on /seo and the pages built like it. The page's push is
 * to buy, so this is one line linking to the call-back form on /contact, not the form itself.
 */
export function CallRequestNudge({
  question = 'Not sure which audit you need?',
}: {
  question?: string;
}) {
  return (
    <section className="site-shell pb-section-half">
      <p className="m-0 border-t border-border-subtle pt-l text-body leading-relaxed text-text-muted">
        {question}{' '}
        <Link
          className="font-heavy text-action-primary underline underline-offset-2"
          href="/contact#call-back"
        >
          Get in touch
        </Link>{' '}
        and we&apos;ll get back to you.
      </p>
    </section>
  );
}
