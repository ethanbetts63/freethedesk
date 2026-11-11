import { AUTHOR } from '@/lib/author';
import type { GuideSiteAuthor } from '@/lib/guide';

/**
 * What the shared guide layout (`components/guides`, `lib/guideView`, both registry files) says that is this site's
 * own. The rest of a guide's page is composed in `app/[slug]/page.tsx`.
 */

export const GUIDE_AUTHOR: GuideSiteAuthor = {
  /** Under the byline, as the email signature signs it. */
  role: 'Director, freethedesk',
  bio: `${AUTHOR.givenName} writes freethedesk's SEO audits and builds its websites in Perth, including Scooter Shop's, the dealership site in the case study. He writes these guides from what the audits find on real Perth businesses' sites.`,
  /** The headshot, 256px square, under `public/`. */
  photo: '/images/ethan-betts-ingram.webp',
};

/** Under `public/`: a guide's picture is `images/guides/<slug>.webp`. */
export const GUIDE_IMAGES_DIR = 'images/guides';
