import type { Metadata } from 'next';

import { WebsiteLandingPage } from '@/app/website-development/_components/WebsiteLandingPage';
import { SUBIACO_COPY } from '@/app/website-development/_lib/copy';
import { metadataFor } from '@/lib/pages';

export const metadata: Metadata = metadataFor('/web-design-subiaco');

/* The hourly rate is the admin's, so this page renders per request. */
export const dynamic = 'force-dynamic';

export default function WebDesignSubiacoPage() {
  return <WebsiteLandingPage path="/web-design-subiaco" copy={SUBIACO_COPY} />;
}
