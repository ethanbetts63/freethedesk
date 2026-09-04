import Link from "next/link";

export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label="Free the Desk home">
          free<span>the</span>desk<span className="wordmark-dot">.</span>
        </Link>
        {!minimal && <nav className="desktop-nav" aria-label="Primary navigation">
          <details className="nav-menu">
            <summary>Explore <span aria-hidden="true">+</span></summary>
            <div className="nav-menu-panel">
              <div>
                <p>Home concepts</p>
                <Link href="/">Current home <span>01</span></Link>
                <Link href="/home-v3">Home V3 <span>03</span></Link>
              </div>
              <div>
                <p>What we do</p>
                <Link href="/websites">Dealer websites <span>→</span></Link>
                <Link href="/website-builder">Website builder <span>→</span></Link>
                <Link href="/dealers">Online licensing <span>→</span></Link>
                <Link href="/automation">Automation <span>→</span></Link>
                <Link href="/work/scooter-shop">Case study <span>→</span></Link>
              </div>
            </div>
          </details>
          <Link className="nav-cta" href="/contact">Start a project</Link>
        </nav>}
      </div>
    </header>
  );
}
