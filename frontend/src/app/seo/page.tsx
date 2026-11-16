import type { Metadata } from 'next';

import { metadataFor } from '@/lib/pages';

import { SeoLandingPage } from './_components/SeoLandingPage';
import { SEO_COPY } from './_lib/copy';

export const metadata: Metadata = metadataFor('/seo');

/* Pricing comes from the admin, so this page renders per request. */
export const dynamic = 'force-dynamic';

export default function SeoPage() {
  return <SeoLandingPage path="/seo" copy={SEO_COPY} />;
}
