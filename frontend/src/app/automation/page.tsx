import type { Metadata } from "next";

import { Faq } from "@/components/Faq";
import { FloatingPageCta } from "@/components/FloatingPageCta";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { AdminAutomationSection } from "@/components/marketing/AdminAutomationSection";
import { Hero } from "@/components/marketing/Hero";
import { ProjectEnquiry } from "@/components/marketing/ProjectEnquiry";
import { PageSchema } from "@/components/PageSchema";
import { metadataFor } from "@/lib/pages";
import { numberSections } from "@/lib/sectionNumbers";

import { AutomationBudgetSplit } from "./_components/AutomationBudgetSplit";
import { AutomationIdentify } from "./_components/AutomationIdentify";
import { AutomationIntroduction } from "./_components/AutomationIntroduction";
import { AutomationStepsBar } from "./_components/AutomationStepsBar";
import { AutomationWorkflowList } from "./_components/AutomationWorkflowList";
import { AUTOMATION_FAQS } from "./_lib/copy";

const sections = numberSections(["Identify", "Budget", "Automate", "Examples", "Common questions"] as const);

export const metadata: Metadata = metadataFor("/automation");

export default function AutomationPage() {
  return (
    <main>
      <PageSchema path="/automation" />
      <Hero
        path="/automation"
        eyebrow="Automate Boring Away"
        titleLines={["Less repetition."]}
        accentTitle="More progress."
        lead="We connect the systems you already use and build the missing pieces, so information moves while your team stays focused on customers."
        primaryHref="#enquiry"
        primaryLabel="Automate your admin"
        secondaryHref="#workflows"
        secondaryLabel="Explore workflows"
      />

      <AutomationStepsBar />

      <AutomationIntroduction />

      <AutomationIdentify eyebrow={sections["Identify"]} />
      <AutomationBudgetSplit eyebrow={sections["Budget"]} />
      <AdminAutomationSection id="automate" eyebrow={sections["Automate"]} spacing="joined" />
      <AutomationWorkflowList eyebrow={sections["Examples"]} />

      <ProjectEnquiry id="enquiry" defaultProjectType="automation" />

      <FloatingPageCta
        label="Automate your admin"
        href="#enquiry"
        showAfterId="automation-hero-end"
        hideAtId="enquiry"
      />

      <Faq eyebrow={sections["Common questions"]} title="Business automation questions." items={AUTOMATION_FAQS} />
      <ManualAdminCta href="#enquiry" buttonLabel="Automate your admin" />
    </main>
  );
}
