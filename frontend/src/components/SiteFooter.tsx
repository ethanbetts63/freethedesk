import Image from "next/image";
import Link from "next/link";

import { FOOTER_NAVIGATION } from "@/lib/siteConfig";
import { SignalFlow } from "@/app/home-v3/SignalFlow";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-signal-flow"><SignalFlow /></div>
      <div className="shell footer-grid">
        <div>
          <Link className="wordmark footer-logo" href="/" aria-label="Free the Desk home">
            <Image className="nav-logo-image" src="/logo-192x192.png" alt="" width={40} height={40} />
            <span className="nav-logo-text">free<span>the</span>desk<span className="wordmark-dot">.</span></span>
          </Link>
          <p className="footer-summary">
            Dealer websites and operational systems built by a development team with hands-on experience across dealerships and automotive suppliers.
          </p>
        </div>
        <div className="footer-links">
          <p className="footer-label">Explore</p>
          {FOOTER_NAVIGATION.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </div>
        <div className="footer-links">
          <p className="footer-label">Based in</p>
          <span>Perth, Western Australia</span>
          <a href="mailto:hello@freethedesk.com.au">hello@freethedesk.com.au</a>
        </div>
        <div className="footer-links">
          <p className="footer-label">Terms &amp; policies</p>
          <Link href="/legal/privacy">Privacy policy</Link>
          <Link href="/legal/dealer-subscription-terms">Dealer subscription terms</Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Free the Desk</span>
        <span>Working with dealers across Australia</span>
      </div>
    </footer>
  );
}
