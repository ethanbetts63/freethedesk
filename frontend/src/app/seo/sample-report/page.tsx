import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CtaButton } from '@/components/CtaButton';
import { PageSchema } from '@/components/PageSchema';
import { SectionNumber } from '@/components/SectionNumber';
import { metadataFor } from '@/lib/pages';
import { getSiteSettingsServer } from '@/lib/serverApi';
import { cn } from '@/lib/utils';

import { AnalysisOverview, AnalysisQuestions, Provenance } from './_components/Analysis';
import { Credits } from './_components/Credits';
import { HowItWorks } from './_components/HowItWorks';
import { ExperimentList, RecommendationList } from './_components/Recommendations';
import { ReportContents } from './_components/ReportContents';
import { ReportCover } from './_components/ReportCover';
import { ReportSection } from './_components/ReportPrimitives';
import { CONTENTS } from './_lib/contents';
import { reportDisplay, reportSerif } from './_lib/fonts';
import { BUSINESS } from './_lib/report';
import { seoAuditPrices, type SeoAuditPrices } from '../_lib/plans';
import './_styles/sample.css';

export const metadata: Metadata = metadataFor('/seo/sample-report');

/* The button's prices come from the admin, so this page renders per request. */
export const dynamic = 'force-dynamic';

/**
 * The sample report is a delivered report, laid out as the engine lays one out (owner, 2026-11-07): the engine's
 * markup (compose.py, render.py), its stylesheet copied (_styles/report.generated.css) and its contents menu
 * following the reader. The site's own parts, the note that it is a sample and the ask at the foot, sit outside the
 * report's box, as the strip and the ask do on a prospect report's page.
 */
function SampleNote() {
  return (
    <aside className="border-b border-border-default bg-surface-tint">
      <div className="site-shell">
        <div className="mx-auto flex max-w-4xl flex-col gap-2xs py-m sm:flex-row sm:items-baseline sm:gap-m">
          <span className="text-label font-black tracking-label-wide whitespace-nowrap text-action-primary uppercase">
            Sample report
          </span>
          <p className="m-0 text-body-sm leading-relaxed text-text-muted">
            {BUSINESS.fullName} is an invented business, and every figure, page and review below is
            made up. The kinds of findings, the experiments and the way each is written come from
            real reports. It is a Complete audit: the experiments come from its second look, three
            months on. A real report runs longer: every recommendation found, and a chart for each
            line of the business.
          </p>
        </div>
      </div>
    </aside>
  );
}

function SampleCta({ prices }: { prices: SeoAuditPrices }) {
  return (
    <section className="site-shell my-section bg-surface-tint py-section text-center sm:px-xl sm:py-3xl">
      <SectionNumber>Your business next</SectionNumber>
      <h2 className="m-0 text-display tracking-tighter">Get a report for your business.</h2>
      <p className="mx-auto my-xl max-w-copy text-lead leading-relaxed text-text-muted">
        The same report, written about your site from your own search data: what to fix first, why
        it matters and how to do it. A Complete audit then looks again to show what each change
        earned.
      </p>
      <div className="flex flex-col items-center gap-s">
        <CtaButton href="/seo" size="large">
          Get a report for your business
        </CtaButton>
        <p className="m-0 text-body-sm font-strong text-text-muted">
          Essentials {prices.essentials}, Plus {prices.plus}, Complete {prices.complete}, each paid
          once
        </p>
      </div>
    </section>
  );
}

export default async function SampleReportPage() {
  const prices = seoAuditPrices(await getSiteSettingsServer());

  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema path="/seo/sample-report" />
      <Breadcrumbs path="/seo/sample-report" />
      <SampleNote />

      {/* The report's box: the engine's stylesheet applies inside it and nowhere else. The two font variables
          set the faces it reads. */}
      <div className={cn('seo-report', reportDisplay.variable, reportSerif.variable)}>
        {/* The cover, the contents and the article in one box, which a desktop lays out as a grid: the contents
            beside the article, stuck in view (render.render). `guide-contents` lets the menu stick past the
            site's clipping `main`, as a guide's contents do (base.css). */}
        <div className="report-grid">
          <ReportCover />
          <div className="report contents-page guide-contents">
            <ReportContents sections={CONTENTS} />
          </div>
          <article className="report">
            <HowItWorks />

            <ReportSection id="section-01" number="01" kicker="What to do" title="Recommendations">
              <RecommendationList />
            </ReportSection>

            <ReportSection
              id="section-02"
              number="02"
              kicker="Experiments"
              title="What changed, and what it did"
            >
              <ExperimentList />
            </ReportSection>

            <ReportSection
              id="section-03"
              number="03"
              kicker="Data analysis"
              title="What the data shows"
            >
              <AnalysisOverview />
              <AnalysisQuestions />
            </ReportSection>

            {/* Provenance answers questions rather than opening the argument, so it sits at the back, with the
                credits. */}
            <div className="closing-page">
              <Provenance />
              <Credits where="closing" />
            </div>
          </article>
        </div>
      </div>

      <SampleCta prices={prices} />
    </main>
  );
}
