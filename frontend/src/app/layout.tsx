import type { Metadata } from "next";

import { SiteChrome } from "@/components/SiteChrome";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Free the Desk | Dealer Operations Systems",
    template: "%s | Free the Desk",
  },
  description: "Dealer websites and operational systems for Australian vehicle, equipment and leisure dealerships.",
  verification: {
    google: "NPT1jo_98rxtDYj63w_sk4NePShMgItyKEdFQdigwOk",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SiteChrome>{children}</SiteChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
