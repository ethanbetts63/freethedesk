'use client';

import Link from 'next/link';

import { PackagesSection } from '@/components/marketing/Packages';
import { trackSelectPlanOnce } from '@/lib/analytics';
import { scrollToId } from '@/lib/scrollToId';

import { GBP_PLAN, GBP_PRODUCT_NAME } from '../_lib/plan';

/** Where the card's button lands: the enquiry form at the foot of the page. */
export const GBP_ENQUIRY_ID = 'enquire';

/**
 * The one card, laid out as the SEO audits are. It is sold by enquiry until it has terms and a
 * checkout of its own (_docs/to_do.md), so the button scrolls to the form instead of opening an
 * order dialog.
 */
export function GbpPackage() {
  const choose = () => {
    trackSelectPlanOnce('seo', GBP_PLAN.code);
    scrollToId(GBP_ENQUIRY_ID);
  };

  return (
    <PackagesSection
      id="package"
      endId="package-end"
      eyebrow="Price"
      title="Business Profile optimisation"
      accentTitle="and price."
      lead="One job, done in your profile by us, paid once."
      plans={[GBP_PLAN]}
      kicker="Includes"
      cardTitle={() => GBP_PRODUCT_NAME}
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
      onChoose={choose}
    >
      {null}
    </PackagesSection>
  );
}
