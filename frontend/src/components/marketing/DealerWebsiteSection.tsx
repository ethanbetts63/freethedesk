import { CtaButton } from '@/components/CtaButton';
import { SplitFeatureSection } from '@/components/SplitFeatureSection';

import { WebsiteProductVisual } from './WebsiteProductVisual';

const bullets = [
  'Inventory, vehicle, parts and service pages',
  'Online purchasing, licensing and contract signing',
  'Service bookings, hire and a new-stock newsletter',
] as const;

/** What a dealership website includes: the /dealers design section, pointing at the live case study. */
export function DealerWebsiteSection({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="customer-journeys"
      eyebrow={eyebrow}
      title="Dealership websites"
      accentTitle="built to sell."
      description="A complete dealership website around your brand: stock, parts, service and hire, with online sales and licensing, and the admin behind them built in."
      bullets={bullets}
      action={
        <CtaButton href="/portfolio/scooter-shop" size="compact">
          See a live dealership
        </CtaButton>
      }
      visual={<WebsiteProductVisual />}
      textSide="right"
      spacing="joined"
    />
  );
}
