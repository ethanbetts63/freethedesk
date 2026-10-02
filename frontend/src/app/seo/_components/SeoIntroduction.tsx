import { ProcessIntroduction } from '@/components/ProcessIntroduction';

const steps = [
  {
    title: 'Analyse',
    description: 'Find where Perth customers search for what you sell and do not find you.',
  },
  {
    title: 'Recommend',
    description: 'Rank the changes by what they could earn, and what they cost to make.',
  },
  {
    title: 'Experiment',
    description: 'Ship a change, measure it against a baseline, and keep what works.',
  },
] as const;

export function SeoIntroduction() {
  return (
    <ProcessIntroduction
      id="seo-overview"
      eyebrow="How it works"
      title="Analyse. Recommend."
      accentTitle="Experiment. Repeat."
      items={steps}
    />
  );
}
