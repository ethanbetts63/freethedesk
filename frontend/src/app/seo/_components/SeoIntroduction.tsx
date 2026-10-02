import { ProcessIntroduction } from '@/components/ProcessIntroduction';

const steps = [
  {
    title: 'Discover',
    description: 'Find where Perth customers search for what you sell and do not find you.',
  },
  {
    title: 'Implement',
    description: 'You, your IT person or we make the changes, starting with the most valuable.',
  },
  {
    title: 'Measure',
    description: 'Fresh data shows what each change earned. The next report builds on it.',
  },
] as const;

export function SeoIntroduction() {
  return (
    <ProcessIntroduction
      id="seo-overview"
      eyebrow="How the subscription works"
      title="Find it. Fix it."
      accentTitle="Measure it. Repeat."
      items={steps}
    />
  );
}
