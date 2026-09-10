import { ReportCardVisual } from "@/components/visuals/ReportCardVisual";

const details = [
  ["Vehicle details", "The vehicle and licensing information.", "Vehicle"],
  ["Purchaser details", "The person or business taking ownership.", "Buyer"],
  ["Transaction details", "The sale, payment and handover information.", "Sale"],
] as const;

export function LicensingChooseVisual() {
  return (
    <ReportCardVisual
      title="Licensing file"
      subtitle="Vehicle · purchaser · transaction"
      badge="Ready to send"
      items={details.map(([title, description, tag]) => ({ title, description, tag }))}
      footerItems={["One record", "No retyping", "Completed online"]}
      ariaLabel="The information collected for an online vehicle licence"
    />
  );
}
