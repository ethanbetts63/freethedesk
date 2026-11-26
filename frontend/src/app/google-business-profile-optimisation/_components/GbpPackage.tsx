'use client';

import Link from 'next/link';

import { PackagesSection } from '@/components/marketing/Packages';
import { trackSelectPlanOnce } from '@/lib/analytics';
import type { Plan } from '@/lib/plans';
import { scrollToId } from '@/lib/scrollToId';

import type { GBP_COPY } from '../_lib/copy';
import { GBP_PRODUCT_NAME, type GbpPlanCode } from '../_lib/plan';

/** The call-back form at the foot of the page. */
export const GBP_CALL_FORM_ID = 'page-cta';

/**
 * The one card, laid out as the website packages are. It has no terms or checkout of its own yet
 * (_docs/to_do.md), so the button leads to the call-back form and names the job in its note,
 * unless the visitor has already written one.
 */
export function GbpPackage({
  plan,
  copy,
}: {
  plan: Plan<GbpPlanCode>;
  copy: (typeof GBP_COPY)['packages'];
}) {
  const bookCall = () => {
    trackSelectPlanOnce('seo', plan.code);
    const notes = document.querySelector<HTMLTextAreaElement>(
      `#${GBP_CALL_FORM_ID} [name="notes"]`,
    );
    if (notes && !notes.value) notes.value = `Interested in ${GBP_PRODUCT_NAME}.`;
    scrollToId(GBP_CALL_FORM_ID);
  };

  return (
    <PackagesSection
      id="package"
      endId="package-end"
      eyebrow={copy.eyebrow}
      title={copy.title}
      accentTitle={copy.accentTitle}
      plans={[plan]}
      picture="/images/guides/small-business-seo-perth.webp"
      kicker="Includes"
      cardTitle={() => GBP_PRODUCT_NAME}
      chooseLabel={() => 'Book a call'}
      note={
        <>
          Not sure the profile is what&rsquo;s holding you back? The Plus SEO audit reads it beside
          your website and Search Console.{' '}
          <Link
            className="text-text-action underline underline-offset-[3px] hover:opacity-70"
            href="/seo#signup"
          >
            Compare the SEO audits
          </Link>
        </>
      }
      onChoose={bookCall}
    />
  );
}
