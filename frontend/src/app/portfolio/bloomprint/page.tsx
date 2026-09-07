import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PageSchema } from "@/components/PageSchema";
import { ProofStrip } from "@/components/ProofStrip";
import { pageMetadata } from "@/lib/seo";

import { BloomprintTour } from "./_components/BloomprintTour";

const TITLE = "Bloomprint Flower Marketplace Case Study";
const DESCRIPTION = "A two-sided flower delivery marketplace: brief-led ordering for customers, paid local orders for independent florists, and a landing page system built to be found.";
const PATH = "/portfolio/bloomprint";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: "/case-studies/bloomprint/home-desktop.png",
});

const capabilities = [
  "Brief builder",
  "Custom budgets",
  "Checkout",
  "Delivery scheduling",
  "Florist onboarding",
  "Order routing",
  "Subscriptions",
  "Landing pages",
];

const customerSteps = [
  { number: "01", detail: "Choose an occasion and the feeling behind it." },
  { number: "02", detail: "Set the budget — a tier, or any custom amount from $65." },
  { number: "03", detail: "Add favourite colours, dislikes, allergies and special requests." },
  { number: "04", detail: "Pick the delivery date and write the card message." },
  { number: "05", detail: "Pay once. Delivery is included over $100." },
];

const floristSteps = [
  { number: "01", detail: "Join free with a two-step store account." },
  { number: "02", detail: "Receive fully paid local orders near the store." },
  { number: "03", detail: "Take the ones that suit the week's stock and diary." },
  { number: "04", detail: "Design from what is fresh instead of a fixed recipe." },
  { number: "05", detail: "Deliver under the store's own name and brand." },
];

const frontDoors = [
  {
    number: "01",
    title: "Cities",
    pages: ["Flower Delivery Perth", "Flower Delivery Sydney", "Flower Delivery Melbourne", "Flower Delivery Brisbane", "Flower Delivery Adelaide", "Flower Delivery Hobart"],
  },
  {
    number: "02",
    title: "Occasions",
    pages: ["Birthday Flowers", "Valentine's Day Flowers", "Mother's Day Flowers", "Send Flowers from Overseas"],
  },
  {
    number: "03",
    title: "Recurring & business",
    pages: ["Flower Subscription", "Corporate Flower Subscriptions", "Pricing", "For Florists", "Affiliates"],
  },
  {
    number: "04",
    title: "Guides",
    pages: ["Best Flower Subscriptions Australia", "Best Flower Delivery Perth", "Best Flower Delivery Sydney", "Best Flower Delivery Melbourne", "All Articles"],
  },
];

