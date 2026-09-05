import Image from "next/image";
import Link from "next/link";

import { PRIMARY_NAVIGATION, WEBSITE_NAVIGATION } from "@/lib/siteConfig";
import { DesktopNavMenu } from "./DesktopNavMenu";

export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark nav-logo" href="/" aria-label="Free the Desk home">
          <Image
            className="nav-logo-image"
            src="/logo-192x192.png"
            alt=""
            width={52}
            height={52}
            priority
          />
        </Link>
        {!minimal && <>
          <nav className="desktop-nav" aria-label="Primary navigation">
            <DesktopNavMenu label="Websites" items={WEBSITE_NAVIGATION} />
            {PRIMARY_NAVIGATION.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
            <Link className="nav-cta" href="/dealership-website-builder">Interactive demo</Link>
          </nav>
          <details className="mobile-nav">
            <summary aria-label="Open navigation menu"><i /><i /><i /></summary>
            <nav aria-label="Mobile navigation">
              <p className="mobile-nav-label">Websites</p>
              {WEBSITE_NAVIGATION.map((item) => <Link key={item.href} href={item.href}>{item.label}<span>→</span></Link>)}
              {PRIMARY_NAVIGATION.map((item) => <Link key={item.href} href={item.href}>{item.label}<span>→</span></Link>)}
              <Link className="mobile-nav-cta" href="/dealership-website-builder">Interactive demo<span>↗</span></Link>
            </nav>
          </details>
        </>}
      </div>
    </header>
  );
}
