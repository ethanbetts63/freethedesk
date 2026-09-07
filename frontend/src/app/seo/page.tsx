import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AiReadySection } from "../home-v3/AiReadySection";
import { FlowHeroConcept } from "../home-v3/FlowHeroConcept";
import { Faq } from "@/components/Faq";
import { PageSchema } from "@/components/PageSchema";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { ServiceScroll } from "@/components/ServiceScroll";
import { pageMetadata } from "@/lib/seo";
import { formatPrice, getSiteSettingsServer } from "@/lib/serverApi";
import { SeoPlans } from "./SeoPlans";
import { seoServices } from "./seoServices";
import styles from "./page.module.css";

const TITLE = "Quarterly SEO Reports, Not a Retainer";
const DESCRIPTION = "We study your site and your Google Search Console data, then hand you a plain-English report of what to do next—ranked, explained, and honest enough to tell you when to cancel.";
const PATH = "/seo";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, absoluteTitle: true });

const reportSections = [
  ["Last period tracked", "What moved, what didn't."],
  ["Issues", "What's broken or holding you back."],
  ["Opportunities", "Searches you're missing."],
  ["What to do next", "Ranked, with effort estimates."],
];

const reportIcons = [
  <svg key="tracked" viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M3 17l5.5-5.5 3.5 3.5L21 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 6h5v5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  <svg key="issues" viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M12 3.5 22 20H2L12 3.5Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" /><path d="M12 10v4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /><circle cx="12" cy="17" r="1" fill="currentColor" /></svg>,
  <svg key="opportunities" viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.9" /><circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.9" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /></svg>,
  <svg key="next" viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M3 7.5 5 9.5 9 5.5M3 17 5 19l4-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /><path d="M13 8h8M13 17h8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>,
];

const trackItems = [
  ["You implement it", "The report is written for whoever runs your site—you, your web person, or your platform's editor. GoDaddy, Wix, Squarespace and the rest: every recommendation says what to change and why, not just jargon."],
  ["We built your site, so we can do it", "If your site is one of ours, every recommendation arrives with a fixed implementation price at a discounted build rate. Tick the ones you want and they get done—no quotes, no back-and-forth."],
];

const pipelineSteps = [
  ["Machine sweep", "Pre-written crawl code, benchmark data from past projects and pre-planned AI search routines run over your site and your Search Console data."],
  ["Human judgement", "The machines produce a long list of maybes. We cut what doesn't hold up, and add what only experience catches."],
  ["Your report", "What survives becomes a short, ranked, plain-English list—with a straight answer when nothing is worth doing."],
];

const steps = [
  ["Connect", "Read-only Google Search Console. Nothing to install, nothing on your site to touch."],
  ["Study", "We run our machines over your site and your data, then comb through what they find."],
  ["Report", "Your first one arrives within a week—not at the end of the quarter."],
  ["Repeat", "You implement. Next period we check what moved, and go again—until we tell you to stop."],
];

