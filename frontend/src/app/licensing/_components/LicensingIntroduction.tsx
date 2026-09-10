import { ProcessIntroduction } from "@/components/ProcessIntroduction";

const items = [
  { title: "Choose", description: "Start with the vehicle, purchaser and transaction details." },
  { title: "Verify", description: "Confirm the person completing the paperwork is who they say they are." },
  { title: "Complete", description: "Sign, pay and arrange the handover without another dealership visit." },
] as const;

export function LicensingIntroduction() {
  return (
    <ProcessIntroduction
      id="licensing-overview"
      eyebrow="The online licensing journey"
      title="From sold to signed."
      accentTitle="Without the visit."
      items={items}
    />
  );
}
