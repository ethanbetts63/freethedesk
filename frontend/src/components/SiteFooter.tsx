import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link className="wordmark wordmark-light" href="/">
            free<span>the</span>desk<span className="wordmark-dot">.</span>
          </Link>
          <p className="footer-summary">
            Dealer websites and operational systems built by a development team with hands-on experience across dealerships and automotive suppliers.
          </p>
        </div>
        <div className="footer-links">
          <p className="footer-label">Explore</p>
          <Link href="/websites">Dealer websites</Link>
          <Link href="/automation">Automation</Link>
          <Link href="/work/scooter-shop">Scooter Shop case study</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/login">Admin login</Link>
        </div>
        <div className="footer-links">
          <p className="footer-label">Based in</p>
          <span>Perth, Western Australia</span>
          <a href="mailto:hello@freethedesk.com.au">hello@freethedesk.com.au</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Free the Desk</span>
        <span>Working with dealers across Australia</span>
      </div>
    </footer>
  );
}
