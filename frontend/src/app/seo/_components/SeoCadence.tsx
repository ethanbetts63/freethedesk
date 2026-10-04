import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { ChecklistCard, LiveDot } from '@/components/visuals/ChecklistCard';

/** Mirrors SeoSubscriber.Plan, by who each pace suits. */
const CADENCES = [
  ['Monthly', 'Changes in weeks'],
  ['Quarterly', 'Agency or IT queue'],
  ['Yearly', 'Annual check-up'],
  ['One-off', 'A single audit'],
] as const;

export function SeoCadence({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="cadence"
      eyebrow={eyebrow}
      title="Paced by how fast you act."
      accentTitle="Not our invoice."
      description="A report is only worth the changes it leads to. Monthly suits a business that can make changes within weeks. Quarterly suits changes that go through an agency or an IT queue. Yearly is an annual check-up."
      visual={
        <ChecklistCard
          mark={<LiveDot />}
          eyebrow="Cadence"
          title="Pick the pace you can keep"
          items={CADENCES.map(([title, tag]) => ({ title, tag }))}
          ariaLabel="Which reporting pace suits which business"
        />
      }
      textSide="right"
      background="white"
      spacing="joined"
    />
  );
}