export default function BloomprintCaseStudy() {
  return (
    <main className="bloom-case-page">
      <PageSchema title={TITLE} description={DESCRIPTION} path={PATH} />

      <section className="bloom-hero">
        <div className="bloom-hero-grid" aria-hidden="true" />
        <div className="shell bloom-hero-layout">
          <div className="bloom-hero-copy">
            <p className="eyebrow"><span />Bloomprint case study</p>
            <h1>Not a catalogue.<br /><span>A brief.</span></h1>
            <p>A national flower delivery marketplace where the customer describes what they want and an independent local florist designs it. Customer ordering, florist supply and organic growth built as one product.</p>
            <div className="button-row">
              <a className="button button-primary" href="https://www.bloomprint.com.au/" target="_blank" rel="noreferrer">Visit the live website <span>↗</span></a>
              <a className="text-link" href="#tour">Explore the build <span>↓</span></a>
            </div>
            <div className="bloom-hero-meta">
              <span>Strategy</span><span>Design</span><span>Development</span><span>SEO</span>
            </div>
          </div>

          <div className="bloom-hero-media">
            <div className="case-browser case-browser-hero">
              <div className="case-browser-bar"><i /><i /><i /><span>www.bloomprint.com.au</span></div>
              <Image src="/case-studies/bloomprint/home-desktop.png" alt="Bloomprint homepage with the order builder open" width={1440} height={681} priority />
            </div>
            <div className="case-live-note"><i /> Live marketplace</div>
          </div>
        </div>
      </section>

      <ProofStrip
        id="build"
        stats={[
          { value: "02", label: "Sides of a marketplace", description: "Customer ordering and florist supply designed as one system." },
          { value: "06", label: "Delivery cities live", description: "Perth, Sydney, Melbourne, Brisbane, Adelaide and Hobart." },
          { value: "20+", label: "Pages built to be found", description: "City, occasion, subscription and guide pages feeding one order engine." },
        ]}
      />

      <section className="section shell case-story-intro">
        <p className="section-number">01 / The brief</p>
        <div>
          <h2>Sell a brief,<br />not a bouquet photo.</h2>
          <p>Online flower delivery usually means scrolling near-identical warehouse bouquets and hoping the photo resembles what turns up. Bloomprint works the other way around: the customer sets the occasion, the budget and their preferences, and an independent florist near the recipient designs to that brief from what is fresh that day.</p>
          <p>That is a harder website. It needs an ordering experience that captures intent instead of a product ID, a supply-side product that convinces working florists to sign up, and enough of a search presence to sell a name nobody is looking up yet.</p>
          <div className="case-capability-list">
            {capabilities.map((capability) => <span key={capability}>{capability}</span>)}
          </div>
        </div>
      </section>

      <section className="case-tour-section" id="tour">
        <div className="shell">
          <div className="case-section-heading">
            <p className="section-number">02 / The experience</p>
            <h2>Four journeys,<br />one order engine.</h2>
            <p>Select a part of the marketplace to explore the live experience.</p>
          </div>
          <BloomprintTour />
        </div>
      </section>

      <section className="case-operations-section">
        <div className="shell">
          <div className="case-operations-heading">
            <div>
              <p className="section-number section-number-light">03 / Both sides</p>
              <h2>A marketplace only<br />works twice.</h2>
            </div>
            <p>A customer journey that ends in a beautiful order is worthless if no florist wants to make it. Both sides were designed together, so what the customer is asked for is exactly what the florist needs to start work.</p>
          </div>

          <div className="bloom-sides">
            <article className="bloom-side">
              <header><small>Demand</small><h3>The customer</h3><p>Describes the outcome and pays once — no catalogue, no surprises at checkout.</p></header>
              <ol>
                {customerSteps.map((step) => (
                  <li key={step.number}><b>{step.number}</b><span>{step.detail}</span></li>
                ))}
              </ol>
            </article>
            <article className="bloom-side bloom-side-alt">
              <header><small>Supply</small><h3>The florist</h3><p>Gets paid work near the shop with the creative freedom to design it properly.</p></header>
              <ol>
                {floristSteps.map((step) => (
                  <li key={step.number}><b>{step.number}</b><span>{step.detail}</span></li>
                ))}
              </ol>
            </article>
          </div>
        </div>
      </section>

      <section className="section shell bloom-split">
        <div className="bloom-split-copy">
          <p className="section-number">04 / Pricing as a product decision</p>
          <h2>The budget is set before anything is designed.</h2>
          <p>Most flower sites reveal the real price at checkout. Here the customer names the amount — a tier or any custom figure — and that is what they pay, with delivery included over $100. It removes the biggest reason gift buyers abandon an order, and it gives the florist a firm number to design against.</p>
          <div className="bloom-split-points"><span>Customer-set budgets</span><span>Delivery included over $100</span><span>No checkout markup</span><span>A firm brief for the florist</span></div>
        </div>
        <div className="bloom-split-media">
          <div className="case-browser">
            <div className="case-browser-bar"><i /><i /><i /><span>www.bloomprint.com.au/pricing</span></div>
            <Image src="/case-studies/bloomprint/pricing-desktop.png" alt="Bloomprint pricing page explaining budget-led ordering" width={1440} height={681} />
          </div>
        </div>
      </section>

      <section className="bloom-seo-section">
        <div className="shell bloom-split bloom-split-reverse">
          <div className="bloom-split-copy">
            <p className="section-number">05 / Built to be found</p>
            <h2>A new brand needs pages people are already searching for.</h2>
            <p>Nobody searches for a marketplace that launched last month. They search for flower delivery in their city, for a subscription, for Mother&apos;s Day, or for a comparison of who is actually any good. The content and landing page structure was built around those searches from the first sprint, not bolted on later.</p>
            <div className="bloom-split-points"><span>City landing pages</span><span>Occasion pages</span><span>Comparison guides</span><span>Internal linking</span></div>
          </div>
          <div className="bloom-split-media">
            <div className="case-browser">
              <div className="case-browser-bar"><i /><i /><i /><span>www.bloomprint.com.au/articles</span></div>
              <Image src="/case-studies/bloomprint/guides-desktop.png" alt="Bloomprint guides and articles index" width={1440} height={681} />
            </div>
          </div>
        </div>
      </section>

      <section className="case-intent-section">
        <div className="shell">
          <div className="case-intent-heading">
            <div>
              <p className="section-number">06 / Front doors</p>
              <h2>Many ways in.<br />One way to order.</h2>
            </div>
            <p>Each page speaks to a different search, then hands the visitor the same order builder — already framed around their city, their occasion or the way they want flowers to arrive. New front doors can be added without rebuilding the thing behind them.</p>
          </div>

          <div className="case-intent-grid">
            {frontDoors.map((group) => (
              <article key={group.number}>
                <header><span>{group.number}</span><h3>{group.title}</h3></header>
                <ul>{group.pages.map((page) => <li key={page}>{page}<span>↗</span></li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="shell closing-cta">
        <p className="eyebrow eyebrow-light"><span />Your idea</p>
        <h2>Have something more complicated than a brochure site?</h2>
        <p>Marketplaces, booking flows, portals and anything with two audiences. Tell us what the business actually has to do and we&apos;ll show you how it would work.</p>
        <div className="button-row">
          <Link className="button button-lime" href="/contact">Talk about your build <span>→</span></Link>
          <a className="case-cta-live-link" href="https://www.bloomprint.com.au/" target="_blank" rel="noreferrer">Visit Bloomprint ↗</a>
        </div>
      </section>
    </main>
  );
}
