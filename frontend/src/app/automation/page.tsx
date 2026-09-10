import type { Metadata } from "next";

import { ApproachSection, type ApproachStep } from "@/components/ApproachSection";
import { AutomationMeaning } from "@/components/marketing/AutomationMeaning";
import { ProjectEnquiry } from "@/components/marketing/ProjectEnquiry";
import { Hero } from "@/components/marketing/Hero";
import { Faq } from "@/components/Faq";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { PageOverview } from "@/components/PageOverview";
import { PageSchema } from "@/components/PageSchema";
import { ProcessBar } from "@/components/ProcessBar";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { metadataFor } from "@/lib/pages";
import { numberSections } from "@/lib/sectionNumbers";

import { AUTOMATION_FAQS } from "./_lib/copy";
import { ServiceScroll } from "@/components/ServiceScroll";
import { automationServices } from "./_components/automationServices";

/* Section eyebrows in page order. */
const sections = numberSections([
  "What automation covers",
  "What automation means",
  "Practical automation",
  "Our approach",
  "Common questions",
] as const);

export const metadata: Metadata = metadataFor("/automation");

const automationStats: ProofStat[] = [
  { value: "36%", label: "Of the work week", description: "Time small business owners lose to manual admin tasks." },
  { value: "0", label: "Times re-keyed", description: "Information entered once, reused everywhere it's needed." },
  {
    value: "AI",
    label: "Automation like never before",
    description: "What AI can automate has grown fast. Get ahead of the curve.",
  },
];

const approachSteps: ApproachStep[] = [
  {
    title: "Map it",
    description: "We map every opportunity in the business, from quick fixes to big-ticket projects.",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
        <path
          d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="9.5" r="2.4" stroke="#fff" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    title: "Build it",
    description: "We start with the simplest one first—fast to build and low risk, and it teaches us your business.",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
        <path
          d="M14.7 6.3a3.5 3.5 0 0 0-4.6 4.6L4 17l3 3 6.1-6.1a3.5 3.5 0 0 0 4.6-4.6l-2.3 2.3-2-2 2.3-2.3Z"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Learn",
    description: "With trust and understanding in place, we move on to the bigger automations.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="#fff" />
      </svg>
    ),
  },
];

export default function AutomationPage() {
  return (
    <main>
      <PageSchema path="/automation" />
      <Hero
        eyebrow="Automate Boring Away"
        titleLines={["Less repetition."]}
        accentTitle="More progress."
        lead="We connect the systems you already use and build the missing pieces, so information moves while your team stays focused on customers."
        primaryHref="#enquiry"
        primaryLabel="Find your first automation"
        secondaryHref="#workflows"
        secondaryLabel="Explore workflows"
      />

      <ProcessBar
        label="How automation earns its place"
        steps={[
          { label: "Find the repetition", description: "Start with work that happens every week", href: "#overview" },
          {
            label: "Connect the tools",
            description: "Use the systems you already rely on",
            href: "#automation-meaning",
          },
          { label: "Automate the handoff", description: "Move information without copy-paste", href: "#workflows" },
          { label: "Monitor and expand", description: "Prove it works before building more", href: "#approach" },
        ]}
      />

      <PageOverview
        id="overview"
        eyebrow={sections["What automation covers"]}
        title="What business automation actually covers."
        description={
          <p>
            If a computer-based task repeats, follows rules or moves the same information between people and systems, it
            may be worth automating. We find the simplest useful place to begin.
          </p>
        }
        items={[
          { title: "What it means", description: "The work your systems can handle.", href: "#automation-meaning" },
          { title: "Common workflows", description: "Practical examples across the business.", href: "#workflows" },
          { title: "How we start", description: "Small, useful and low-risk first.", href: "#approach" },
          { title: "Your bottleneck", description: "A custom build around your process.", href: "#enquiry" },
        ]}
      />

      <AutomationMeaning
        id="automation-meaning"
        eyebrow={sections["What automation means"]}
        title="The admin your systems can handle."
        description="Automation means the systems you already use handle repetitive work—capturing details, moving information, sending follow-ups and keeping work moving without someone doing it by hand."
        primaryHref="#enquiry"
        primaryLabel="Find your first automation"
        panelTitle="Your business"
      />

      <ProofStrip stats={automationStats} />

      <section className="shell" id="workflows">
        <ServiceScroll
          services={automationServices}
          customHref="#enquiry"
          ctaLabel="Find your first automation"
          eyebrow={sections["Practical automation"]}
          title="What gets copied, chased or checked every week?"
        />
      </section>

      <ApproachSection
        id="approach"
        eyebrow={sections["Our approach"]}
        title="Start small. Prove it."
        accentTitle="Then expand."
        steps={approachSteps}
        ctaHref="#enquiry"
        ctaLabel="Find your first automation"
      />

      <ProjectEnquiry id="enquiry" />

      <Faq eyebrow={sections["Common questions"]} title="Business automation questions." items={AUTOMATION_FAQS} />

      <ManualAdminCta href="#enquiry" />
    </main>
  );
}
