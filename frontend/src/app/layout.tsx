import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { ClarityAnalytics } from '@/components/analytics/ClarityAnalytics';
import { ContactClickTracking } from '@/components/analytics/ContactClickTracking';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import StructuredDataScript from '@/components/seo/StructuredDataScript';
import { SiteChrome } from '@/components/SiteChrome';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { STATIC_PAGES } from '@/lib/pages';
import { buildOrganizationSchema, buildWebsiteSchema } from '@/lib/seo';
import { SITE_URL } from '@/lib/siteConfig';
import './globals.css';

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? '';

/**
 * GA4's measurement id. Public in the same way Clarity's is -- it ships in the
 * gtag.js URL -- and unset outside production for the same reason, so a preview
 * deploy does not file its traffic under the real property.
 */
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

/**
 * The three signed-in portals and the credential and token routes, kept out of
 * the property.
 *
 * Neither CLARITY_EXCLUDED_ROUTES nor APPLICATION_ROUTES, though it overlaps
 * both. Clarity's list is a security decision about what a third party gets a
 * picture of, and APPLICATION_ROUTES is about which chrome a page wears -- it
 * held the customer-facing dealership builder, exactly what
 * this property is being installed to measure. The portals are excluded for a
 * measurement reason: staff live in these three for hours a day, and left in
 * they sit on top of every engagement, retention and landing-page number on the
 * property. The rest are excluded because GA never receives a secret
 * (integrations-standard.md section 8): /sale/{reference}/{token} is an emailed
 * bearer link, and a prefix cannot spare /sale/{reference} without it.
 */
const GA_EXCLUDED_ROUTES = [
  '/dashboard',
  '/portal',
  '/seo-portal',
  '/login',
  '/account',
  '/reset-password',
  '/sale',
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: STATIC_PAGES['/'].title,
  description: STATIC_PAGES['/'].description,
  verification: {
    google: 'NPT1jo_98rxtDYj63w_sk4NePShMgItyKEdFQdigwOk',
  },
  icons: {
    icon: [
      { url: '/logo-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/logo-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/logo-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/logo-180x180.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StructuredDataScript structuredData={[buildOrganizationSchema(), buildWebsiteSchema()]} />
        <ScrollToTop />
        {/* Chrome is passed in already rendered, so its markup stays on the
            server and SiteChrome only decides which routes show it. AuthProvider
            is deliberately NOT here: it belongs to the signed-in areas, and in
            the root layout it hydrated on every marketing page and fired a
            profile request per view. */}
        <SiteChrome header={<Header />} footer={<Footer />}>
          {children}
        </SiteChrome>
        <Analytics />
        <SpeedInsights />
        {CLARITY_PROJECT_ID && <ClarityAnalytics projectId={CLARITY_PROJECT_ID} />}
        {GA_MEASUREMENT_ID && (
          <>
            <GoogleAnalytics
              measurementId={GA_MEASUREMENT_ID}
              excludedRoutes={GA_EXCLUDED_ROUTES}
            />
            <ContactClickTracking excludedRoutes={GA_EXCLUDED_ROUTES} />
          </>
        )}
      </body>
    </html>
  );
}
