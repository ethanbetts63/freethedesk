import type { Metadata } from "next";
import Link from "next/link";

import { DealerSystemVisual } from "@/components/DealerSystemVisual";

export const metadata: Metadata = {
  title: "Dealer Website Development",
  description: "Custom inventory, parts, service and enquiry websites for Australian vehicle, equipment and leisure dealerships.",
};

const capabilities = [
  ["Inventory that customers can use", "Useful filters, clear availability, structured product details and deliberate enquiry paths on every device."],
  ["Parts and accessories", "A searchable catalogue, targeted request workflow or complete ecommerce experience based on how your parts department operates."],
  ["Service and hire", "Purpose-built booking and enquiry paths that collect the information your team needs before picking up the phone."],
  ["Leads with context", "Finance, trade-in and product enquiries routed with the vehicle, page and customer details attached."],
  ["A useful management layer", "Control stock, content, enquiries and operational settings without turning every update into a developer request."],
  ["Search-ready foundations", "Fast pages, structured information, indexable inventory and a content architecture designed around real buying searches."],
];

export default function WebsitesPage() {
  return (
    <main>
      <section className="subpage-hero">
        <div className="shell subpage-hero-grid">
          <div>
            <p className="eyebrow"><span />Dealer website development</p>
            <h1>A dealer website should do more than list a phone number.</h1>
            <p className="hero-lead">We build fast, custom websites for dealerships with stock to sell, departments to connect and customers who expect useful answers online.</p>
            <div className="button-row">
              <Link className="button button-primary" href="/contact">Discuss your website <span>↗</span></Link>
              <a className="text-link" href="https://www.scootershop.com.au/" target="_blank" rel="noreferrer">See the live example <span>→</span></a>
            </div>
          </div>
          <DealerSystemVisual />
        </div>
      </section>

      <section className="section shell intro-section">
        <div><p className="section-number">01 / The difference</p><h2>From brochure site to useful sales system.</h2></div>
        <p className="section-intro">Your customer should be able to explore stock, understand the offer and take the right next step. Your team should receive a useful enquiry and have practical tools to manage what happens next.</p>
      </section>

      <section className="shell comparison-table" aria-label="Comparison between a brochure website and a dealer system">
        <div className="comparison-head"><span>Typical brochure website</span><span>Free the Desk dealer system</span></div>
        <div><span>Generic gallery or embedded stock feed</span><strong>Searchable, structured inventory built around how you sell</strong></div>
        <div><span>One contact form for everything</span><strong>Product, parts, service, finance and trade-in enquiry paths</strong></div>
        <div><span>Manual follow-up and re-keying</span><strong>Useful lead context, routing and automation</strong></div>
        <div><span>Pages added after someone asks</span><strong>Search architecture planned around products, services and locations</strong></div>
        <div><span>Template administration</span><strong>Management tools shaped around the dealership</strong></div>
      </section>

      <section className="section shell">
        <div className="narrow-heading"><p className="section-number">02 / Capabilities</p><h2>Build the parts your dealership actually needs.</h2></div>
        <div className="capability-grid">
          {capabilities.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="section dark-band">
        <div className="shell split-content">
          <div><p className="section-number section-number-light">03 / A sensible first release</p><h2>Launch the high-value version first.</h2></div>
          <div><p>A dealer platform can grow quickly. We start with the customer journeys and internal tools that create the clearest commercial value, then expand from real usage.</p><ul className="check-list"><li>Clear fixed scope for the first release</li><li>Mobile-first design and production build</li><li>Migration and launch planning</li><li>Training, documentation and ongoing support</li></ul></div>
        </div>
      </section>

      <section className="shell closing-cta closing-cta-light">
        <p className="eyebrow"><span />Have a current dealer site?</p>
        <h2>Let’s find what it is leaving on the table.</h2>
        <p>Send us the URL and tell us which part of the business deserves a better online experience.</p>
        <Link className="button button-primary" href="/contact">Request a website review <span>↗</span></Link>
      </section>
    </main>
  );
}

