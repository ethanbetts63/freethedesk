import Link from 'next/link';

import { secondaryLinkClassName } from '@/components/marketing/Hero';

/** The hero's case study link, repeated under the sections it is proof of. In a new tab: the reader is mid-page. */
export function CaseStudyLink() {
  return (
    <Link
      className={secondaryLinkClassName}
      href="/portfolio/scooter-shop"
      target="_blank"
      rel="noopener noreferrer"
    >
      Read the case study <span>↗</span>
    </Link>
  );
}
