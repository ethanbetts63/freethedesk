import { StatusPanelVisual } from "@/components/visuals/StatusPanelVisual";

const inputs = [
  ["Search performance", "Queries, impressions and clicks"],
  ["Website structure", "Pages, links and indexability"],
  ["Search visibility", "Where demand meets your site"],
] as const;

export function SeoAnalysisVisual() {
  return (
    <StatusPanelVisual
      eyebrow="Automated collection"
      title="Human reviewed"
      countLabel={`${inputs.length} inputs`}
      items={inputs.map(([title, description]) => ({ title, description, tag: "Checked" }))}
      ariaLabel="SEO analysis inputs"
    />
  );
}
