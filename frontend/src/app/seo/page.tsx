import type { Metadata } from "next";
import Link from "next/link";

import { FlowHeroConcept } from "../home-v3/FlowHeroConcept";
import { Faq } from "@/components/Faq";
import { PageSchema } from "@/components/PageSchema";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { pageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

const TITLE = "SEO Recommendations, Not a Retainer";
const DESCRIPTION = "Give us read access to your Google Search Console, Analytics and Business Profile, and get a monthly report of prioritised SEO recommendations for $50/mo. No lock-in, no agency retainer, and we never touch your site.";
const PATH = "/seo";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, absoluteTitle: true });

const reviewItems = [
  ["Google Business Profile", "How many people called, requested directions or viewed your profile—the actions that actually turn into customers, not just where you happen to rank."],
  ["Rankings & traffic", "Which keywords and pages moved up or down since last month, and where the real opportunity is sitting right now."],
  ["Technical health", "Broken links, slow pages, missing metadata, crawl errors—the unglamorous fixes that quietly cap how well a good page can perform."],
  ["What competitors changed", "New pages, new reviews, new rankings from the businesses you're actually competing with in local search results."],
];

const steps = [
  ["Connect", "Grant read-only access to Search Console, Analytics and your Google Business Profile. Nothing to install, nothing on your site to touch."],
  ["Review", "Every month we go through the data—rankings, traffic, technical issues, competitor movement—and work out what's actually worth doing next."],
  ["Recommend", "You get a plain-English report: a short, prioritised list of what to fix or build next, ranked by impact and effort."],
  ["Repeat", "Make the changes yourself, with your web person, or with whatever platform you already use—then we check what moved and go again next month."],
];

