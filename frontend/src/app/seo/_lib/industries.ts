import { BUILDERS_COPY } from './industries/builders';
import { DEALERSHIPS_COPY } from './industries/dealerships';
import { HEALTH_CLINICS_COPY } from './industries/health-clinics';
import { PROFESSIONAL_SERVICES_COPY } from './industries/professional-services';
import { TRADIES_COPY } from './industries/tradies';
import type { SeoPageCopy } from './pageCopy';

/**
 * The industry SEO pages (owner, 2026-11-16): each is a copy of /seo, the same components in the
 * same order, with the words changed to say the same thing in its trade's keywords.
 */
export const INDUSTRIES = {
  '/seo/tradies': TRADIES_COPY,
  '/seo/builders': BUILDERS_COPY,
  '/seo/health-clinics': HEALTH_CLINICS_COPY,
  '/seo/professional-services': PROFESSIONAL_SERVICES_COPY,
  '/seo/dealerships': DEALERSHIPS_COPY,
} as const satisfies Record<string, SeoPageCopy>;

export type IndustryPath = keyof typeof INDUSTRIES;
