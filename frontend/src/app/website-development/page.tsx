import type { Metadata } from "next";

import { AiReadinessBanner } from "@/components/marketing/AiReadinessBanner";
import { AdminAutomationSection } from "@/components/marketing/AdminAutomationSection";
import { Hero } from "@/components/marketing/Hero";
import { ProjectEnquiry } from "@/components/marketing/ProjectEnquiry";
import { SubscriptionSwap } from "@/components/marketing/SubscriptionSwap";
import { Faq } from "@/components/Faq";
import { FloatingPageCta } from "@/components/FloatingPageCta";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { CaseStudyTeaser } from "@/components/marketing/CaseStudyTeaser";
import { PageSchema } from "@/components/PageSchema";
import { SeoReportOverview } from "@/components/SeoReportOverview";
import { metadataFor } from "@/lib/pages";
import { numberSections } from "@/lib/sectionNumbers";

import { WEBSITE_DEV_FAQS } from "./_lib/copy";
import { ConversionFunnel } from "./_components/ConversionFunnel";
import { WebsiteFeatures } from "./_components/WebsiteFeatures";
import { WebsiteIntroduction } from "./_components/WebsiteIntroduction";
import { WebsiteJobsBar } from "./_components/WebsiteJobsBar";
import { PUBLIC_SITE_URL } from "@/lib/siteConfig";
import styles from "./page.module.css";

/* Section eyebrows in page order. */
const sections = numberSections([
  "SEO",
  "Website Design",
  "Admin Automation",
  "What you're paying for",
  "Features and integrations",
  "Proof this works",
  "Common questions",
] as const);

export const metadata: Metadata = metadataFor("/website-development");

const casePoints = ["Indexable stock", "Intent-focused pages", "Structured data", "Measured in Search Console"];

export default function WebsiteDevelopmentPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Website Development Perth",
    serviceType: "Website development and web application development",
    areaServed: { "@type": "City", name: "Perth" },
    provider: { "@id": `${PUBLIC_SITE_URL}/#organization` },
  };

  return (
    <main className={styles.page}>
      <PageSchema path="/website-development" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <AiReadinessBanner />
      <Hero
        eyebrow="Website development Perth"
        titleLines={["Websites should"]}
        accentTitle="work harder."
        lead="Custom websites that convert users and automate the repetitive work behind your business."
        primaryHref="#enquiry"
        primaryLabel="Discuss your website"
        secondaryHref="/portfolio/scooter-shop"
        secondaryLabel="Read the full case study"
      />

      <WebsiteJobsBar />

      <WebsiteIntroduction />

      <SeoReportOverview
        id="seo"
        eyebrow={sections["SEO"]}
        title="Launch SEO Strong."
        accentTitle="Improve with data."
        showSequence={false}
        mode="improvement"
        description="Every website launches with strong SEO foundations but optimization requires iteration. We analyze live data as it arrives and present you with ranked, plain-english oppurtunities and implementation costs."
      />

      <ConversionFunnel eyebrow={sections["Website Design"]} />

      <AdminAutomationSection id="website-automation" eyebrow={sections["Admin Automation"]} spacing="joined" />

      <SubscriptionSwap eyebrow={sections["What you're paying for"]} showCta={false} />

      <WebsiteFeatures eyebrow={sections["Features and integrations"]} />

      <CaseStudyTeaser
        eyebrow={sections["Proof this works"]}
        title="A website that grew organic clicks 300%."
        points={casePoints}
        primaryHref="#enquiry"
        primaryLabel="Discuss your website"
        showPrimaryAction={false}
      >
        <p>
          Scooter Shop&apos;s website combines inventory, parts, purchasing and service journeys in one connected
          experience. Fast structured pages and focused search content helped organic clicks grow by 300% in six months.
        </p>
        <p>
          It is a practical example of what happens when the public website and the work behind it are designed as one
          system.
        </p>
      </CaseStudyTeaser>

      <ProjectEnquiry id="enquiry" eyebrow={null} showProjectType={false} />

      <FloatingPageCta label="Discuss your website" href="#enquiry" showAfterId="website-hero-end" hideAtId="enquiry" />

      <Faq eyebrow={sections["Common questions"]} title="Website development questions." items={WEBSITE_DEV_FAQS} />

      <ManualAdminCta
        eyebrow="Start with the useful part"
        title="What should your website make easier?"
        href="#enquiry"
        buttonLabel="Discuss your website"
      >
        Tell us what you sell, who the site is for and where the current process gets in the way.
      </ManualAdminCta>
    </main>
  );
}
