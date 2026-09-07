import type { Metadata } from "next";
import Link from "next/link";

import { FlowHeroConcept } from "../home-v3/FlowHeroConcept";
import { ContactEnquiry } from "../contact/ContactEnquiry";
import { Faq } from "@/components/Faq";
import { PageSchema } from "@/components/PageSchema";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { ServiceScroll } from "@/components/ServiceScroll";
import { pageMetadata } from "@/lib/seo";
import { websiteServices } from "./websiteServices";
import styles from "./page.module.css";

const TITLE = "Website Development Perth | Custom Websites & Web Apps";
const DESCRIPTION = "Perth website development for businesses that need more than a template: custom websites, ecommerce, integrations and practical web applications.";
const PATH = "/website-development";

const websiteDevStats: [ProofStat, ProofStat, ProofStat] = [
  { value: "50%", label: "Won't consider you", description: "Of consumers who won't consider a business with no website, per industry research." },
  { value: "4", label: "Stages, every project", description: "Understand, design, build, improve—the same process each time." },
  { value: "AI", label: "Are you AI ready?", description: "At a minimum you should meet Google's 3 recommendations." },
];

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, absoluteTitle: true });

const process = [
  ["Understand", "We learn the offer, audience, existing systems and commercial goal before deciding what belongs in the build."],
  ["Design", "We shape the structure and important interactions first, with mobile treated as the main experience—not an afterthought."],
  ["Build", "We develop the production site, connect the necessary systems and test the complete customer journey."],
  ["Improve", "Launch is the start of useful evidence. We monitor, maintain and refine the site from how people actually use it."],
];

const processIcons = [
  <svg key="understand" viewBox="0 0 24 24" width="24" height="24" fill="none"><circle cx="10" cy="10" r="6" stroke="#fff" strokeWidth="1.6" /><path d="M14.5 14.5 20 20" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  <svg key="design" viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M4 20l1-4L15 6l3 3-10 10-4 1Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></svg>,
  <svg key="build" viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M14.7 6.3a3.5 3.5 0 0 0-4.6 4.6L4 17l3 3 6.1-6.1a3.5 3.5 0 0 0 4.6-4.6l-2.3 2.3-2-2 2.3-2.3Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></svg>,
  <svg key="improve" viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M4 17l5-5 4 4 7-7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 8h5v5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];

const questions = [
  ["How much does a website cost?", "It depends on whether you need a focused marketing site, ecommerce, custom workflows or integrations. We define the useful first release and give you a clear scope before development begins."],
  ["Can you replace or improve an existing site?", "Yes. We can rebuild it, preserve useful content and search equity, or improve one high-value part without replacing everything at once."],
  ["Do you work with businesses outside the automotive industry?", "Yes. Our dealership work proves the operational depth of what we build, but the same approach suits Perth service, retail, equipment, trade and specialist businesses."],
  ["Will the website work properly on mobile?", "Yes. We design mobile-first, then use the extra room on larger screens deliberately. Forms, navigation, product pages and conversion paths are tested across practical viewport sizes."],
];

