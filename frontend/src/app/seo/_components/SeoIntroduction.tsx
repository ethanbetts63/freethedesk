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
      title="Data-driven SEO."
      accentTitle="Not guesswork."
      description="Every recommendation starts in your own search data and ends with a measurement. You see what we found, what to change, and what each change earned."
      items={steps}
    />
  );
}
