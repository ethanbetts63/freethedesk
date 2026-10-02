import { ProcessIntroduction } from '@/components/ProcessIntroduction';

const steps = [
  {
    title: 'Analyse',
    description: 'Find the searches you are missing.',
  },
  {
    title: 'Recommend',
    description: 'Rank the fixes by value.',
  },
  {
    title: 'Experiment',
    description: 'Measure each change. Keep what works.',
  },
] as const;

export function SeoIntroduction() {
  return (
    <ProcessIntroduction
      id="seo-overview"
      eyebrow="How it works"
      title="Data Driven Seo Analysis."
      accentTitle="Not Guesswork."
      items={steps}
    />
  );
}
