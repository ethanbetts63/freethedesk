import { FlowCardVisual } from "@/components/visuals/FlowCardVisual";

export function SeoImprovementVisual() {
  return (
    <FlowCardVisual
      browserLabel="improvement cycle"
      inputs={[{ label: "Current report", title: "Best opportunity", description: "Chosen from live data" }]}
      steps={[
        { title: "Change", description: "Apply the highest-value action" },
        { title: "Collect", description: "Let fresh search data arrive" },
        { title: "Compare", description: "See whether the change worked" },
      ]}
      result={{ label: "Next report", title: "A better decision", description: "Backed by fresh evidence" }}
      ariaLabel="The recurring SEO improvement cycle"
    />
  );
}
