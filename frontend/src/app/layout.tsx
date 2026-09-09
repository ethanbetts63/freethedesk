import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteChrome } from "@/components/SiteChrome";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo";
import { METADATA_BASE_URL } from "@/lib/siteConfig";
import "./globals.css";

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_BASE_URL),
  title: "Fire your admin | Websites & Digital Automation | Australia, Perth",
  description: "Dealer websites and operational systems for Australian vehicle, equipment and leisure dealerships.",
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
        {CLARITY_PROJECT_ID && (
          <Script
            id="clarity-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", ${JSON.stringify(CLARITY_PROJECT_ID)});`,
            }}
          />
        )}
      </body>
    </html>
  );
}
