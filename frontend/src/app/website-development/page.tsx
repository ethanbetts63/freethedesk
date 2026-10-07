import type { Metadata } from 'next';

import { metadataFor } from '@/lib/pages';

import { WebDesignPage } from './_components/WebDesignPage';
import { PERTH_WEB_DESIGN } from './_lib/copy';

export const metadata: Metadata = metadataFor('/website-development');

/* The packages and the cost answer quote the admin's prices, so this page renders per request. */
export const dynamic = 'force-dynamic';

export default function WebsiteDevelopmentPage() {
  return <WebDesignPage path="/website-development" copy={PERTH_WEB_DESIGN} />;
}
