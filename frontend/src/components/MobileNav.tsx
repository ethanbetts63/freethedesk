"use client";

import Link from "next/link";
import { useRef } from "react";

import { PRIMARY_NAVIGATION } from "@/lib/siteConfig";

export function MobileNav() {
  const menu = useRef<HTMLDetailsElement>(null);

  // Next.js navigates client-side, so the panel would otherwise stay open over
  // the page the link just went to.
  const close = () => {
    if (menu.current) menu.current.open = false;
  };

  return (
    <details className="mobile-nav" ref={menu}>
      <summary aria-label="Open navigation menu">
        <i />
        <i />
        <i />
      </summary>
      <nav aria-label="Mobile navigation">
        {PRIMARY_NAVIGATION.map((item) => (
          <Link key={item.href} href={item.href} onClick={close}>
            {item.label}
            <span>→</span>
          </Link>
        ))}
        <Link className="mobile-nav-cta nav-cta-glow" href="/login" onClick={close}>
          Login<span>→</span>
        </Link>
      </nav>
    </details>
  );
}
