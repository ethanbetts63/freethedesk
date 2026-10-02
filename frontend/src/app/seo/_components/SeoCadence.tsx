import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { ChecklistCard, LiveDot } from '@/components/visuals/ChecklistCard';

/** Mirrors SeoSubscriber.Plan: every cadence is the same price per cycle. */
const CADENCES = [
  ['Monthly', 'Start'],
  ['Every two months', 'Then'],
  ['Quarterly', 'Then'],
  ['Every six months', 'Mature'],
] as const;

export function SeoCadence({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="cadence"
      eyebrow={eyebrow}
      title="Fast while it pays."
      accentTitle="Slower when it doesn't."
      description="Every subscription starts monthly, when the easy opportunities are worth chasing every few weeks. As they run out, we slow it down: every two months, then quarterly, and every six months once the site's growth has matured. The price of a cycle never changes, so slowing down only ever costs you less."
      visual={
        <ChecklistCard
          mark={<LiveDot />}
          eyebrow="Cadence"
          title="Same price per cycle"
          countLabel={`${CADENCES.length} stages`}
          items={CADENCES.map(([title, tag]) => ({ title, tag }))}
          ariaLabel="How a subscription's cadence slows as growth matures"
        />
      }
      textSide="right"
      background="white"
      spacing="joined"
    />
  );
}
