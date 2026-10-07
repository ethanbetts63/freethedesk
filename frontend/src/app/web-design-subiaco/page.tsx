import type { Metadata } from 'next';

import { WebDesignPage } from '@/app/website-development/_components/WebDesignPage';
import { SUBIACO_WEB_DESIGN } from '@/app/website-development/_lib/copy';
import { metadataFor } from '@/lib/pages';

export const metadata: Metadata = metadataFor('/web-design-subiaco');

/* The packages and the cost answer quote the admin's prices, so this page renders per request. */
export const dynamic = 'force-dynamic';

/**
 * The website development page for Subiaco: same layout and visuals, local
 * wording. A trial of one suburb page, linked only from the footer, so its
 * search results can be read on their own before any more are made.
 */
export default function WebDesignSubiacoPage() {
  return <WebDesignPage path="/web-design-subiaco" copy={SUBIACO_WEB_DESIGN} />;
}
