import { StatusPanelVisual } from "@/components/visuals/StatusPanelVisual";

const checks = [
  ["Licence uploaded", "Clear images of the front and back"],
  ["Live selfie", "Captured during the verification session"],
  ["Identity matched", "Document and face checked by Stripe"],
] as const;

export function LicensingVerifyVisual() {
  return (
    <StatusPanelVisual
      eyebrow="Identity verification by Stripe"
      title="Customer identity"
      countLabel="~60 seconds"
      items={checks.map(([title, description]) => ({ title, description, tag: "Verified" }))}
      ariaLabel="The online identity verification checks"
    />
  );
}
