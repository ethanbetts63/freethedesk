import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { type PublicSiteSettings } from '@/lib/api';
import { ChecklistCard, LiveDot } from '@/components/visuals/ChecklistCard';

import { affiliateEarnings } from '../_lib/copy';

export function AffiliateEarnings({
  eyebrow,
  settings,
}: {
  eyebrow: string;
  settings: PublicSiteSettings;
}) {
  const earnings = affiliateEarnings(settings);
  const lowest = earnings[0];
  const highest = earnings[earnings.length - 1];
  return (
    <SplitFeatureSection
      id="earn"
      eyebrow={eyebrow}
      title="Half of every audit."
      accentTitle="Whichever they pick."
      description={`There are three audits, and your share is half of whichever a listener buys: ${lowest.share} to ${highest.share} each. The prices are fixed and paid once, so there is nothing to work out and nothing that trails off. Your own audit, the ${earnings.find((earning) => earning.code === 'plus')?.name ?? 'Plus'}, is free when you sign up.`}
      visual={
        <ChecklistCard
          mark={<LiveDot />}
          eyebrow="Three audits"
          title="Your share of each"
          items={earnings.map((earning) => ({
            title: `${earning.name} audit`,
            description: `${earning.price}, paid once`,
            tag: `${earning.share} to you`,
          }))}
          ariaLabel="What an affiliate earns on each audit"
        />
      }
      textSide="right"
      background="white"
      spacing="joined"
    />
  );
}
