import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { ChecklistCard, LiveDot } from '@/components/visuals/ChecklistCard';

const CADENCES = [
  ['Monthly', 'Start'],
  ['Every two months', 'Then'],
  ['Quarterly', 'Then'],
  ['Every six months', 'Steady'],
] as const;

export function SeoCadence({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="cadence"
      eyebrow={eyebrow}
      title="Paced by your data."
      accentTitle="Not our invoice."
      description="A cycle needs new data to judge your last changes. Initially, that's monthly. When results need longer to show, we'll suggest a longer gap."
      visual={
        <ChecklistCard
          mark={<LiveDot />}
          eyebrow="Cadence"
          title="Same price per cycle"
          countLabel={`${CADENCES.length} stages`}
          items={CADENCES.map(([title, tag]) => ({ title, tag }))}
          ariaLabel="How a subscription's cadence follows how much there is to measure"
        />
      }
      textSide="right"
      background="white"
      spacing="joined"
    />
  );
}