export default function WebsiteDevelopmentPage() {
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
      <PageSchema title={TITLE} description={DESCRIPTION} path={PATH} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <FlowHeroConcept
        eyebrow="Website development Perth"
        title="Built as a system."
        accentTitle="Not just a page."
        lead="A website is the part your customers see. We build the part that saves your team hours every week—automated notifications, supplier syncs and booking workflows behind a site that also happens to look good."
        primaryHref="#enquiry"
        primaryLabel="Discuss your website"
        secondaryHref="/portfolio/scooter-shop"
        secondaryLabel="See what we build"
        stages={["Understand", "Design", "Build", "Improve"]}
      />

      <ProofStrip stats={websiteDevStats} />

      <section className={`shell ${styles.enquirySection}`} id="enquiry">
        <ContactEnquiry defaultHelpWith="business-website" />
      </section>

      <section className={`shell ${styles.intro}`}>
        <div><p className={styles.label}>01 / What you&apos;re buying</p><h2>Not a website.<br />A system with a job to do.</h2></div>
        <div><p>A basic website is a brochure: a handful of pages that look fine on launch day and do nothing after that.</p><p>What we build behaves more like software—it watches stock, sends the alerts, writes the routine emails and keeps working on search long after launch. The pages you see are just the part your customers notice.</p></div>
      </section>

      <section className={styles.servicesSection} id="services">
        <div className="shell">
          <div className={styles.sectionHeading}><p className={styles.label}>02 / What we build</p><h2>The website is the easy part.</h2></div>
          <p className={styles.servicesClosing}>Anyone can put your stock on a nice-looking page. We build the parts behind it that save you actual hours.</p>
        </div>
        <div className="shell">
          <ServiceScroll services={websiteServices} showCustomRow={false} />
        </div>
      </section>

      <section className={`shell ${styles.seoSection}`} id="seo">
        <div className={styles.seoCopy}>
          <p className={styles.label}>03 / Continuous SEO</p>
          <h2>Honest SEO.</h2>
          <p>SEO is one of the most oversold services on the internet. Anyone promising fast, guaranteed rankings is either wrong or lying—real search growth compounds slowly, over months, not weeks.</p>
          <p>Every site we build launches with the technical and on-page foundations done properly, no extra charge. Ongoing improvement past that point is optional, priced honestly, and stops the moment it stops earning its keep.</p>
        </div>
        <div className={styles.seoCard}>
          <header className={styles.seoCardHead}>
            <span>Ongoing, data-driven SEO</span>
            <b>$50/mo</b>
          </header>
          <ul className={styles.seoIncluded}>
            <li>Strong technical &amp; on-page foundation, included on every site we build</li>
            <li>Monthly review of rankings, competitors and search data</li>
            <li>Changes made from evidence, not guesses</li>
          </ul>
          <p className={styles.seoWarning}><strong>Early gains can be large. Long-term SEO is slow.</strong> Anyone telling you otherwise is selling something.</p>
          <p className={styles.seoHonesty}>When we stop finding worthwhile improvements, we&apos;ll say so—and turn it off. No agency should keep charging for work that isn&apos;t working.</p>
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
          <p className={styles.label}>04 / Beyond the surface</p>
          <h2>Design the customer experience and the handoff.</h2>
          <p>A polished page is only half the work. We also think about what information is captured, where it goes, what the customer sees next and how your team follows it through.</p>
          <ul><li>Useful information attached to every enquiry</li><li>Payments and forms designed as one journey</li><li>Content your team can actually manage</li><li>Integrations where they remove repeated work</li></ul>
        </div>
      </section>

      <section className="approach-section">
        <div className={`shell approach-inner ${styles.approachInner}`}>
          <p className={styles.label}>05 / How we work</p>
          <h2>Same process.<br /><span className="ai-ready-ai">Every project.</span></h2>
          <p className="approach-lead">Clear stages keep every build moving predictably—from understanding the business through to a site your team can actually run.</p>
          <ol className="approach-steps">
            {process.map(([title, body], index) => (
              <li className="approach-step" key={title}>
                <div className="approach-step-rail">
                  <span className="approach-step-icon" aria-hidden="true">{processIcons[index]}</span>
                  {index < process.length - 1 && <span className="approach-step-line" />}
                </div>
                <div className="approach-step-body">
                  <span className="approach-step-index">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`shell ${styles.proofSection}`}>
        <div>
          <p className={styles.label}>06 / See the depth</p>
          <h2>Built from real operational experience.</h2>
        </div>
        <div>
          <p>Our work for Scooter Shop combines inventory, parts diagrams, online purchasing, service journeys, focused search pages and management tools. It is industry-specific work, but it shows the level of thinking we bring to any complex website.</p>
          <div className={styles.linkRow}><Link href="/portfolio/scooter-shop">View the case study <span>→</span></Link><Link href="/dealership-website-builder">Try the interactive demo <span>↗</span></Link></div>
        </div>
      </section>

      <Faq
        eyebrow="07 / Common questions"
        title="Before we begin."
        items={questions.map(([question, answer]) => ({ question, answer }))}
      />

      <section className={`shell ${styles.closing}`}>
        <p className={styles.label}>Start with the useful part</p>
        <h2>What should your website make easier?</h2>
        <p>Tell us what you sell, who the site is for and where the current process gets in the way.</p>
        <Link href="#enquiry">Talk about your project <span>↗</span></Link>
      </section>
    </main>
  );
}
