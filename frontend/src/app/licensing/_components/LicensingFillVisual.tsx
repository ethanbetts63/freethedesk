import { ReportCardVisual } from "@/components/visuals/ReportCardVisual";

const details = [
  ["Dealer enters vehicle details", "Vehicle, sale and licensing information.", "Dealer"],
  ["Customer enters their details", "A secure link opens the customer side of the form.", "Customer"],
] as const;

export function LicensingFillVisual() {
  return (
    <ReportCardVisual
      title="Two-part licensing form"
      subtitle="Dealer starts · customer completes"
      badge="One file"
      items={details.map(([title, description, tag]) => ({ title, description, tag }))}
      footerItems={["Vehicle details added", "Secure link sent", "Customer details added"]}
      ariaLabel="A two-part licensing form completed first by the dealer and then by the customer"
    />
  );
}
