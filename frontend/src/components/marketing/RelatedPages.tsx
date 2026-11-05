import 'server-only';

import { guideIconFor } from '@/app/guides/_components/guideIcons';
import { GuideCards } from '@/components/guides/GuideCards';
import { SectionNumber } from '@/components/SectionNumber';
import { guideCards } from '@/lib/guideView';
import { relatedPagesFor } from '@/lib/relatedPages';

/**
 * The pages a reader goes to next, at the end of a service page, guide or case study: the guides' picture cards,
 * a guide among the links shown with its picture. Nothing when the page has none listed.
 */
export function RelatedPages({ path }: { path: string }) {
  return (
    <GuideCards
      related={relatedPagesFor(path)}
      guides={guideCards()}
      kicker={<SectionNumber>Related</SectionNumber>}
      iconFor={guideIconFor}
    />
  );
}
