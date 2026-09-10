import type { Metadata } from "next";

import { Faq } from "@/components/Faq";
import { FloatingPageCta } from "@/components/FloatingPageCta";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { AdminAutomationSection } from "@/components/marketing/AdminAutomationSection";
import { CaseStudyTeaser } from "@/components/marketing/CaseStudyTeaser";
import { DealerWebsiteBuilderSection } from "@/components/marketing/DealerWebsiteBuilderSection";
import { Hero } from "@/components/marketing/Hero";
import { ProjectEnquiry } from "@/components/marketing/ProjectEnquiry";
import { SubscriptionSwap } from "@/components/marketing/SubscriptionSwap";
import styles from "@/components/marketing/marketingPage.module.css";
import { PageSchema } from "@/components/PageSchema";
import { SeoReportOverview } from "@/components/SeoReportOverview";
import { metadataFor } from "@/lib/pages";
import { numberSections } from "@/lib/sectionNumbers";

import { WebsiteIntroduction } from "../website-development/_components/WebsiteIntroduction";
import { WebsiteJobsBar } from "../website-development/_components/WebsiteJobsBar";
import { DealerDemoAlternative } from "./_components/DealerDemoAlternative";
import { DealershipAutomation } from "./_components/DealershipAutomation";
import { DEALER_FAQS } from "./_lib/copy";

const sections = numberSections([
  "SEO",
  "Website Design",
  "Admin Automation",
  "What you're paying for",
  "Features and integrations",
  "Proof this works",
  "Common questions",
] as const);

const dealerAdminJobs = [
  "Lead capture & routing",
  "Online contract signing",
  "Vehicle licensing",
  "Payments & handover",
  "CRM & system sync",
] as const;

const dealerSubscriptionSteps = [
  [
    "Add up the bill",
    "Every dealership platform you pay for monthly or annually, including the ones nobody remembers signing up for.",
  ],
  [
    "Find what you actually use",
    "Every dealer system comes with features. We only have to rebuild the ones your team uses.",
  ],
  [
    "Price a build against it",
    "If a dealership build will not be cheaper to run, or genuinely better to use, we tell you that instead.",
  ],
] as const;

const casePoints = ["Indexable stock", "Online purchasing", "Connected admin", "Measured in Search Console"];

export const metadata: Metadata = metadataFor("/dealers");

export default function Dealers() {
  return (
    <main className={styles.page}>
      <PageSchema path="/dealers" />
      <Hero
        path="/dealers"
        eyebrow="Efficiency First Solutions"
        titleLines={["Digital"]}
        accentTitle="dealerships."
        lead="Connected websites and operational systems built for the way modern dealerships sell, service and work."
        primaryHref="/dealership-website-builder"
        primaryLabel="Try the free demo"
        secondaryHref="/portfolio/scooter-shop"
        secondaryLabel="See it in action"
      />

      <WebsiteJobsBar id="dealers-hero-end" />

      <WebsiteIntroduction
        id="dealer-overview"
        seoDescription="Search engine optimisation (SEO) helps your dealership website appear when people search Google for the vehicles, brands or services you offer."
        designDescription="Clear layouts guide buyers from stock to an enquiry, purchase, online licensing and contract signing on mobile or desktop."
        automationDescription="We connect your dealership website to the systems your team uses so leads, contracts, licensing, payments and handovers keep moving."
      />

      <SeoReportOverview
        id="seo"
        eyebrow={sections["SEO"]}
        title="Launch SEO Strong."
        accentTitle="Improve with data."
        showSequence={false}
        mode="improvement"
        description="Every dealership website launches with strong SEO foundations. As search data arrives, we rank the best opportunities across stock, service and local search."
      />

      <DealerWebsiteBuilderSection eyebrow={sections["Website Design"]} />

      <AdminAutomationSection
        id="website-automation"
        eyebrow={sections["Admin Automation"]}
        spacing="joined"
        description="Your dealership website can move the admin behind each sale—routing leads, preparing contracts, starting online licensing and keeping payment and handover steps moving."
        jobs={dealerAdminJobs}
        panelEyebrow="Runs across the dealership"
        panelTitle="Your dealership website"
      />

      <SubscriptionSwap
        eyebrow={sections["What you're paying for"]}
        showCta={false}
        lead="Most dealerships pay for four or five tools every month and use one feature from each. We add up what those dealership systems cost, work out which parts your team actually uses, and price a connected build against the bill. Stop renting. Own the tools you use."
        steps={dealerSubscriptionSteps}
      />

      <DealershipAutomation eyebrow={sections["Features and integrations"]} />

      <CaseStudyTeaser
        eyebrow={sections["Proof this works"]}
        title={
          <>
            Organic clicks grew <span className="moving-colour-text">300%.</span>
          </>
        }
        points={casePoints}
        primaryHref="#project-enquiry"
        primaryLabel="Discuss your dealership"
        showPrimaryAction={false}
      >
        <p>
          Scooter Shop connects dealership inventory, parts, purchasing and service journeys in one website. Fast
          structured pages and focused search content helped organic clicks grow by 300% in six months.
        </p>
        <p>The same dealership system keeps customer actions and admin moving together.</p>
      </CaseStudyTeaser>

      <ProjectEnquiry
        eyebrow={null}
        lead="Give us the constraint, and we'll tell you the most valuable dealership system we can build within it."
        footer={<DealerDemoAlternative />}
      />

      <FloatingPageCta
        label="Discuss your dealership"
        href="#project-enquiry"
        showAfterId="dealers-hero-end"
        hideAtId="project-enquiry"
      />

      <Faq
        eyebrow={sections["Common questions"]}
        title="Dealership website and automation questions."
        items={DEALER_FAQS}
      />
      <ManualAdminCta
        eyebrow="Start with the dealership admin"
        title="What is dealership admin actually costing you?"
        href="#project-enquiry"
        buttonLabel="Discuss your dealership"
      >
        Tell us where leads, contracts, licensing or handovers slow down. We&apos;ll find the simplest worthwhile place
        to begin.
      </ManualAdminCta>
    </main>
  );
}
