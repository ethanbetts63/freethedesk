import { type CaseStudyKey } from '@/components/marketing/CaseStudyTeaser';
import { type PublicSiteSettings } from '@/lib/api';
import type { FaqItem } from '@/types/FaqItem';

import { seoAuditPrices, type SeoAuditPrices } from './plans';

/**
 * Every word on an SEO landing page. /seo and each industry page (owner, 2026-11-16) are the same
 * components in the same order; only this copy differs, so an industry page reads as /seo does
 * with its own trade's keywords.
 */
export interface SeoPageCopy {
  hero: { titleLines: readonly string[]; accentTitle: string; lead: string };
  /** `audience` ("tradies") titles the audit cards and the schema offers for the group. */
  packages: { title: string; lead: string; audience?: string };
  introduction: { title: string; accentTitle: string; body: string };
  analyse: { title: string; accentTitle: string; description: string };
  recommend: { title: string; accentTitle: string; description: string };
  experiment: { title: string; accentTitle: string; description: string };
  /** Half the pages stand on Scooter Shop, half on Bloomprint (owner, 2026-11-16). */
  caseStudy: { study: CaseStudyKey; title: string; body: string };
  faqTitle: string;
  /** Built per request so the cost answer quotes the prices the admin has set. */
  faqs: (prices: SeoAuditPrices) => FaqItem[];
  /** The call-back form's heading at the foot of the page, the page's own. */
  callTitle: string;
}

export function faqsFor(copy: SeoPageCopy, settings: PublicSiteSettings): FaqItem[] {
  return copy.faqs(seoAuditPrices(settings));
}
