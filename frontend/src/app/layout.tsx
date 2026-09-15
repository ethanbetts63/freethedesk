import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import { ClarityAnalytics } from "@/components/ClarityAnalytics";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteChrome } from "@/components/SiteChrome";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PAGES } from "@/lib/pages";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo";
import { METADATA_BASE_URL } from "@/lib/siteConfig";
import "./globals.css";

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_BASE_URL),
  title: PAGES["/"].title,
  description: PAGES["/"].description,
  verification: {
    google: "NPT1jo_98rxtDYj63w_sk4NePShMgItyKEdFQdigwOk",
  },
  icons: {
    icon: [
      { url: "/logo-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/logo-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/logo-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/logo-180x180.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([buildOrganizationSchema(), buildWebsiteSchema()]) }}
        />
        <ScrollToTop />
        {/* Chrome is passed in already rendered, so its markup stays on the
            server and SiteChrome only decides which routes show it. AuthProvider
            is deliberately NOT here: it belongs to the signed-in areas, and in
            the root layout it hydrated on every marketing page and fired a
            profile request per view. */}
        <SiteChrome header={<SiteHeader />} footer={<SiteFooter />}>
          {children}
        </SiteChrome>
        <Analytics />
        {CLARITY_PROJECT_ID && <ClarityAnalytics projectId={CLARITY_PROJECT_ID} />}
      </body>
    </html>
  );
}
