import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ScooterShopTour } from "./ScooterShopTour";

export const metadata: Metadata = {
  title: "Scooter Shop Dealer Website Case Study",
  description: "A connected dealership website for sales, online purchasing, licensing, parts, service, hire and long-term organic growth.",
};

const capabilities = [
  "Inventory",
  "Online purchasing",
  "Licensing",
  "Parts",
  "Service bookings",
  "Hire",
  "Guides",
  "SEO",
];

const operations = [
  { number: "01", title: "Action queue", detail: "Enquiries and next steps arrive with the context staff need." },
  { number: "02", title: "Orders & licensing", detail: "Customer paperwork, payment and handover progress stay connected." },
  { number: "03", title: "Stock & content", detail: "The information customers rely on can be managed in one place." },
  { number: "04", title: "Service diary", detail: "Bookings become an organised workshop schedule, not another inbox." },
];

const intentGroups = [
  {
    number: "01",
    title: "Ready to buy",
    pages: ["New Scooters", "Used Scooters", "Used Motorcycles", "E-Scooters", "50cc Scooters Perth", "125cc Scooters Perth"],
  },
  {
    number: "02",
    title: "Need the workshop",
    pages: ["Servicing", "Scooter Repairs", "Vespa Service Perth", "Motorcycle Service", "Tyre Fitting"],
  },
  {
    number: "03",
    title: "Brand, parts or hire",
    pages: ["SYM Scooters", "SYM Parts", "Parts Enquiry", "Patrol Mountain Bikes", "Motorcycle Hire Perth"],
  },
  {
    number: "04",
    title: "Local and researching",
    pages: ["Motorcycles Perth", "Used Vespa Scooters Perth", "SYM Scooters Perth", "Scooters Morley", "Scooters Mount Lawley", "Scooter Service North Perth", "Car vs Moped Cost Calculator"],
  },
];

