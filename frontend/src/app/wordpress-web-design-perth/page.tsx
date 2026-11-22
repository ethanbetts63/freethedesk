import type { Metadata } from 'next';

import { WebsiteLandingPage } from '@/app/website-development/_components/WebsiteLandingPage';
import { metadataFor } from '@/lib/pages';

import { WORDPRESS_COPY } from './_lib/copy';

export const metadata: Metadata = metadataFor('/wordpress-web-design-perth');

/* The hourly rate is the admin's, so this page renders per request. */
export const dynamic = 'force-dynamic';

/**
 * The website page's WordPress variation (owner, 2026-11-21). Search Console shows WordPress
 * searches are most of the website demand in Perth; we do not build on WordPress, so the page sells
 * the move off it. It replaced /website-redesign-perth on 2026-11-22, which redirects here.
 */
export default function WordPressWebDesignPage() {
  return <WebsiteLandingPage path="/wordpress-web-design-perth" copy={WORDPRESS_COPY} />;
}
