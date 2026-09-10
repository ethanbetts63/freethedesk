import { FlowCardVisual } from "@/components/visuals/FlowCardVisual";

export function LicensingCompleteVisual() {
  return (
    <FlowCardVisual
      browserLabel="online licensing"
      inputs={[{ label: "Point A", title: "Identity verified", description: "Licensing file ready" }]}
      steps={[
        { title: "Review", description: "Confirm the sale and vehicle details" },
        { title: "Sign", description: "Complete the required documents" },
        { title: "Pay", description: "Make the agreed online payment" },
      ]}
      result={{ label: "Point B", title: "Ready for handover", description: "Dealership notified" }}
      ariaLabel="The online vehicle licensing completion journey"
    />
  );
}
