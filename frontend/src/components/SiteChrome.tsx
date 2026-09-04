"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = pathname === "/login" || pathname.startsWith("/dashboard");
  const isWebsiteBuilder = pathname === "/website-builder";
  const hideFooter = standalone || isWebsiteBuilder;
  return <>{!standalone && <SiteHeader minimal={isWebsiteBuilder} />}{children}{!hideFooter && <SiteFooter />}</>;
}
