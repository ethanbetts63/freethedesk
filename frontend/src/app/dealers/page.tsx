import type { Metadata } from "next";

import { Faq } from "@/components/Faq";
import { FloatingPageCta } from "@/components/FloatingPageCta";
import { ManualAdminCta } from "@/components/ManualAdminCta";
import { FlagshipCheckout } from "@/components/marketing/FlagshipCheckout";
import { Hero } from "@/components/marketing/Hero";
import { ProjectEnquiry } from "@/components/marketing/ProjectEnquiry";
import { WebsiteProduct } from "@/components/marketing/WebsiteProduct";
import styles from "@/components/marketing/marketingPage.module.css";
import { PageOverview } from "@/components/PageOverview";
import { PageSchema } from "@/components/PageSchema";
import { ProcessBar } from "@/components/ProcessBar";
import { metadataFor } from "@/lib/pages";

import { DealershipAutomation } from "./_components/DealershipAutomation";
import { DEALER_FAQS } from "./_lib/copy";

export const metadata: Metadata = metadataFor("/dealers");

export default function Dealers() {
  return (
    <main className={styles.page}>
      <PageSchema path="/dealers" />
      <Hero
        eyebrow="Efficiency First Solutions"
        titleLines={["Digital"]}
        accentTitle="dealerships."
        lead="Connected websites and operational systems built for the way modern dealerships sell, service and work."
        primaryHref="/dealership-website-builder"
        primaryLabel="Try the free demo"
        secondaryHref="/portfolio/scooter-shop"
        secondaryLabel="See it in action"
      />

      <ProcessBar
        id="dealers-hero-end"
        label="The connected dealership journey"
        steps={[
          { label: "Attract buyers", description: "Useful pages built to be found", href: "#dealer-websites" },
          { label: "Move the sale", description: "Clear next steps from enquiry to sold", href: "#online-purchasing" },
          { label: "License online", description: "Verify, sign and pay without a visit", href: "#online-purchasing" },
          {
            label: "Run the follow-through",
            description: "Keep handoffs and admin moving",
            href: "#dealership-automation",
          },
        ]}
      />

      <PageOverview
        id="dealer-overview"
        eyebrow="What we connect"
        title="Everything around the sale, connected."
        description={
          <p>
            The public website, the buying journey and the work your team handles afterwards should behave like one
            dealership—not three disconnected products.
          </p>
        }
        items={[
          { title: "Dealer websites", description: "Stock, service and customer journeys.", href: "#dealer-websites" },
          {
            title: "Online sales and licensing",
            description: "Paperwork and payment completed remotely.",
            href: "#online-purchasing",
          },
          {
            title: "Dealership automation",
            description: "Leads, documents and handoffs kept moving.",
            href: "#dealership-automation",
          },
          {
            title: "A working example",
            description: "See the connected Scooter Shop build.",
            href: "/portfolio/scooter-shop",
          },
        ]}
      />

      <WebsiteProduct showPrimaryAction={false} />
      <FlagshipCheckout showPrimaryAction={false} />
      <DealershipAutomation />
      <ProjectEnquiry />

      <FloatingPageCta
        label="Discuss your dealership"
        href="#project-enquiry"
        showAfterId="dealers-hero-end"
        hideAtId="project-enquiry"
      />

      <Faq eyebrow="Common questions" title="Dealership website and automation questions." items={DEALER_FAQS} />
      <ManualAdminCta href="#project-enquiry" buttonLabel="Discuss your dealership" />
    </main>
  );
}
