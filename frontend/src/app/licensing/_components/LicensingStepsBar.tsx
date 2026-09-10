import { ProcessStepsBar } from "@/components/ProcessStepsBar";

export function LicensingStepsBar() {
  return (
    <ProcessStepsBar
      id="licensing-hero-end"
      ariaLabel="The three-step online licensing journey"
      steps={["Fill", "Verify", "Sign"]}
    />
  );
}
