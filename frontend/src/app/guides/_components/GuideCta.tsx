import { CtaButton } from '@/components/CtaButton';
import { SeoReportOverview } from '@/components/SeoReportOverview';
import { WEB_DESIGN_JOURNEY } from '@/app/website-development/_lib/copy';

import { JourneySection } from '@/components/marketing/JourneySection';

export type GuideCtaKind = 'seo' | 'website';

/**
 * What a guide ends on: the service the reader is closest to buying, with a
 * button to its page. The SEO one is the website page's "Launch SEO strong"
 * section; the website one is its "Websites designed to be obvious" journey.
 */
export function GuideCta({ kind }: { kind: GuideCtaKind }) {
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
