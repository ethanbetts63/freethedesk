import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs';
import Image from 'next/image';

import { CtaButton } from '@/components/CtaButton';
import { PageSchema } from '@/components/PageSchema';
import { metadataFor } from '@/lib/pages';
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
import './_styles/sample.css';

export const metadata: Metadata = metadataFor('/seo/sample-report');

/**
 * The sample report is a delivered report, laid out as the engine lays one out (owner, 2026-11-07): the engine's
 * markup (compose.py, render.py), its stylesheet copied (_styles/report.generated.css) and its contents menu
 * following the reader. The site's own parts, the note that it is a sample and the ask at the foot, sit outside the
 * report's box; the ask is the one every prospect report ends on (the report engine's guide.ASK).
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

/**
 * The ask under the report: the band every prospect report ends on (the report engine's guide.ASK), the words
 * beside the SEO page's picture of what an audit reads, framed as that page frames it. One sentence differs: a
 * prospect's says that report was written from public data; this one says it is a sample.
 */
function NextStep() {
  return (
    <section className="bg-surface-tint" aria-labelledby="next-step-title">
      <div className="site-shell grid items-center gap-xl py-section md:grid-cols-2 md:gap-2xl">
        <div>
          <span className="mb-s block text-label font-black tracking-label-wide text-action-primary uppercase">
            The next step
          </span>
          <h2 id="next-step-title" className="m-0 mb-m text-title tracking-tighter">
            Get the full SEO report, written from your own data
          </h2>
          <p className="m-0 mb-l max-w-copy text-body leading-relaxed text-text-muted">
            This one is a sample. The full report works from your Search Console and analytics,
            makes better-informed recommendations, and tracks whether each one worked.
          </p>
          <CtaButton href="/seo">Explore SEO reports</CtaButton>
        </div>
        <Image
          src="/images/seo/what-google-looks-at.webp"
          alt=""
          width={1536}
          height={1024}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="mx-auto block h-auto w-full max-w-[560px] rounded-lg border border-border-default"
        />
      </div>
    </section>
  );
}

export default function SampleReportPage() {
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

      <NextStep />
    </main>
  );
}
