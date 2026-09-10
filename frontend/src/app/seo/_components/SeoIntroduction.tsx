import { ProcessIntroduction } from "@/components/ProcessIntroduction";

const steps = [
  { title: "Analyze", description: "Read the search data and inspect what is helping or hurting visibility." },
  { title: "Report", description: "Turn the evidence into a ranked, plain-English action plan." },
  { title: "Improve", description: "Make the best change, gather fresh data and run the cycle again." },
] as const;

export function SeoIntroduction() {
  return (
    <ProcessIntroduction
      id="seo-overview"
      eyebrow="How recurring SEO works"
      title="Better data."
      accentTitle="Better decisions."
      items={steps}
    />
  );
}
