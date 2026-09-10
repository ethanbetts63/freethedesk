import { FlowCardVisual } from "@/components/visuals/FlowCardVisual";

export function ConversionFunnelVisual() {
  return (
    <FlowCardVisual
      browserLabel="customer journey"
      inputs={[{ label: "Point A", title: "Interested visitor", description: "Intent captured" }]}
      steps={[
        { title: "Find the path", description: "One clear route forward" },
        { title: "Understand the offer", description: "The right detail, in the right order" },
        { title: "Take action", description: "Only the essential effort" },
      ]}
      result={{ label: "Point B", title: "Action complete", description: "Next step confirmed" }}
      ariaLabel="A clear customer journey from interest to completed action"
    />
  );
}
