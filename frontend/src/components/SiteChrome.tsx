"use client";

import { usePathname } from "next/navigation";
import { AiReadinessModal } from "@/components/marketing/AiReadinessModal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = pathname === "/login" || pathname.startsWith("/licensing/payment");
  const applicationArea =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/seo-portal") ||
    pathname.startsWith("/seo/payment") ||
    pathname === "/dealership-website-builder";
  return (
    <>
      {!standalone && <SiteHeader />}
      {children}
      {!standalone && <SiteFooter />}
      {!standalone && !applicationArea && <AiReadinessModal />}
    </>
  );
}
