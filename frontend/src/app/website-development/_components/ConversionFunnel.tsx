import { SplitFeatureSection } from "@/components/SplitFeatureSection";

import { ConversionFunnelVisual } from "./ConversionFunnelVisual";

const bullets = [
  "One clear action at every stage",
  "Fewer fields, choices and dead ends",
  "A clear confirmation and handoff at the end",
] as const;

export function ConversionFunnel({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="customer-journeys"
      eyebrow={eyebrow}
      title="Websites designed to"
      accentTitle="be obvious."
      titleBreak="desktop"
      description="Visitors shouldn’t have to work out what to do next. We create clear paths from their first click to a purchase, booking or enquiry."
      bullets={bullets}
      visual={<ConversionFunnelVisual />}
      textSide="right"
      spacing="joined"
    />
  );
}
