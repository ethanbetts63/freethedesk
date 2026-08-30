import Link from "next/link";

import { DealerSystemVisual } from "@/components/DealerSystemVisual";

const dealerTypes = ["Automotive", "Boats & marine", "Caravans & RVs", "Farm machinery", "Outdoor power", "Equipment hire"];

export default function Home() {
  return (
    <main>
      <section className="home-hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span />Development for Australian dealerships</p>
            <h1>Dealer websites that work beyond the showroom.</h1>
            <p className="hero-lead">
              Fast customer experiences on the front. Practical inventory, parts, service and enquiry systems behind the scenes.
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="/contact">Talk through your dealership <span>↗</span></Link>
              <Link className="text-link" href="/websites">See what we build <span>→</span></Link>
            </div>
            <div className="operator-note">
              <span className="operator-mark">FTD</span>
              <p><strong>A development team that knows dealership operations.</strong> We understand sales, parts, service and administration through hands-on work with dealerships and automotive suppliers.</p>
            </div>
          </div>
          <div className="hero-visual-wrap">
            <DealerSystemVisual />
            <div className="floating-note floating-note-top"><strong>One source of truth</strong><span>Stock · leads · service</span></div>
            <div className="floating-note floating-note-bottom"><span className="note-check">✓</span><div><strong>Enquiry captured</strong><span>Ready for your team</span></div></div>
          </div>
        </div>
      </section>

      <section className="dealer-strip">
        <div className="shell dealer-strip-inner">
          <p>Built for businesses that sell, service and support real products</p>
          <div>{dealerTypes.map((type) => <span key={type}>{type}</span>)}</div>
        </div>
      </section>

      <section className="section shell intro-section">
        <div>
          <p className="section-number">01 / What we do</p>
          <h2>Your website should be one of your best employees.</h2>
        </div>
        <p className="section-intro">
          Most dealer sites stop at looking presentable. We build the customer experience and the useful operational layer behind it — without forcing you to replace every tool you already use.
        </p>
      </section>

      <section className="shell service-grid">
        <article className="service-card service-card-dark">
          <p className="card-kicker">Dealer websites</p>
          <h3>Make stock easier to find and your business easier to choose.</h3>
          <ul className="feature-list">
            <li>Live inventory and product catalogues</li>
            <li>Parts, service, hire and trade-in enquiries</li>
            <li>Fast, mobile-first and search-ready</li>
            <li>Custom admin tools where they create value</li>
          </ul>
          <Link href="/websites">Explore dealer websites <span>→</span></Link>
        </article>
        <article className="service-card service-card-lime">
          <p className="card-kicker">Business automation</p>
          <h3>Remove the repeated admin between an enquiry and a completed job.</h3>
          <ul className="feature-list">
            <li>Lead routing and customer follow-up</li>
            <li>Stock, supplier and parts workflows</li>
            <li>Bookings, reminders and documents</li>
            <li>Custom API connections and dashboards</li>
          </ul>
          <Link href="/automation">Explore automation <span>→</span></Link>
        </article>
      </section>

      <section className="section proof-section">
        <div className="shell proof-grid">
          <div className="proof-copy">
            <p className="section-number section-number-light">02 / The proof</p>
            <h2>Not a portfolio concept. A system used every day.</h2>
            <p>
              Scooter Shop is a live Australian dealership selling motorcycles, scooters, e-scooters and parts, while also running hire and service operations.
            </p>
            <p>
              We designed and developed its public website, custom Django backend and management portal around the way the dealership actually works.
            </p>
            <div className="button-row proof-buttons">
              <Link className="button button-light" href="/work/scooter-shop">Read the case study <span>→</span></Link>
              <a className="proof-live-link" href="https://www.scootershop.com.au/" target="_blank" rel="noreferrer">Visit the live site ↗</a>
            </div>
          </div>
          <div className="proof-panel">
            <div className="proof-panel-header"><span>Live system</span><span>scootershop.com.au ↗</span></div>
            <div className="proof-metric"><span>01</span><div><strong>One connected catalogue</strong><p>Vehicles, parts and content managed from a purpose-built backend.</p></div></div>
            <div className="proof-metric"><span>02</span><div><strong>Multiple departments</strong><p>Sales, service, hire and parts each get a deliberate customer journey.</p></div></div>
            <div className="proof-metric"><span>03</span><div><strong>Built for daily use</strong><p>Practical admin tools and automations support the people doing the work.</p></div></div>
          </div>
        </div>
      </section>

      <section className="section shell process-section">
        <div className="process-heading">
          <p className="section-number">03 / How it works</p>
          <h2>Start with the operational problem.</h2>
        </div>
        <div className="process-grid">
          <article><span>01</span><h3>Understand</h3><p>We map the customer journey, the staff workflow and where the current systems get in the way.</p></article>
          <article><span>02</span><h3>Build</h3><p>We deliver the highest-value version first, with a clear scope and regular working demonstrations.</p></article>
          <article><span>03</span><h3>Improve</h3><p>Once it is live, we support it and add capability where the real usage proves it is worthwhile.</p></article>
        </div>
      </section>

      <section className="shell closing-cta">
        <p className="eyebrow eyebrow-light"><span />Australia-wide · Perth based</p>
        <h2>What is your dealership still doing the hard way?</h2>
        <p>Show us the website, spreadsheet or repeated process. We’ll tell you plainly where a better system could help.</p>
        <Link className="button button-lime" href="/contact">Start a conversation <span>↗</span></Link>
      </section>
    </main>
  );
}
