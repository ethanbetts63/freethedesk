import type { ServicePrices } from '@/lib/servicePricing';
import type { FaqItem } from '@/types/FaqItem';

/** One of the three numbered sections under the introduction: words on one side, a picture on the other. */
export interface WebsiteSectionCopy {
  id: string;
  /** The numbered eyebrow, carrying the page's search terms: "Website design" reads "01 / Website design". */
  label: string;
  title: string;
  accentTitle: string;
  description: string;
  /** The picture beside the words, a path under `public/`, in the guide illustrations' style. */
  picture: string;
  /** The link under the words, as /seo's sections link its sample report. */
  link: { label: string; href: string; newTab?: boolean };
}

/**
 * Every word on a website page. The website page and its WordPress variation (owner, 2026-11-21)
 * are the same components in the same order with the same three packages; only this copy differs,
 * so each reads for its own searches.
 */
export interface WebsitePageCopy {
  hero: { titleLines: readonly string[]; accentTitle: string; lead: string; trustLine: string };
  packages: { eyebrow: string; title: string; accentTitle: string; lead: string };
  /** The question in the line under the packages that leads to the call-back form. */
  nudge: string;
  introduction: { eyebrow: string; title: string; accentTitle: string; body: string };
  sections: readonly [WebsiteSectionCopy, WebsiteSectionCopy, WebsiteSectionCopy];
  caseStudy: { label: string; title: string; body: string; points: readonly string[] };
  /** Built per request so the answers quote the prices the admin has set. */
  faq: { label: string; title: string; items: (prices: ServicePrices) => FaqItem[] };
  call: { title: string; picture: string };
}
