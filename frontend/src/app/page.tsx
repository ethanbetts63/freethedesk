import type { Metadata } from "next";

import { Faq } from "@/components/Faq";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { PageSchema } from "@/components/PageSchema";
import { ProcessStepsBar } from "@/components/ProcessStepsBar";
import { metadataFor } from "@/lib/pages";

import { HOME_FAQS } from "./_lib/copy";

import { AiReadinessBanner } from "@/components/marketing/AiReadinessBanner";
import { AutomationFeature } from "./_components/AutomationFeature";
import { HomeSeoFeature } from "./_components/HomeSeoFeature";
import { DealerWebsiteBuilderSection } from "@/components/marketing/DealerWebsiteBuilderSection";
import { FlagshipCheckout } from "@/components/marketing/FlagshipCheckout";
import { Hero } from "@/components/marketing/Hero";
import { ProjectEnquiry } from "@/components/marketing/ProjectEnquiry";
import { WebsiteDevelopmentFeature } from "./_components/WebsiteDevelopmentFeature";
import styles from "@/components/marketing/marketingPage.module.css";

export const metadata: Metadata = metadataFor("/");

export default function Home() {
  return (
    <main className={styles.page}>
      <PageSchema path="/" />
      <AiReadinessBanner />
      <Hero
        eyebrow="Online Automation Services Australia"
        titleLines={["Digital", "automation"]}
        accentTitle="solutions."
        lead="Connected websites and automation systems built to reduce the workload of modern businesses."
        primaryHref="/contact"
        primaryLabel="Get in touch"
        secondaryHref="/portfolio/scooter-shop"
        secondaryLabel="See it in action"
      />

      <ProcessStepsBar
        id="home-hero-end"
        ariaLabel="How we make your website work harder"
        steps={["Get found", "Get customers", "Get time back"]}
      />

      <WebsiteDevelopmentFeature />
      <AutomationFeature />
      <FlagshipCheckout />
      <HomeSeoFeature />
      <DealerWebsiteBuilderSection eyebrow="Interactive dealership builder" id="dealership-builder" />
      <ProjectEnquiry />
      <Faq eyebrow="Common questions" title="Questions about working with us." items={HOME_FAQS} />
      <ManualAdminCta buttonLabel="Get in touch" />
    </main>
  );
}
