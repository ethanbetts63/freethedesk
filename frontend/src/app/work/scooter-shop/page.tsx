import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Scooter Shop Dealer Website Case Study",
  description: "How Scooter Shop built a faster, search-led dealership website and operating system that increased organic clicks by 200%.",
};

const outcomes = [
  ["+200%", "increase in organic clicks", "Measured in Google Search Console"],
  ["Fast", "customer experience", "Across stock, parts, hire and service"],
  ["Ready", "for agentic browsing", "Passes the new Lighthouse agent-readiness checks"],
];

const problems = [
  {
    number: "01",
    title: "One dealership, several very different customer journeys.",
    problem: "Scooter Shop sells motorcycles, scooters, e-scooters and parts while also operating service and hire departments. A single generic catalogue or contact page could not explain the whole business clearly.",
    solution: "The site was structured around what each customer is trying to do: browse a vehicle, find a part, book service, organise hire or understand the dealership. Every path has its own information and next step while still feeling like one connected business.",
  },
  {
    number: "02",
    title: "Stock and parts needed to be discoverable, not merely displayed.",
    problem: "Dealer inventory changes constantly, and customers arrive with different levels of product knowledge. Parts create an even larger information problem, with customers searching by product, model and need.",
    solution: "Products were organised into useful categories and detailed pages with clear availability, specifications and enquiry paths. The parts section became a genuine discovery channel rather than an afterthought attached to the workshop phone number.",
  },
  {
    number: "03",
    title: "The public website could not create more work for the team.",
    problem: "A broad site is only valuable if staff can keep it current and customer information reaches the right place. Otherwise every new page, product and enquiry becomes another manual task.",
    solution: "The management experience was designed around the dealership’s real day-to-day work. Repeated steps were simplified or automated, enquiries arrive with useful context, and the team can manage the information customers rely on.",
  },
  {
    number: "04",
    title: "Organic growth had to be built into the system.",
    problem: "A visually attractive site does not create search demand on its own. Dealer sites often hide inventory in weak feeds, load slowly or provide too little useful information for search engines to understand.",
    solution: "Search intent informed the structure from the beginning. Fast pages, indexable inventory, useful category content, clear internal paths and machine-readable information gave Google more valuable pages to understand and customers a better experience after the click.",
  },
];

export default function ScooterShopCaseStudy() {
  return (
    <main>
      <section className="case-hero">
        <div className="shell case-hero-grid">
          <div>
            <p className="eyebrow"><span />Scooter Shop case study</p>
            <h1>Turning a dealership website into a growth and operations asset.</h1>
          </div>
          <div className="case-hero-summary">
            <p>Scooter Shop is not a concept project. It is a working Australian dealership with sales, parts, service and hire operations—and a project where our experience working with dealerships was put into practice.</p>
            <a className="text-link" href="https://www.scootershop.com.au/" target="_blank" rel="noreferrer">Visit the live website <span>↗</span></a>
          </div>
        </div>
      </section>

      <section className="case-outcomes">
        <div className="shell case-outcome-grid">
          {outcomes.map(([metric, label, note]) => (
            <article key={label}><strong>{metric}</strong><h2>{label}</h2><p>{note}</p></article>
          ))}
        </div>
      </section>

      <section className="section shell case-introduction">
        <p className="section-number">01 / The starting point</p>
        <div>
          <h2>The challenge was bigger than redesigning a homepage.</h2>
          <p>The website needed to represent every part of the dealership without becoming confusing. It needed to help customers make progress before calling, help search engines understand a deep and changing catalogue, and help staff manage it without adding another administrative burden.</p>
          <p>That meant treating the website, customer journeys and internal workflow as one connected problem.</p>
        </div>
      </section>

      <section className="case-problems">
        <div className="shell">
          <p className="section-number">02 / Problems and solutions</p>
          {problems.map((item) => (
            <article className="case-problem" key={item.number}>
              <span>{item.number}</span>
              <h2>{item.title}</h2>
              <div><small>The issue</small><p>{item.problem}</p></div>
              <div><small>The solution</small><p>{item.solution}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell search-case-section">
        <div className="search-case-copy">
          <p className="section-number">03 / Organic search</p>
          <h2>200% more clicks from Google.</h2>
          <p>After the new experience and search foundations were established, Scooter Shop recorded a 200% increase in organic clicks in Google Search Console.</p>
          <p>The growth matters because it came from a site built to support the full dealership—not a short-lived advertising landing page. Every useful product, category and service journey creates another opportunity to be found.</p>
          <div className="search-principles">
            <span>Indexable stock</span><span>Useful categories</span><span>Fast pages</span><span>Clear internal paths</span>
          </div>
        </div>
        <div className="gsc-evidence-card">
          <div className="gsc-evidence-head"><span>Google Search Console</span><span>Organic search performance</span></div>
          <div className="gsc-evidence-body">
            <small>CLICKS</small>
            <strong>+200%</strong>
            <p>Measured increase following the new site and SEO programme.</p>
          </div>
          <div className="gsc-screenshot-slot">
            <span>Search Console evidence</span>
            <p>Your supplied performance screenshot will sit here.</p>
          </div>
        </div>
      </section>

      <section className="section agent-ready-section">
        <div className="shell agent-ready-grid">
          <div>
            <p className="section-number section-number-light">04 / Built for what comes next</p>
            <h2>Fast for customers. Clear to search engines. Ready for browser agents.</h2>
          </div>
          <div>
            <p>Speed is part of the sales experience. Customers can move through a large catalogue without fighting the website, while search engines can efficiently discover and understand the content.</p>
            <p>Scooter Shop also passes Google Chrome’s new Lighthouse agentic-browsing checks. These assess whether emerging AI browser agents can reliably understand and interact with a site through accessible, predictable and machine-readable signals.</p>
            <p className="agent-note">This is separate from the traditional Lighthouse SEO score. It is a newer standard for the way AI agents interact directly with websites.</p>
          </div>
        </div>
      </section>

      <section className="section shell case-result-section">
        <p className="section-number">05 / The result</p>
        <div className="case-result-grid">
          <h2>A website that earns attention and helps operate the business behind it.</h2>
          <div>
            <p>Scooter Shop now has a fast public experience across multiple departments, a stronger and growing organic presence, and a practical management system shaped around the dealership.</p>
            <p>That same approach can transfer to automotive, marine, caravan, agricultural and equipment dealerships: understand the operation first, then build the customer experience and systems around it.</p>
          </div>
        </div>
      </section>

      <section className="shell closing-cta">
        <p className="eyebrow eyebrow-light"><span />Your dealership</p>
        <h2>What could your website do beyond looking newer?</h2>
        <p>Send us the current site. We’ll look at the customer journey, search opportunity and operational work behind it.</p>
        <Link className="button button-lime" href="/contact">Request a dealership review <span>↗</span></Link>
      </section>
    </main>
  );
}
