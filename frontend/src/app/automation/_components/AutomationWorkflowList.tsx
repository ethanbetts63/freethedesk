import { ServiceScroll } from "@/components/ServiceScroll";

import { automationServices } from "./automationServices";

export function AutomationWorkflowList({ eyebrow }: { eyebrow: string }) {
  return (
    <section className="shell" id="workflows">
      <ServiceScroll
        services={automationServices}
        customHref="#enquiry"
        ctaLabel="Automate your admin"
        eyebrow={eyebrow}
        title="What gets copied, chased or checked every week?"
        showCustomCta={false}
      />
    </section>
  );
}
