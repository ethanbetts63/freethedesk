import { ProcessIntroduction } from "@/components/ProcessIntroduction";

const items = [
  {
    title: "Fill",
    description: "The dealer enters the vehicle details. The customer opens a secure link and fills in their own.",
  },
  { title: "Verify", description: "User uploads license and verifies identity through Stripe Identity." },
  { title: "Sign", description: "User signs the licensing and contract documents online." },
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