export default function ScooterShopCaseStudy() {
  return (
    <main className="scooter-case-page">
      <section className="scooter-case-hero">
        <div className="scooter-case-grid" aria-hidden="true" />
        <div className="shell scooter-case-hero-layout">
          <div className="scooter-case-hero-copy">
            <p className="eyebrow"><span />Scooter Shop case study</p>
            <h1>One dealership.<br /><span>One connected system.</span></h1>
            <p>A working website that brings sales, parts, service, hire and dealership operations into one customer experience.</p>
            <div className="button-row">
              <a className="button button-primary" href="https://www.scootershop.com.au/" target="_blank" rel="noreferrer">Visit the live website <span>↗</span></a>
              <a className="text-link" href="#tour">Explore the build <span>↓</span></a>
            </div>
            <div className="scooter-case-meta">
              <span>Strategy</span><span>Design</span><span>Development</span><span>SEO</span>
            </div>
          </div>

          <div className="scooter-case-hero-media">
            <div className="case-browser case-browser-hero">
              <div className="case-browser-bar"><i /><i /><i /><span>www.scootershop.com.au</span></div>
              <Image src="/case-studies/scooter-shop/home-desktop.png" alt="Scooter Shop homepage on desktop" width={1440} height={960} priority />
            </div>
            <div className="case-phone">
              <div className="case-phone-speaker" />
              <div className="case-phone-menu" aria-hidden="true"><i /><i /><i /></div>
              <Image src="/case-studies/scooter-shop/inventory-mobile.png" alt="Scooter Shop used inventory experience on mobile" width={390} height={844} priority />
            </div>
            <div className="case-live-note"><i /> Live dealership website</div>
          </div>
        </div>
      </section>

      <section className="case-proof-strip" id="results">
        <div className="shell case-proof-strip-grid">
          <article><strong>+200%</strong><div><h2>Organic clicks</h2><p>Recorded in Google Search Console after launch.</p></div></article>
          <article><strong>08</strong><div><h2>Connected capabilities</h2><p>From first search to service after the sale.</p></div></article>
          <article><strong>01</strong><div><h2>Dealership system</h2><p>Customer journeys and daily operations designed together.</p></div></article>
        </div>
      </section>

      <section className="section shell case-story-intro">
        <p className="section-number">01 / The brief</p>
        <div>
          <h2>Not a brochure.<br />A working dealership.</h2>
          <p>Scooter Shop needed to represent several very different parts of the business without making the experience feel fragmented. Customers should be able to discover stock, make a decision, buy, find a part or book the workshop without starting again each time.</p>
          <div className="case-capability-list">
            {capabilities.map((capability) => <span key={capability}>{capability}</span>)}
          </div>
        </div>
      </section>

      <section className="case-tour-section" id="tour">
        <div className="shell">
          <div className="case-section-heading">
            <p className="section-number">02 / The customer experience</p>
            <h2>Built around what<br />the customer came to do.</h2>
            <p>Select a part of the dealership to explore the live experience.</p>
          </div>
          <ScooterShopTour />
        </div>
      </section>

      <section className="case-mobile-story">
        <div className="shell case-mobile-story-grid">
          <div className="case-mobile-copy">
            <p className="section-number">03 / Every screen</p>
            <h2>The important journeys work wherever they begin.</h2>
            <p>Across Australian dealerships, we find that an average of 66% of users are browsing on mobile. That is why every journey starts with the smallest screen in our process—not as a reduced version of desktop.</p>
            <div className="case-mobile-stat">
              <strong>66%</strong>
              <span><b>of dealership users are on mobile</b><small>Average across the Australian dealership traffic we see.</small></span>
            </div>
          </div>
          <div className="case-mobile-stage">
            <div className="case-mobile-phone">
              <span />
              <div className="case-phone-menu" aria-hidden="true"><i /><i /><i /></div>
              <Image src="/case-studies/scooter-shop/inventory-mobile.png" alt="Responsive Scooter Shop inventory page showing the online buying steps" width={390} height={844} />
            </div>
            <div className="case-mobile-callout case-mobile-callout-one"><b>01</b><span>Clear buying path</span></div>
          </div>
        </div>
      </section>

      <section className="case-operations-section">
        <div className="shell">
          <div className="case-operations-heading">
            <div>
              <p className="section-number section-number-light">04 / Behind the website</p>
              <h2>The part customers<br />never have to see.</h2>
            </div>
            <p>The public website is only half the system. The management experience is organised around what dealership staff need to action next, so better customer service does not create more administration.</p>
          </div>

          <div className="case-ops-console">
            <aside>
              <strong>Dealer workspace</strong>
              <span className="active">Today <b>8</b></span>
              <span>Customers</span>
              <span>Inventory</span>
              <span>Orders</span>
              <span>Service</span>
            </aside>
            <div className="case-ops-main">
              <div className="case-ops-topline"><div><small>Thursday / 9:41 AM</small><h3>What needs attention.</h3></div><span>All systems connected <i /></span></div>
              <div className="case-ops-list">
                {operations.map((item) => (
                  <article key={item.number}>
                    <span>{item.number}</span>
                    <div><h4>{item.title}</h4><p>{item.detail}</p></div>
                    <b>Open →</b>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell case-search-section">
        <div className="case-search-number">
          <small>Organic search performance</small>
          <strong>+200%</strong>
          <span>clicks from Google</span>
        </div>
        <div className="case-search-copy">
          <p className="section-number">05 / Built to be found</p>
          <h2>Growth was designed into the structure.</h2>
          <p>Search intent informed the site from the beginning. Indexable stock, useful category pages, guides, strong internal paths and fast structured pages created more ways for customers to find the dealership—and a better experience after the click.</p>
          <div className="case-search-points"><span>Indexable stock</span><span>Useful categories</span><span>Structured information</span><span>Continuous improvement</span></div>
        </div>
      </section>

      <section className="case-intent-section">
        <div className="shell">
          <div className="case-intent-heading">
            <div>
              <p className="section-number">06 / High-intent pages</p>
              <h2>One website.<br />Many useful ways in.</h2>
            </div>
            <p>Different customers reveal different intent in the way they search: a Vespa service, a used motorcycle or a specific SYM part. We build focused pages around those searches to capture more high-intent organic traffic—then give each visitor a more relevant next step.</p>
          </div>

          <div className="case-intent-grid">
            {intentGroups.map((group) => (
              <article key={group.number}>
                <header><span>{group.number}</span><h3>{group.title}</h3></header>
                <ul>{group.pages.map((page) => <li key={page}>{page}<span>↗</span></li>)}</ul>
              </article>
            ))}
          </div>

        </div>
      </section>

      <section className="shell closing-cta">
        <p className="eyebrow eyebrow-light"><span />Your dealership</p>
        <h2>What could your website do beyond looking newer?</h2>
        <p>Send us the current site. We’ll look at the customer journey, search opportunity and operational work behind it.</p>
        <div className="button-row">
          <Link className="button button-lime" href="/contact">Talk about your dealership <span>→</span></Link>
          <a className="case-cta-live-link" href="https://www.scootershop.com.au/" target="_blank" rel="noreferrer">Visit Scooter Shop ↗</a>
        </div>
      </section>
    </main>
  );
}
