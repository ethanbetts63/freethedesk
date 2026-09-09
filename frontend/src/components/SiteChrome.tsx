"use client";

import { usePathname } from "next/navigation";

import { AiReadinessModal } from "@/components/marketing/AiReadinessModal";

/**
 * Picks which chrome a route gets. Header and footer arrive as already-rendered
 * server elements rather than imports, so their markup never reaches the client
 * bundle - this component only chooses whether to place them.
 */
export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
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
      {!standalone && header}
      {children}
      {!standalone && footer}
      {!standalone && !applicationArea && <AiReadinessModal />}
    </>
  );
}
