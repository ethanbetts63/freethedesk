import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteChrome } from "@/components/SiteChrome";
import { AuthProvider } from "@/context/AuthContext";
import { METADATA_BASE_URL } from "@/lib/siteConfig";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_BASE_URL),
  title: {
    default: "Free the Desk | Dealer Operations Systems",
    template: "%s | Free the Desk",
  },
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
    apple: [
      { url: "/logo-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ScrollToTop />
        <AuthProvider>
          <SiteChrome>{children}</SiteChrome>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
