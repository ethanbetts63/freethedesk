import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CtaButton } from '@/components/CtaButton';
import { PageSchema } from '@/components/PageSchema';
import { SectionNumber } from '@/components/SectionNumber';
import { Wordmark } from '@/components/Wordmark';
import { metadataFor } from '@/lib/pages';
import { getSiteSettingsServer } from '@/lib/serverApi';
import { cn } from '@/lib/utils';

import { AnalysisIntro, AnalysisTiles, Provenance } from './_components/Analysis';
import { FoundationGroups } from './_components/Foundations';
import { ExperimentList, RecommendationList } from './_components/Recommendations';
import { ReportCover } from './_components/ReportCover';
import { ReportSection, cardClass, display, labelClass } from './_components/ReportPrimitives';
import { reportSerif } from './_lib/fonts';
import { seoAuditPrices, type SeoAuditPrices } from '../_lib/plans';
import { BUSINESS } from './_lib/report';

export const metadata: Metadata = metadataFor('/seo/sample-report');

/* The button's prices come from the admin, so this page renders per request. */
export const dynamic = 'force-dynamic';

const contents = [
  { number: '01', title: 'Recommendations', href: '#recommendations' },
  { number: '02', title: 'What changed, and what it did', href: '#experiments' },
  { number: '03', title: 'What holds the site up, and what does not', href: '#foundations' },
  { number: '04', title: 'What the data shows', href: '#analysis' },
] as const;

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

function Contents() {
  return (
    <nav aria-label="Report contents" className={cn(cardClass, display, 'mt-2xl')}>
      <h2 className="m-0 mb-s text-lead font-strong text-text-primary">Contents</h2>
      <ol className="m-0 list-none p-0">
        {contents.map((item) => (
          <li key={item.href} className="border-t border-border-subtle first:border-t-0">
            <a
              href={item.href}
              className="flex items-baseline gap-m py-xs text-body text-text-secondary no-underline hover:text-action-primary"
            >
              <span className="w-6 text-action-primary tabular-nums">{item.number}</span>
              {item.title}
            </a>
          </li>
        ))}
        <li className="border-t border-border-subtle">
          <a
            href="#provenance"
            className="flex items-baseline gap-m py-xs text-body text-text-secondary no-underline hover:text-action-primary"
          >
            <span className="w-6" />
            Provenance
          </a>
        </li>
      </ol>
    </nav>
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
      <ReportCover />

      <div className={cn(reportSerif.className, 'site-shell')}>
        <article className="mx-auto max-w-4xl text-body leading-relaxed">
          <Contents />

          <div className="mt-2xl">
            <ReportSection
              id="recommendations"
              number="01"
              kicker="What to do"
              title="Recommendations"
            >
              <RecommendationList />
            </ReportSection>
          </div>

          <ReportSection
            id="experiments"
            number="02"
            kicker="Running experiments"
            title="What changed, and what it did"
          >
            <ExperimentList />
          </ReportSection>

          <ReportSection
            id="foundations"
            number="03"
            kicker="Foundations"
            title="What holds the site up, and what does not"
          >
            <FoundationGroups />
          </ReportSection>

          <ReportSection
            id="analysis"
            number="04"
            kicker="Data analysis"
            title="What the data shows"
          >
            <AnalysisIntro />
            <AnalysisTiles />
          </ReportSection>

          <Provenance />

          <div
            className={cn(
              display,
              'mt-l flex flex-wrap items-center justify-between gap-m border-t border-border-subtle pt-s pb-s',
            )}
          >
            <span className="text-body-sm text-text-subtle">{BUSINESS.fullName} search report</span>
            <span className="flex items-center gap-s">
              <span className={cn(labelClass, 'tracking-label-wide')}>Report written by</span>
              <Wordmark size="mini" className="text-body" />
            </span>
          </div>
        </article>
      </div>

      <SampleCta prices={prices} />
    </main>
  );
}
