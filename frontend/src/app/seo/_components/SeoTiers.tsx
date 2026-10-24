import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { ChecklistCard, LiveDot } from '@/components/visuals/ChecklistCard';

/** Mirrors buildSeoPlans: each audit by what it adds to the one before. */
const TIERS = [
  ['Essentials', 'Search Console'],
  ['Plus', 'Profile, analytics'],
  ['Complete', 'Ads, legal, recheck'],
] as const;

export function SeoTiers({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="tiers"
      eyebrow={eyebrow}
      title="Pick what we read."
      accentTitle="Pay once."
      description="Essentials reads what anyone can see, and your Search Console. Plus adds your Business Profile, your reviews and your visitor analytics. Complete reads everything, your ads included, and looks again three months on to show what your changes earned. No subscription: buy another audit whenever you want one."
      visual={
        <ChecklistCard
          mark={<LiveDot />}
          eyebrow="Three audits"
          title="One report, three depths"
          items={TIERS.map(([title, tag]) => ({ title, tag }))}
          ariaLabel="What each SEO audit reads"
        />
      }
      textSide="right"
      background="white"
      spacing="joined"
    />
  );
}
