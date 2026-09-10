import { IndexedFeatureSection, type IndexedFeature } from "@/components/marketing/IndexedFeatureSection";

const features: readonly IndexedFeature[] = [
  [
    "Prompt for full payment",
    "After a successful signature, show your BSB and account details so the customer can pay the full balance online.",
  ],
  ["Book and pay for delivery", "Let the customer choose an available delivery time and pay the delivery fee online."],
];

export function LicensingAdditionalFeatures({ eyebrow }: { eyebrow: string }) {
  return (
    <IndexedFeatureSection
      id="additional-features"
      eyebrow={eyebrow}
      title="Optional"
      accentTitle="additional features."
      lead="Keep the licensing journey focused on filling, verifying and signing. Add either of these after a successful signature."
      items={features}
    />
  );
}
