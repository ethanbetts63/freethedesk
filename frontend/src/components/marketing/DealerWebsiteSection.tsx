import { CtaButton } from '@/components/CtaButton';
import { SplitFeatureSection } from '@/components/SplitFeatureSection';

import { WebsiteProductVisual } from './WebsiteProductVisual';

const bullets = [
  'Inventory, vehicle, parts and service pages',
  'Online purchasing, licensing and contract signing',
  'Service bookings, hire and a new-stock newsletter',
] as const;

/**
 * What a dealership website includes. On /dealers it is the page's design
 * section and points at the live case study; elsewhere (`overview`) it is a
 * teaser that points at /dealers.
 */
export function DealerWebsiteSection({
  eyebrow,
  id = 'customer-journeys',
  overview = false,
}: {
  eyebrow: string;
  id?: string;
  overview?: boolean;
}) {
  return (
    <SplitFeatureSection
      id={id}
      eyebrow={eyebrow}
      title="Dealership websites"
      accentTitle="built to sell."
      description="A complete dealership website around your brand: stock, parts, service and hire, with online sales and licensing, and the admin behind them built in."
      bullets={bullets}
      action={
        overview ? (
          <CtaButton href="/dealers" size="compact">
            Dealer websites
          </CtaButton>
        ) : (
          <CtaButton href="/portfolio/scooter-shop" size="compact">
            See a live dealership
          </CtaButton>
        )
      }
      visual={<WebsiteProductVisual />}
      textSide="right"
      spacing="joined"
    />
  );
}
