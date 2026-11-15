import type { Metadata } from 'next';

import { metadataFor } from '@/lib/pages';

import { IndustryPage } from '../_components/IndustryPage';

const PATH = '/seo/health-clinics';

export const metadata: Metadata = metadataFor(PATH);

/* Pricing comes from the admin, so this page renders per request. */
export const dynamic = 'force-dynamic';

export default function Page() {
  return <IndustryPage path={PATH} />;
}
