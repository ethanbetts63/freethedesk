import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Online Licensing for Dealers",
  description: "Sell a vehicle without the customer coming in. Identity verified, contract signed and licensing paperwork prefilled — ready to lodge.",
};

const steps = [
  ["You enter the vehicle", "Your business details are already on file. Add the bike, the price and the buyer's email, and send the link."],
  ["They prove who they are", "Photo ID and a matching selfie, checked before anything is signed. You see the licence; we never store the image."],
  ["They sign", "The sale contract and the licensing forms, filled from details they entered themselves. No re-keying, no posting forms back and forth."],
  ["You lodge it", "A complete, signed pack ready to upload into Dealer Online or take to the counter. Ninety seconds of work."],
];

const capabilities = [
  ["Right form, every time", "Statutory warranty, no warranty, excluded defects — the correct notice is selected from the vehicle's age, price and odometer, and given before the sale like the regulations require."],
  ["Your conditions, your call", "Start from our reviewed special conditions, approve each one, remove what doesn't fit your dealership and add your own. We never decide for you."],
  ["An audit trail that holds up", "Who signed, when, what they were shown and what they acknowledged — timestamped. The record you want when a customer disputes something months later."],
  ["Payment your way", "Take the money into your own account by bank transfer and confirm it in the portal. No card fee carved out of a $15,000 sale."],
];

export default function DealersPage() {
  return (
    <main>
      <section className="subpage-hero">
        <div className="shell subpage-hero-grid">
          <div>
            <p className="eyebrow"><span />Online licensing</p>
            <h1>Sell the bike. Skip the counter.</h1>
            <p className="hero-lead">
              Your customer verifies their identity, gives you their details and signs — from wherever they are. You get a complete licensing pack ready to lodge. No appointment, no paperwork in the post.
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="/dealers/signup">Create a dealer account <span>↗</span></Link>
              <Link className="text-link" href="/contact">Ask us a question <span>→</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell intro-section">
        <div><p className="section-number">01 / The problem</p><h2>Everyone else still needs them in the showroom.</h2></div>
        <p className="section-intro">
          A handful of car dealerships sell remotely. A few more manage it over a long chain of emails and scanned forms. For motorcycles, almost nobody does it properly — which means every sale outside your suburb is a sale you have to talk someone into driving for.
        </p>
      </section>

      <section className="section shell">
        <div className="narrow-heading"><p className="section-number">02 / How it works</p><h2>Four steps, and only one of them is yours.</h2></div>
        <div className="capability-grid">
          {steps.map(([title, body], index) => (
            <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>
          ))}
        </div>
      </section>

      <section className="section dark-band">
        <div className="shell split-content">
          <div><p className="section-number section-number-light">03 / Why identity matters</p><h2>The counter was doing more than you think.</h2></div>
          <div>
            <p>
              When a customer stands in front of you, the licence number goes into the system while a human looks at the person holding the card. Sell remotely and those two checks come apart — the record still matches, but nothing ties the person typing it to the licence.
            </p>
            <p>
              No rule tells you to close that gap, which also means there is no procedure to point at if it is ever used against you. So we close it by default: document check, matching selfie, and a comparison against the address on the licence, before anything is signed.
            </p>
            <ul className="check-list">
              <li>Photo ID checked against known fraudulent templates</li>
              <li>Selfie face-matched to the document</li>
              <li>Delivery address compared to the licence</li>
              <li>Every check recorded against the sale</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="narrow-heading"><p className="section-number">04 / What you get</p><h2>Built by people who have done the paperwork.</h2></div>
        <div className="capability-grid">
          {capabilities.map(([title, body], index) => (
            <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>
          ))}
        </div>
      </section>

      <section className="section shell intro-section">
        <div><p className="section-number">05 / Where we start</p><h2>Western Australia, motorcycles.</h2></div>
        <p className="section-intro">
          The forms, the thresholds and the rules are state and vehicle specific, so we would rather do one properly than four badly. WA motorcycle and moped dealers first, with other vehicle types and states to follow. If you sell something else, tell us — it helps us decide what comes next.
        </p>
      </section>

      <section className="shell closing-cta closing-cta-light">
        <p className="eyebrow"><span />Licensed WA dealer?</p>
        <h2>Set up an account and see the flow.</h2>
        <p>Signing up takes a minute and commits you to nothing. We review every dealership by hand before switching an account on.</p>
        <Link className="button button-primary" href="/dealers/signup">Create a dealer account <span>↗</span></Link>
      </section>
    </main>
  );
}
