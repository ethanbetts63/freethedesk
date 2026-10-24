import { CtaButton } from '@/components/CtaButton';
import { SeoReportOverview } from '@/components/SeoReportOverview';
import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { LicensingFillVisual } from '@/app/licensing/_components/LicensingFillVisual';
import { AutomationFeatureVisual } from '@/app/_components/AutomationFeatureVisual';
import { WEB_DESIGN_JOURNEY } from '@/app/website-development/_lib/copy';

import { JourneySection } from '@/components/marketing/JourneySection';

export type GuideCtaKind = 'seo' | 'website' | 'licensing' | 'automation';

/**
 * What a guide ends on: the service the reader is closest to buying, with a
 * button to its page. The SEO one is the website page's "Launch SEO strong"
 * section; the website one is its "Websites designed to be obvious" journey;
 * the licensing one, for the WA dealer guides, is /licensing's opening section;
 * the automation one is the homepage's automation section, with the discovery price.
 */
export function GuideCta({
  kind,
  discoveryTotal,
}: {
  kind: GuideCtaKind;
  /** The automation panel's price; only that panel quotes one. */
  discoveryTotal?: string;
}) {
  if (kind === 'automation') {
    return (
      <SplitFeatureSection
        id="automation"
        background="tint"
        eyebrow="Business automation Perth"
        title="Automation built"
        accentTitle="around your business."
        description={`We connect the systems you already use and build the missing pieces. It starts with ${discoveryTotal ? `a ${discoveryTotal}` : 'a paid'} discovery: your work mapped and the build priced to your budget.`}
        visual={<AutomationFeatureVisual />}
        action={
          <CtaButton href="/automation#packages" size="compact">
            Explore business automation
          </CtaButton>
        }
      />
    );
  }
  if (kind === 'seo') {
    return (
      <SeoReportOverview
        id="seo"
        className="bg-surface-tint"
        spacing="standard"
        eyebrow="SEO Perth"
        title="Launch SEO Strong."
        accentTitle="Improve with data."
        mode="improvement"
        description={
          <div className="flex flex-col gap-l [&>span]:block">
            <span>
              We find where Perth customers search and don&apos;t find you, rank what to change by
              value, and measure every change as an experiment.
            </span>
            <CtaButton className="self-start tracking-label-tight" href="/seo" size="compact">
              Explore SEO audits
            </CtaButton>
          </div>
        }
      />
    );
  }
  if (kind === 'licensing') {
    return (
      <SplitFeatureSection
        id="licensing"
        background="tint"
        eyebrow="Online licensing WA"
        title="Dealer starts it."
        accentTitle="Customer finishes it."
        description="Your team enters the vehicle details and sends a secure link. The customer fills in their own details online, without a trip to the dealership."
        visual={<LicensingFillVisual />}
        action={
          <CtaButton href="/licensing" size="compact">
            Explore online licensing
          </CtaButton>
        }
      />
    );
  }
  return (
    <JourneySection
      eyebrow="Web design Perth"
      content={WEB_DESIGN_JOURNEY}
      action={
        <CtaButton href="/website-development" size="compact">
          Explore website development
        </CtaButton>
      }
    />
  );
}
