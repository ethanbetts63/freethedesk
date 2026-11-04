import { AUTHOR } from '@/lib/author';

/**
 * What the shared guide layout (`components/guides`, `lib/guideView`, both registry files) says that is this site's
 * own. The rest of a guide's page is composed in `app/[slug]/page.tsx`.
 */

export const GUIDE_AUTHOR: { role: string | null; bio: string | null } = {
  /** Under the byline, as the email signature signs it. */
  role: 'Lead Analyst, freethedesk',
  bio: `${AUTHOR.givenName} writes freethedesk's SEO audits and builds its websites in Perth, including Scooter Shop's, the dealership site in the case study. He writes these guides from what the audits find on real Perth businesses' sites.`,
};

/** Under `public/`: a guide's picture is `images/guides/<slug>.webp`. */
export const GUIDE_IMAGES_DIR = 'images/guides';
