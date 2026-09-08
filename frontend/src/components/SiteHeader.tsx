import Image from "next/image";
import Link from "next/link";

import { PRIMARY_NAVIGATION } from "@/lib/siteConfig";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark nav-logo" href="/" aria-label="Free the Desk home">
          <Image className="nav-logo-image" src="/logo-192x192.png" alt="" width={40} height={40} priority />
          <span className="nav-logo-text">
            free<span>the</span>desk<span className="wordmark-dot">.</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {PRIMARY_NAVIGATION.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="nav-cta nav-cta-glow" href="/login">
            Login
          </Link>
        </nav>
        <details className="mobile-nav">
          <summary aria-label="Open navigation menu">
            <i />
            <i />
            <i />
          </summary>
          <nav aria-label="Mobile navigation">
            {PRIMARY_NAVIGATION.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
                <span>→</span>
              </Link>
            ))}
            <Link className="mobile-nav-cta nav-cta-glow" href="/login">
              Login<span>→</span>
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
