import type { Metadata } from 'next';

import { metadataFor } from '@/lib/pages';

import { SeoLandingPage } from '../_components/SeoLandingPage';
import { INDUSTRIES } from '../_lib/industries';

const PATH = '/seo/professional-services';

export const metadata: Metadata = metadataFor(PATH);

/* Pricing comes from the admin, so this page renders per request. */
export const dynamic = 'force-dynamic';

export default function Page() {
  return <SeoLandingPage path={PATH} copy={INDUSTRIES[PATH]} />;
}
