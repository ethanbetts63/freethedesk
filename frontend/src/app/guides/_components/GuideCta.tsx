import { CtaButton } from '@/components/CtaButton';
import { SeoReportOverview } from '@/components/SeoReportOverview';
import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { LicensingFillVisual } from '@/app/licensing/_components/LicensingFillVisual';
import { AutomationFeatureVisual } from '@/app/_components/AutomationFeatureVisual';

import { type JourneyContent, JourneySection } from '@/components/marketing/JourneySection';

const WEBSITE_JOURNEY: JourneyContent = {
  title: 'Web design that leads visitors',
  accentTitle: 'to enquire or buy',
  description:
    'Good web design means visitors never have to work out what to do next. We create clear paths from their first click to a purchase, booking or enquiry.',
  bullets: [
    'One clear action at every stage',
    'Fewer fields, choices and dead ends',
    'A clear confirmation and handoff at the end',
  ],
  flow: {
    label: 'Customer journey',
    start: { label: 'Point A', title: 'Interested visitor', description: 'Intent captured' },
    steps: [
      { title: 'Find the path', description: 'One clear route forward' },
      { title: 'Understand the offer', description: 'The right detail, in the right order' },
      { title: 'Take action', description: 'Only the essential effort' },
    ],
    end: { label: 'Point B', title: 'Action complete', description: 'Next step confirmed' },
    ariaLabel: 'A clear customer journey from interest to completed action',
  },
};

export type GuideCtaKind = 'seo' | 'website' | 'licensing' | 'automation';

/**
 * What a guide ends on: the service the reader is closest to buying, with a
 * button to its page. The SEO one is for a site that already exists, over the
 * SEO page's report visual; the website one is a journey from interest to action;
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
        title="Not showing up?"
        accentTitle="An audit finds why."
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
      content={WEBSITE_JOURNEY}
      action={
        <CtaButton href="/website-development" size="compact">
          Explore website development
        </CtaButton>
      }
    />
  );
}
