import { FlowCardVisual } from "@/components/visuals/FlowCardVisual";

export function LicensingSignVisual() {
  return (
    <FlowCardVisual
      browserLabel="online licensing"
      inputs={[{ label: "Point A", title: "Identity verified", description: "Licensing file ready" }]}
      steps={[
        { title: "Review", description: "Confirm the sale and vehicle details" },
        { title: "Sign", description: "Complete the required documents" },
        { title: "Confirm", description: "Send the completed file to the dealership" },
      ]}
      result={{ label: "Point B", title: "Contract signed", description: "Dealership notified" }}
      ariaLabel="The online vehicle licensing signing journey"
    />
  );
}
