import { cn } from '@/lib/utils';

import { BUSINESS, OVERVIEW, QUESTIONS, SOURCES, type Question } from '../_lib/report';
import { Bars, Exhibit, PairedBars } from './Exhibits';
import { cardClass, display, labelClass } from './ReportPrimitives';

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="m-0 mb-s last:mb-0">{children}</p>;
}

/** The month in three paragraphs, before the questions. */
export function AnalysisOverview() {
  return (
    <div className="mb-xl">
      {OVERVIEW.map((paragraph) => (
        <Prose key={paragraph}>{paragraph}</Prose>
      ))}
    </div>
  );
}

function QuestionCard({ question }: { question: Question }) {
  const { chart } = question;
  return (
    <article id={question.id} className={cn(cardClass, 'scroll-mt-2xl')}>
      <h3 className={cn(display, 'm-0 text-body leading-snug font-strong text-text-primary')}>
        {question.title}
      </h3>
      <Exhibit caption={question.caption} window={question.window}>
        {chart.kind === 'paired' ? (
          <PairedBars
            rows={chart.rows}
            nowLabel={chart.nowLabel}
            beforeLabel={chart.beforeLabel}
            valueTitle={chart.valueTitle}
          />
        ) : (
          <Bars rows={chart.rows} highlight={chart.highlight} valueTitle={chart.valueTitle} />
        )}
      </Exhibit>
      {question.paragraphs.map((paragraph) => (
        <Prose key={paragraph}>{paragraph}</Prose>
      ))}
    </article>
  );
}

/** Each question a card: the question, the chart that answers it, then why. */
export function AnalysisQuestions() {
  return (
    <div className="flex flex-col gap-s">
      {QUESTIONS.map((question) => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </div>
  );
}

export function Provenance() {
  const rows: readonly [string, string][] = [
    ['Property', `sc-domain:${BUSINESS.host.replace(/^www\./, '')}`],
    ['Market', 'AUS'],
    ['Search type', 'web'],
    ['Reporting period', BUSINESS.period],
    ['Data through', '30 September 2026'],
    ['Stored history', '2 January 2026 onward, 272 days'],
    ['Report version', BUSINESS.version],
  ];

  return (
    <section id="provenance" className={cn(cardClass, display, 'mt-2xl scroll-mt-2xl')}>
      <h2 className={cn(labelClass, 'm-0 mb-s font-strong text-action-primary')}>
        Where the data came from
      </h2>
      <dl className="m-0 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-m gap-y-3xs text-body-sm sm:grid-cols-[8rem_minmax(0,1fr)]">
        {rows.map(([term, value]) => (
          <div key={term} className="contents">
            <dt className="text-text-subtle">{term}</dt>
            <dd className="m-0 break-all text-text-secondary">{value}</dd>
          </div>
        ))}
      </dl>
      <table className="mt-ml w-full border-collapse text-left text-body-sm">
        <thead>
          <tr className={labelClass}>
            <th className="pr-s pb-xs font-strong">Source</th>
            <th className="pr-s pb-xs font-strong">Status</th>
            <th className="hidden pb-xs font-strong sm:table-cell">Detail</th>
          </tr>
        </thead>
        <tbody>
          {SOURCES.map((source) => (
            <tr key={source.source} className="border-t border-border-subtle align-top">
              <td className="py-2xs pr-s text-text-muted">
                {source.source}
                <span className="block text-text-subtle sm:hidden">{source.detail}</span>
              </td>
              <td className="py-2xs pr-s whitespace-nowrap text-text-secondary">{source.status}</td>
              <td className="hidden py-2xs text-text-secondary sm:table-cell">{source.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
