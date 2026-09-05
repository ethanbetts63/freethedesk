import Link from "next/link";

const navigation = [
  { href: "/website-development-perth", label: "Websites" },
  { href: "/licensing", label: "Online licensing" },
  { href: "/automation", label: "Automation" },
  { href: "/work/scooter-shop", label: "Our work" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
];

export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label="Free the Desk home">
          free<span>the</span>desk<span className="wordmark-dot">.</span>
        </Link>
        {!minimal && <>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
            <Link className="nav-cta" href="/dealership-website-builder">Interactive demo</Link>
          </nav>
          <details className="mobile-nav">
            <summary aria-label="Open navigation menu"><i /><i /><i /></summary>
            <nav aria-label="Mobile navigation">
              {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}<span>→</span></Link>)}
              <Link className="mobile-nav-cta" href="/dealership-website-builder">Interactive demo<span>↗</span></Link>
            </nav>
          </details>
        </>}
      </div>
    </header>
  );
}
