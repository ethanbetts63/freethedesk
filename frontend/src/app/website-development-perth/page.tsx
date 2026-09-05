import type { Metadata } from "next";
import Link from "next/link";

import { FlowHeroConcept } from "../home-v3/FlowHeroConcept";
import { ContactForm } from "../contact/ContactForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Website Development Perth | Custom Websites & Web Apps",
  description: "Perth website development for businesses that need more than a template: custom websites, ecommerce, integrations and practical web applications.",
  alternates: { canonical: "/website-development-perth" },
};

const services = [
  ["Stock and pricing that update themselves", "If your suppliers publish stock or pricing anywhere—even without a proper API—we build a sync that checks it on a schedule, so nobody is cross-referencing a spreadsheet by hand."],
  ["The moment something happens, you know", "A new order, a booking, an enquiry, a failed sync. SMS and email alerts land the second it matters, not whenever someone next opens a dashboard."],
  ["Every routine email, already written", "Order confirmations, booking reminders, status updates. Sent automatically the moment they are triggered, never drafted from scratch."],
  ["Your calendar and your other tools, in sync", "If you already run a booking or job system, we connect it to your website instead of asking your team to enter the same thing twice."],
];

const process = [
  ["Understand", "We learn the offer, audience, existing systems and commercial goal before deciding what belongs in the build."],
  ["Design", "We shape the structure and important interactions first, with mobile treated as the main experience—not an afterthought."],
  ["Build", "We develop the production site, connect the necessary systems and test the complete customer journey."],
  ["Improve", "Launch is the start of useful evidence. We monitor, maintain and refine the site from how people actually use it."],
];

const questions = [
  ["How much does a website cost?", "It depends on whether you need a focused marketing site, ecommerce, custom workflows or integrations. We define the useful first release and give you a clear scope before development begins."],
  ["Can you replace or improve an existing site?", "Yes. We can rebuild it, preserve useful content and search equity, or improve one high-value part without replacing everything at once."],
  ["Do you work with businesses outside the automotive industry?", "Yes. Our dealership work proves the operational depth of what we build, but the same approach suits Perth service, retail, equipment, trade and specialist businesses."],
  ["Will the website work properly on mobile?", "Yes. We design mobile-first, then use the extra room on larger screens deliberately. Forms, navigation, product pages and conversion paths are tested across practical viewport sizes."],
];

export default function WebsiteDevelopmentPerthPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Website Development Perth",
    serviceType: "Website development and web application development",
    areaServed: { "@type": "City", name: "Perth" },
    provider: { "@type": "Organization", name: "Free the Desk", url: "https://freethedesk.com.au" },
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <FlowHeroConcept
        eyebrow="Website development Perth"
        title="Built as a system."
        accentTitle="Not just a page."
        lead="A website is the part your customers see. We build the part that saves your team hours every week—automated notifications, supplier syncs and booking workflows behind a site that also happens to look good."
        primaryHref="#enquiry"
        primaryLabel="Discuss your website"
        secondaryHref="/work/scooter-shop"
        secondaryLabel="See what we build"
        stages={["Understand", "Design", "Build", "Improve"]}
      />

      <section className={`shell ${styles.enquirySection}`} id="enquiry">
        <div className={styles.enquiryWrap}>
          <div className="contact-form-wrap">
            <h2>Tell us about the business.</h2>
            <p>No polished brief needed. Start with the problem.</p>
            <ContactForm />
          </div>
        </div>
      </section>

      <section className={`shell ${styles.intro}`}>
        <div><p className={styles.label}>01 / The approach</p><h2>A website with a job to do.</h2></div>
        <div><p>Good design earns attention. Clear structure helps people make a decision. The right technology removes work for the team behind it.</p><p>We bring those parts together around a real business outcome: better enquiries, online sales, easier bookings, clearer information or a process that no longer needs to live in an inbox.</p></div>
      </section>

      <section className={styles.servicesSection} id="services">
        <div className="shell">
          <div className={styles.sectionHeading}><p className={styles.label}>02 / What we build</p><h2>The website is the easy part.</h2></div>
          <div className={styles.serviceGrid}>
            {services.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}
          </div>
          <p className={styles.servicesClosing}>Anyone can put your stock on a nice-looking page. We build the parts behind it that save you actual hours.</p>
        </div>
      </section>

      <section className={`shell ${styles.systemSection}`}>
        <div className={styles.systemVisual} aria-hidden="true">
          <div className={styles.browser}><i /><i /><i /><span>yourbusiness.com.au</span></div>
          <div className={styles.visualBody}>
            <div className={styles.visualPage}><span /><strong /><i /><i /><i /></div>
            <div className={styles.visualFlow}><b>Website</b><em>→</em><b>Enquiry</b><em>→</em><b>Your team</b></div>
          </div>
        </div>
        <div className={styles.systemCopy}>
          <p className={styles.label}>03 / Beyond the surface</p>
          <h2>Design the customer experience and the handoff.</h2>
          <p>A polished page is only half the work. We also think about what information is captured, where it goes, what the customer sees next and how your team follows it through.</p>
          <ul><li>Useful information attached to every enquiry</li><li>Payments and forms designed as one journey</li><li>Content your team can actually manage</li><li>Integrations where they remove repeated work</li></ul>
        </div>
      </section>

      <section className={styles.processSection}>
        <div className="shell">
          <div className={styles.sectionHeading}><p className={styles.label}>04 / How we work</p><h2>Clear enough to move quickly.</h2></div>
          <div className={styles.processGrid}>{process.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
        </div>
      </section>

      <section className={`shell ${styles.proofSection}`}>
        <div>
          <p className={styles.label}>05 / See the depth</p>
          <h2>Built from real operational experience.</h2>
        </div>
        <div>
          <p>Our work for Scooter Shop combines inventory, parts diagrams, online purchasing, service journeys, focused search pages and management tools. It is industry-specific work, but it shows the level of thinking we bring to any complex website.</p>
          <div className={styles.linkRow}><Link href="/work/scooter-shop">View the case study <span>→</span></Link><Link href="/dealership-website-builder">Try the interactive demo <span>↗</span></Link></div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={`shell ${styles.faqLayout}`}>
          <div><p className={styles.label}>06 / Common questions</p><h2>Before we begin.</h2></div>
          <div className={styles.faqList}>{questions.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
        </div>
      </section>

      <section className={`shell ${styles.closing}`}>
        <p className={styles.label}>Start with the useful part</p>
        <h2>What should your website make easier?</h2>
        <p>Tell us what you sell, who the site is for and where the current process gets in the way.</p>
        <Link href="#enquiry">Talk about your project <span>↗</span></Link>
      </section>
    </main>
  );
}
