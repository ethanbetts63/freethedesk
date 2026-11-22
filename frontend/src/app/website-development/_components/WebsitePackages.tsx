'use client';

import { PackagesSection } from '@/components/marketing/Packages';
import { trackSelectPlanOnce } from '@/lib/analytics';
import { scrollToId } from '@/lib/scrollToId';

import type { WebsitePackageCode } from '@/lib/servicePricing';

import { WEBSITE_PLANS } from '../_lib/packages';
import type { WebsitePageCopy } from '../_lib/pageCopy';

const CALL_FORM_ID = 'page-cta';

/**
 * The three website packages. Nobody buys a website without talking first, so a card's button
 * leads to the call-back form rather than a checkout (owner, 2026-11-21), and says which package
 * was chosen in the form's note unless the visitor has already written one.
 */
export function WebsitePackages({ copy }: { copy: WebsitePageCopy['packages'] }) {
  const bookCall = (code: WebsitePackageCode) => {
    trackSelectPlanOnce('website', code);
    const plan = WEBSITE_PLANS.find((item) => item.code === code);
    const notes = document.querySelector<HTMLTextAreaElement>(`#${CALL_FORM_ID} [name="notes"]`);
    if (plan && notes && !notes.value) notes.value = `Interested in the ${plan.name} package.`;
    scrollToId(CALL_FORM_ID);
  };

  return (
    <PackagesSection
      id="packages"
      endId="packages-end"
      eyebrow={copy.eyebrow}
      title={copy.title}
      accentTitle={copy.accentTitle}
      lead={copy.lead}
      wideHeader
      plans={WEBSITE_PLANS}
      kicker="Includes"
      chooseLabel={() => 'Book a call'}
      onChoose={bookCall}
    />
  );
}
