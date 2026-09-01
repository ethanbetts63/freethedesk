import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label="Free the Desk home">
          free<span>the</span>desk<span className="wordmark-dot">.</span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/websites">Dealer websites</Link>
          <Link href="/dealers">Online licensing</Link>
          <Link href="/automation">Automation</Link>
          <Link href="/work/scooter-shop">Case study</Link>
          <Link className="nav-cta" href="/contact">Start a project</Link>
        </nav>
      </div>
    </header>
  );
}
