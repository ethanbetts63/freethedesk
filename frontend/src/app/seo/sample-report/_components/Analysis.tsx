import { Fragment } from 'react';

import {
  BUSINESS,
  OVERVIEW,
  QUESTIONS,
  SOURCES,
  type Question,
  type SourceStatus,
} from '../_lib/report';
import { Bars, Exhibit, PairedBars } from './Exhibits';

/** The month in three paragraphs, before the questions (the overview's blocks, as compose.analysis prints them). */
export function AnalysisOverview() {
  return (
    <>
      {OVERVIEW.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </>
  );
}

/** One question a tile, as compose.tile writes it: the question, the chart that answers it, then why. */
function Tile({ question }: { question: Question }) {
  const { chart } = question;
  return (
    <article className="tile" id={question.id}>
      <h4 className="tile__title">{question.title}</h4>
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
        <p key={paragraph}>{paragraph}</p>
      ))}
    </article>
  );
}

export function AnalysisQuestions() {
  return (
    <>
      {QUESTIONS.map((question) => (
        <Tile key={question.id} question={question} />
      ))}
    </>
  );
}

/** The sources table's words, fixed in the engine (render.SOURCE_STATUS, SOURCE_NOT_READ). */
const STATUS: Record<SourceStatus, string> = {
  present: 'Read',
  partial: 'Partly read',
  absent: 'Not shared',
  'not configured': 'Not set up',
};
const NOT_READ: Partial<Record<SourceStatus, string>> = {
  absent: 'The owner has not shared it yet.',
  'not configured': 'The site does not run it yet.',
};

/** Back matter, as render.provenance_block writes it for an owner report, on the last page with the credits. */
export function Provenance() {
  const rows: readonly [string, string][] = [
    ['Property', `sc-domain:${BUSINESS.host.replace(/^www\./, '')}`],
    ['Market', 'AUS'],
    ['Search type', 'web'],
    ['Reporting period', BUSINESS.period],
    ['Data through', '30 September 2026'],
    ['Stored history', '2 January 2026 onward, 272 days'],
    ['Report version', BUSINESS.version],
    ['Engine', '1.6.0'],
    ['Extracted', '2026-10-03 06:12 UTC'],
  ];

  return (
    <section className="provenance" id="provenance">
      <h2>Where the data came from</h2>
      <dl>
        {rows.map(([term, value]) => (
          <Fragment key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Status</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {SOURCES.map((source) => (
            <tr key={source.source}>
              <td>{source.source}</td>
              <td>{STATUS[source.status]}</td>
              <td>{NOT_READ[source.status] ?? source.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