const stepIcons = [
  <svg key="connect" viewBox="0 0 24 24" width="24" height="24" fill="none"><circle cx="7" cy="7" r="2.6" stroke="#fff" strokeWidth="1.6" /><circle cx="17" cy="17" r="2.6" stroke="#fff" strokeWidth="1.6" /><path d="M9.2 9.2l5.6 5.6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  <svg key="review" viewBox="0 0 24 24" width="24" height="24" fill="none"><circle cx="10" cy="10" r="6" stroke="#fff" strokeWidth="1.6" /><path d="M14.5 14.5 20 20" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  <svg key="recommend" viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11.2c.6.4 1 1.1 1 1.8h4c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></svg>,
  <svg key="repeat" viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /><path d="M18 4v4h-4M6 20v-4h4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];

const seoStats: [ProofStat, ProofStat, ProofStat] = [
  { value: "$50", label: "Flat, per month", description: "One price. No setup fee, no lock-in contract, cancel any time." },
  { value: "$1,000+", label: "What agencies usually charge", description: "Typical monthly retainer for ongoing SEO management, per current industry pricing." },
  { value: "0", label: "Changes we make for you", description: "We hand you the recommendations—you, or whoever runs your site, decide what to build." },
];

const questions = [
  ["What access do you actually need?", "Read-only access to Google Search Console, Google Analytics and your Google Business Profile. We can't edit your site, change your listing, or see anything outside those three."],
  ["Do you make the changes for us?", "No—we hand you a prioritised list and explain each recommendation in plain English. You, your web person, or whatever platform you already use (GoDaddy, Wix, Squarespace and the rest) can put it live yourselves."],
  ["What if a recommendation needs real development work?", "Some do. If that happens, we'll say so plainly, and you can decide whether it's worth talking to us—or anyone else—about building it. There's no obligation either way."],
  ["How is this different to a normal SEO agency?", "Most agencies charge $1,000 to $2,500+ a month to run the strategy and make the changes themselves. We charge $50 a month to tell you what we'd do—no execution, no long contract, no vanity metrics."],
  ["What happens when there's nothing left to improve?", "We tell you. If a month's report has no worthwhile recommendation, it says so—and suggests you cancel. We'd rather lose the $50 than keep charging for nothing."],
];

export default function SeoPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Monthly SEO Recommendations",
    serviceType: "SEO consulting and reporting",
    areaServed: { "@type": "Country", name: "Australia" },
    provider: { "@type": "Organization", name: "Free the Desk", url: "https://freethedesk.com.au" },
    offers: {
      "@type": "Offer",
      price: "50",
      priceCurrency: "AUD",
      priceSpecification: { "@type": "UnitPriceSpecification", price: "50", priceCurrency: "AUD", unitText: "MONTH" },
    },
  };

  return (
    <main className={styles.page}>
      <PageSchema title={TITLE} description={DESCRIPTION} path={PATH} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <FlowHeroConcept
        eyebrow="Monthly SEO recommendations"
        title="SEO advice."
        accentTitle="Not a retainer."
        lead="Full-service SEO agencies charge $1,000 to $2,500+ a month to manage your search strategy for you. We charge $50 a month to look at your own Google data and tell you exactly what to do next—so you or whoever runs your site can make the change yourselves."
        primaryHref="/contact"
        primaryLabel="Start your first report"
        secondaryHref="#how-it-works"
        secondaryLabel="See how it works"
        stages={["Connect", "Review", "Recommend", "Repeat"]}
      />

      <ProofStrip stats={seoStats} />

      <section className={`shell ${styles.introSection}`}>
        <p className={styles.label}>01 / What's in every report</p>
        <h2>Every business has more SEO opportunities than time to chase them.</h2>
        <p className={styles.introLead}>We start with your own Google data, not guesswork—so the first thing you get is a clear picture of what's actually worth fixing, and what can wait.</p>
        <div className={styles.serviceGrid}>
          {reviewItems.map(([title, body], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="approach-section" id="how-it-works">
        <div className={`shell approach-inner ${styles.approachInner}`}>
          <p className="section-number section-number-light">02 / How it works</p>
          <h2>Simple to start.<br /><span className="ai-ready-ai">Simple to stop.</span></h2>
          <p className="approach-lead">No contract to sign, no software to install, and nothing to undo if it's not for you—just Google data in, recommendations out.</p>
          <ol className="approach-steps">
            {steps.map(([title, body], index) => (
              <li className="approach-step" key={title}>
                <div className="approach-step-rail">
                  <span className="approach-step-icon" aria-hidden="true">{stepIcons[index]}</span>
                  {index < steps.length - 1 && <span className="approach-step-line" />}
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

      <section className={styles.compareSection}>
        <div className={`shell ${styles.compareInner}`}>
          <div className={styles.compareCopy}>
            <p className={styles.label}>03 / Why $50, not $1,000+</p>
            <h2>We&apos;re not selling execution. We&apos;re selling the plan.</h2>
            <p>A traditional agency retainer covers a team making the changes on your behalf—which is real work, and priced like it. We skip that entirely: no access to your site, no build hours, no account manager.</p>
            <p>What&apos;s left is the part that actually needs judgement—reading the data and knowing what&apos;s worth doing next—priced at what that alone is worth.</p>
          </div>
          <div className={styles.priceCard}>
            <header className={styles.priceCardHead}>
              <span>Monthly recommendations</span>
              <b>$50/mo</b>
            </header>
            <ul className={styles.priceIncluded}>
              <li>Full technical, on-page &amp; Google Business Profile review</li>
              <li>A short, ranked list of what to do next—no jargon, no filler</li>
              <li>Direct access to ask questions about any recommendation</li>
            </ul>
            <p className={styles.priceWarning}><strong>Early gains can be large. Long-term SEO is slow.</strong> Anyone promising fast, guaranteed rankings is either wrong or lying.</p>
            <p className={styles.priceHonesty}>When we run out of good ideas, the report will say so—and tell you to cancel. No agency should keep charging for work that isn&apos;t working.</p>
          </div>
        </div>
      </section>

      <Faq
        eyebrow="04 / Common questions"
        title="Before you connect your data."
        items={questions.map(([question, answer]) => ({ question, answer }))}
      />

      <section className={`shell ${styles.closing}`}>
        <p className={styles.label}>Start with your own data</p>
        <h2>What is search actually costing you right now?</h2>
        <p>Connect your Search Console, Analytics and Business Profile, and get your first monthly recommendations report.</p>
        <Link href="/contact">Start your first report <span>↗</span></Link>
      </section>
    </main>
  );
}