const stepIcons = [
  <svg key="connect" viewBox="0 0 24 24" width="24" height="24" fill="none"><circle cx="7" cy="7" r="2.6" stroke="#fff" strokeWidth="1.6" /><circle cx="17" cy="17" r="2.6" stroke="#fff" strokeWidth="1.6" /><path d="M9.2 9.2l5.6 5.6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  <svg key="study" viewBox="0 0 24 24" width="24" height="24" fill="none"><circle cx="10" cy="10" r="6" stroke="#fff" strokeWidth="1.6" /><path d="M14.5 14.5 20 20" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  <svg key="report" viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11.2c.6.4 1 1.1 1 1.8h4c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></svg>,
  <svg key="repeat" viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /><path d="M18 4v4h-4M6 20v-4h4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];

const casePoints = ["Indexable stock", "Intent-focused pages", "Structured data", "Measured in Search Console"];

const questions = [
  ["What access do you actually need?", "Read-only access to Google Search Console—that's it. We can't edit your site, we don't install anything, and we can't see anything beyond how Google already sees you."],
  ["Why is it so cheap? What's the catch?", "Machines do the collection: pre-written crawl code, benchmark data from our previous projects and pre-planned AI search routines produce a long list of potential issues and opportunities. A person then does the judgement—combing the list, cutting the bad ideas and writing up the rest. It's the same process we run internally on every website we build, so it's already paid for. That's about two hours of real human labour per report, priced like it. The other half of the answer: we're betting some subscribers will eventually want a site built by us, and that's where we earn a fair build rate."],
  ["Do you make the changes for us?", "If we built your site, yes—every recommendation comes with a fixed, discounted implementation price, and you tick what you want done. Otherwise the report is written so you, your web person, or whatever platform you already use (GoDaddy, Wix, Squarespace and the rest) can implement it yourselves."],
  ["Why quarterly instead of monthly?", "Because a change takes roughly 8–12 weeks to show its full effect in Google's data. Monthly reporting mostly charges you to hear 'still waiting'. We do offer monthly for genuinely active phases—a new site, a migration, a competitive push—but we'll tell you when to drop back to quarterly."],
  ["What about AI search—ChatGPT, AI Overviews?", "Search increasingly answers the question directly and cites its sources. The work that earns those citations is the same work that ranks: structured data, fast pages, and clear answers to real questions. Every plan includes a free AI readiness check—whether your site meets Google's three recommendations for AI and agentic browsing: a clean accessibility tree, a stable layout, and an llms.txt file. Every report is then written with both search and AI answers in mind."],
  ["What happens when there's nothing left to improve?", "The report says so and recommends you cancel, or drop to a slower cadence. We'd rather lose the money than keep charging for attention your data doesn't need yet."],
  ["What's the Google Business Profile audit?", "A one-off review of your Google Business Profile: every issue, every field we'd change, and the exact value we'd change it to. It's a one-off because a profile has far fewer levers than a website—and it's free with every report plan."],
];

export default async function SeoPage() {
  const settings = await getSiteSettingsServer();

  const seoStats: [ProofStat, ProofStat, ProofStat] = [
    {
      value: formatPrice(settings.seo_monthly_price),
      label: "SEO Report",
      description: `From ${formatPrice(settings.seo_monthly_price)}. No setup fee, no lock-in contracts.`,
    },
    {
      value: "1",
      label: "Login we need",
      description: "Read-only Google Search Console. Nothing to install, nothing on your site to touch.",
    },
    { value: "AI", label: "Are you AI ready?", description: "At a minimum you should meet Google's 3 recommendations." },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Quarterly SEO Reports",
    serviceType: "SEO consulting and reporting",
    areaServed: { "@type": "Country", name: "Australia" },
    provider: { "@type": "Organization", name: "Free the Desk", url: "https://freethedesk.com.au" },
    offers: {
      "@type": "Offer",
      price: settings.seo_quarterly_price,
      priceCurrency: "AUD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: settings.seo_quarterly_price,
        priceCurrency: "AUD",
        unitText: "QUARTER",
      },
    },
  };

  return (
    <main className={styles.page}>
      <PageSchema title={TITLE} description={DESCRIPTION} path={PATH} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <FlowHeroConcept
        eyebrow="Data Driven SEO Reports"
        title="SEO advice,"
        accentTitle="not a retainer."
        lead={`For ${formatPrice(settings.seo_quarterly_price)} a quarter, we study your site and your Google Search Console data, then hand you a plain-English report of what we'd do next—ranked, explained, and honest enough to tell you when it's time to cancel.`}
        primaryHref="/contact"
        primaryLabel="Get your first report"
        secondaryHref="#plans"
        secondaryLabel="See plans & pricing"
        stages={["Connect", "Study", "Report", "Repeat"]}
      />

      <ProofStrip stats={seoStats} />

      <section className={`shell ${styles.reportSection}`}>
        <div className={styles.reportCopy}>
          <p className={styles.label}>01 / What you&apos;re buying</p>
          <h2>One document.<br />Four sections.</h2>
          <p>Not a dashboard. A report you can read in ten minutes and act on for a quarter.</p>
        </div>

        <div className={styles.reportCard}>
          <header className={styles.reportCardHead}>
            <span className={styles.reportDots} aria-hidden="true"><i /><i /><i /></span>
            <div><strong>Quarterly SEO report</strong><small>Your business · this quarter</small></div>
          </header>
          <ol className={styles.reportList}>
            {reportSections.map(([title, note], index) => (
              <li key={title}>
                <span className={styles.reportIndex}>0{index + 1}</span>
                <span className={styles.reportIcon} aria-hidden="true">{reportIcons[index]}</span>
                <div><h3>{title}</h3><p>{note}</p></div>
              </li>
            ))}
          </ol>
          <footer className={styles.reportCardFoot}>
            <span>Plain English</span><span>Ranked by impact</span><span>Effort estimate on every item</span>
          </footer>
        </div>
      </section>

      <section className={styles.compareSection}>
        <div className={`shell ${styles.compareInner}`}>
          <div className={styles.compareCopy}>
            <p className={styles.label}>02 / Why it&apos;s cheap</p>
            <h2>Two hours of human judgement. That&apos;s what you&apos;re paying for.</h2>
            <p>Most of an SEO audit is collection work—crawling pages, pulling data, checking the same hundred things. We&apos;ve automated that, so you don&apos;t pay agency prices for it.</p>
            <p>It&apos;s the same process we run internally on every website we build. What can&apos;t be automated is deciding what&apos;s actually worth your time—and that&apos;s the two hours you&apos;re buying.</p>
            <p className={styles.priceHonesty}>Still too cheap? We&apos;re betting some subscribers will eventually want a site built by us. That&apos;s where we earn a fair rate—which means every report has to be good enough to earn it.</p>
          </div>
          <div className={styles.pipelineCard}>
            <header className={styles.pipelineHead}>
              <span>How a report gets made</span>
            </header>
            <ol className={styles.pipelineSteps}>
              {pipelineSteps.map(([title, body], index) => (
                <li key={title}>
                  <span>0{index + 1}</span>
                  <div><h3>{title}</h3><p>{body}</p></div>
                </li>
              ))}
            </ol>
            <footer className={styles.pipelineFoot}>
              <strong>~2 hrs</strong>
              <span>of actual expereinced human labour per report.</span>
            </footer>
          </div>
        </div>
      </section>

      <section className="approach-section" id="how-it-works">
        <div className={`shell approach-inner ${styles.approachInner}`}>
          <p className={styles.label}>03 / Why quarterly</p>
          <h2>Google moves in quarters.<br /><span className="ai-ready-ai">So do we.</span></h2>
          <p className="approach-lead">A change takes 8–12 weeks to show its full effect in your data. Quarterly is simply when there&apos;s something new to say.</p>
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

      <section className={`shell ${styles.introSection}`}>
        <p className={styles.label}>04 / Two ways to use it</p>
        <h2>Same report. Your choice of hands.</h2>
        <p className={styles.introLead}>Every plan gets the same study and the same recommendations. The only difference is who does the implementing.</p>
        <div className={`${styles.serviceGrid} ${styles.trackGrid}`}>
          {trackItems.map(([title, body], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`shell ${styles.plansSection}`} id="plans">
        <p className={styles.label}>05 / Plans</p>
        <h2>Pick how often you want to hear from us.</h2>
        <p className={styles.introLead}>Every plan is the same report and the same attention—the cadence is the only variable. Cancel or change any time.</p>
        <SeoPlans settings={settings} />
      </section>

      <section className={`shell ${styles.introSection}`}>
        <p className={styles.label}>06 / What recommendations look like</p>
        <h2>The thinking that shows up in every report.</h2>
        <p className={styles.introLead}>Three examples of the kind of recommendation the report makes—and the standard each one has to meet before it&apos;s allowed to cost you time.</p>
      </section>

      <section className="shell">
        <ServiceScroll services={seoServices} showCustomRow={false} />
      </section>

      <section className={styles.caseSection}>
        <div className={`shell ${styles.caseInner}`}>
          <div className={styles.casePhone}>
            <div className={styles.caseStatOverlay}>
              <small>Google Search Console</small>
              <strong>+200%</strong>
              <span>organic clicks</span>
            </div>
            <div className={styles.casePhoneFrame}>
              <div className="case-mobile-phone">
                <span />
                <div className="case-phone-menu" aria-hidden="true"><i /><i /><i /></div>
                <Image src="/case-studies/scooter-shop/inventory-mobile.png" alt="Scooter Shop inventory page on mobile" width={390} height={844} />
              </div>
            </div>
          </div>
          <div className={styles.caseCopy}>
            <p className={`${styles.label} ${styles.labelLight}`}>07 / Proof this works</p>
            <h2>Scooter Shop, Perth.</h2>
            <p>Scooter Shop&apos;s website was built the way our reports recommend: fast structured pages, indexable stock, and focused pages for the searches customers actually make—&ldquo;Vespa service Perth&rdquo;, &ldquo;50cc scooters Perth&rdquo;, &ldquo;SYM parts&rdquo;. Google Search Console recorded organic clicks up 200% in 6 months.</p>
            <p>That&apos;s the loop this service runs on your site: find the gap in the data, build the thing that fills it, then measure whether it earned its place.</p>
            <div className={styles.casePoints}>
              {casePoints.map((point) => <span key={point}>{point}</span>)}
            </div>
            <Link href="/portfolio/scooter-shop">Read the full case study <span>→</span></Link>
          </div>
        </div>
      </section>

      <Faq
        eyebrow="08 / Common questions"
        title="Before you connect your data."
        items={questions.map(([question, answer]) => ({ question, answer }))}
      />

      <AiReadySection />

      <section className={`shell ${styles.closing}`}>
        <p className={styles.label}>Start with your own data</p>
        <h2>What is search actually costing you right now?</h2>
        <p>Connect Google Search Console and your first report arrives within the week—ranked, plain-English, and honest about whether you should keep paying us.</p>
        <Link href="/contact">Get your first report <span>↗</span></Link>
      </section>
    </main>
  );
}
