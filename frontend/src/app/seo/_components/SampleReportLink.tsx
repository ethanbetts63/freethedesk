import Link from 'next/link';

import { secondaryLinkClassName } from '@/components/marketing/Hero';

/** The hero's "See a sample report" link, repeated under the sections that describe the report. In a new tab: the reader is mid-page. */
export function SampleReportLink() {
  return (
    <Link
      className={secondaryLinkClassName}
      href="/seo/sample-report"
      target="_blank"
      rel="noopener noreferrer"
    >
      See a sample report <span>↗</span>
    </Link>
  );
}
