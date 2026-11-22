import type { Metadata } from 'next';

import { metadataFor } from '@/lib/pages';

import { WebsiteLandingPage } from './_components/WebsiteLandingPage';
import { WEBSITE_COPY } from './_lib/copy';

export const metadata: Metadata = metadataFor('/website-development');

/* The hourly rate is the admin's, so this page renders per request. */
export const dynamic = 'force-dynamic';

export default function WebsiteDevelopmentPage() {
  return <WebsiteLandingPage path="/website-development" copy={WEBSITE_COPY} />;
}
