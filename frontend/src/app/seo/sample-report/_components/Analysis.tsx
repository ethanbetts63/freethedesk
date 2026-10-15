import { cn } from '@/lib/utils';

import {
  BUSINESS,
  DAILY_CLICKS,
  DAILY_IMPRESSIONS,
  DAILY_MONTHS,
  PERIOD_START_INDEX,
  PROFILE_ACTIONS,
  PROFILE_MONTHS,
  SOURCES,
  VISITORS_BY_LINE,
} from '../_lib/report';
import { Exhibit, PairedBars } from './Exhibits';
import { LineChart } from './LineChart';
import { LimitCallout, cardClass, display, labelClass } from './ReportPrimitives';

/** A group label on a heavy rule, then one card per topic. */
function TileGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-2xl">
      <h3
        className={cn(
          labelClass,
          'm-0 mb-s border-b-2 border-text-secondary pb-xs text-label font-strong tracking-label-wide text-text-chrome',
        )}
      >
        {label}
      </h3>
      <div className="flex flex-col gap-s">{children}</div>
    </div>
  );
}

type Figure = { label: string; value: string; note: string };

function Tile({
  line,
  title,
  figures,
  children,
}: {
  line?: string;
  title: string;
  figures?: readonly Figure[];
  children: React.ReactNode;
}) {
  return (
    <article className={cardClass}>
      {line && <p className={cn(labelClass, 'm-0 mb-3xs text-action-primary')}>{line}</p>}
      <h4
        className={cn(
          display,
          'm-0 mb-s border-b border-border-subtle pb-s text-lead leading-snug font-strong text-text-primary',
        )}
      >
        {title}
      </h4>
      {figures && (
        <dl className="m-0 mb-s grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] border-b border-border-subtle">
          {figures.map((figure, index) => (
            <div
              key={figure.label}
              className={cn(
                'flex flex-col py-xs pr-m',
                index > 0 && 'border-l border-border-subtle pl-m',
              )}
            >
              <dt className={cn(labelClass, 'mb-3xs')}>{figure.label}</dt>
              <dd
                className={cn(
                  display,
                  'm-0 text-lead leading-none font-strong tracking-tight text-action-primary tabular-nums',
                )}
              >
                {figure.value}
              </dd>
              <dd className={cn(display, 'm-0 mt-3xs text-body-sm leading-snug text-text-subtle')}>
                {figure.note}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </article>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="m-0 mb-s last:mb-0">{children}</p>;
}

export function AnalysisIntro() {
  return (
    <>
      <Prose>
        September brought the site more than a third more clicks from Google than August, and Google
        showed it a fifth more often. The hot water page did the most of it: after it began leading
        with its prices on 9 September, its clicks from hot water searches more than doubled, while
        the site as a whole rose by a third. The homepage and searches for the business by name
        carried most of the rest.
      </Prose>
      <Prose>
        Every part of the business drew more visitors than in August, but blocked drains grew far
        less than it could. It is the line Google shows the site for most, and the page sits near
        the top of the first page for most of those searches, yet few people click it. The two
        plumbers above it answer the questions a searcher with a blocked drain is asking, which are
        how much and how soon. This page answers neither.
      </Prose>
      <Prose>
        Away from the site, the Business Profile had its busiest month, with calls and clicks
        through to the website both up. On the site itself a caller has a harder time: on a phone,
        the number sits inside the menu as plain text. The gas fitting page, retitled on 16
        September, has started to climb but is not yet on the first page.
      </Prose>
    </>
  );
}

const dailyLabels = DAILY_MONTHS.map(({ index, label }) => ({ at: index, label }));

export function AnalysisTiles() {
  return (
    <>
      <TileGroup label="The site as a whole">
        <Tile
          title="Google sent a third more clicks, and the hot water page took the largest share of the rise"
          figures={[
            {
              label: 'Clicks from Google',
              value: '+37%',
              note: '1 Sep to 30 Sep against 2 Aug to 31 Aug 2026',
            },
          ]}
        >
          <Exhibit caption="Clicks and impressions a day, 3 July to 30 September 2026">
            <LineChart
              ariaLabel="Clicks a day, left axis, and impressions a day, right axis, from 3 July to 30 September 2026, with September shaded as the reporting period. Both rise from mid-August, clicks most steeply from 9 September."
              series={[
                { label: 'Clicks', values: DAILY_CLICKS, tone: 'now' },
                { label: 'Impressions', values: DAILY_IMPRESSIONS, tone: 'second', axis: 'right' },
              ]}
              xLabels={dailyLabels}
              left={{ min: 0, max: 20, ticks: [0, 5, 10, 15, 20], title: 'Clicks a day' }}
              right={{
                min: 0,
                max: 400,
                ticks: [0, 100, 200, 300, 400],
                title: 'Impressions a day',
              }}
              shade={{
                from: PERIOD_START_INDEX,
                to: DAILY_CLICKS.length - 1,
                label: 'Reporting period',
              }}
            />
          </Exhibit>
          <Prose>
            Clicks have risen most weeks since mid-August, and the steepest week came straight after
            the hot water page changed. Showings grew more slowly than clicks, so a larger share of
            the people shown the site chose it.
          </Prose>
          <Prose>
            The site’s average place in the results rose by about three. On the searches it appeared
            for in both months it climbed about two places, so most of the gain is the site ranking
            higher where it already showed, not a change in which searches it showed for.
          </Prose>
          <LimitCallout>
            Part of this rise may be the end of winter, when hot water systems fail most often;
            there is no record of last September to compare against.
          </LimitCallout>
        </Tile>
      </TileGroup>

      <TileGroup label="Line by line">
        <Tile
          line="Every line of the business"
          title="Visitors from Google rose in every part of the business, and hot water more than doubled"
          figures={[
            {
              label: 'Hot water visitors from Google',
              value: '+115%',
              note: '1 Sep to 30 Sep against 2 Aug to 31 Aug 2026',
            },
            {
              label: 'Blocked-drain showings clicked',
              value: '1.2%',
              note: 'Blocked-drain searches, 1 Sep to 30 Sep 2026',
            },
            {
              label: 'The rest of the site',
              value: '4.3%',
              note: 'Every other search, same period',
            },
          ]}
        >
          <Exhibit
            caption="Visitors arriving from Google, by the part of the business they landed in"
            window="1 Sep to 30 Sep against 2 Aug to 31 Aug 2026; Australia only"
          >
            <PairedBars
              rows={VISITORS_BY_LINE}
              nowLabel="1 Sep to 30 Sep"
              beforeLabel="2 Aug to 31 Aug"
              valueTitle="Visitors from Google"
            />
          </Exhibit>
          <Prose>
            Hot water more than doubled once its prices moved to the top of the page. The homepage
            rose by about a quarter and gas fitting by about a sixth, and the suburb pages barely
            moved, which fits six pages Google treats as one.
          </Prose>
          <Prose>
            Blocked drains rose by about a sixth, and it is where the most is left. Google shows it
            more than any other page, around sixth for ‘blocked drain plumber’ and the searches like
            it, yet only about one showing in eighty becomes a click, against about one in
            twenty-five across the rest of the site. The two businesses above it lead their result
            with a call-out price and ‘same day’; this page leads with the year the business
            started. Recommendation 2 is the change.
          </Prose>
        </Tile>
      </TileGroup>

      <TileGroup label="Other ways in">
        <Tile
          line="The Business Profile"
          title="The Business Profile had its busiest month, and the growth was people calling and clicking through"
        >
          <Exhibit
            caption="What people did from the Business Profile, by month"
            window="May to September 2026, whole calendar months as Google’s profile panel shows them"
          >
            <LineChart
              ariaLabel={`Website clicks, calls and direction requests from the Business Profile, May to September 2026. Website clicks: ${PROFILE_ACTIONS.website.join(', ')}. Calls: ${PROFILE_ACTIONS.calls.join(', ')}. Directions: ${PROFILE_ACTIONS.directions.join(', ')}.`}
              series={[
                {
                  label: 'Website clicks',
                  values: PROFILE_ACTIONS.website,
                  tone: 'now',
                  dots: true,
                },
                { label: 'Calls', values: PROFILE_ACTIONS.calls, tone: 'second', dots: true },
                {
                  label: 'Directions',
                  values: PROFILE_ACTIONS.directions,
                  tone: 'compare',
                  dots: true,
                },
              ]}
              xLabels={PROFILE_MONTHS.map((label, at) => ({ at, label }))}
              left={{ min: 0, max: 120, ticks: [0, 40, 80, 120], title: 'Actions' }}
            />
          </Exhibit>
          <Prose>
            Calls from the profile rose by about a sixth in September and clicks through to the
            website by nearly a fifth. Directions barely moved, which fits a business that goes to
            the customer: few people need to find the workshop.
          </Prose>
          <Prose>
            The reviews tell the second story. Customers praise a fixed quote and a tidy job; the
            complaints that repeat are about a plumber who arrived late without a call. None of them
            has a reply, and every one sits where a customer comparing plumbers reads first.
          </Prose>
        </Tile>
      </TileGroup>
    </>
  );
}

export function Provenance() {
  const rows: readonly [string, string][] = [
    ['Property', `sc-domain:${BUSINESS.host.replace(/^www\./, '')}`],
    ['Market', 'AUS'],
    ['Search type', 'web'],
    ['Reporting period', BUSINESS.period],
    ['Data through', '30 September 2026'],
    ['Report version', BUSINESS.version],
  ];

  return (
    <section id="provenance" className={cn(cardClass, display, 'mt-2xl scroll-mt-2xl')}>
      <h2 className={cn(labelClass, 'm-0 mb-s font-strong text-action-primary')}>Provenance</h2>
      <dl className="m-0 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-m sm:grid-cols-[8rem_minmax(0,1fr)] gap-y-3xs text-body-sm">
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
              <td className="py-2xs pr-s text-text-secondary">{source.status}</td>
              <td className="hidden py-2xs text-text-secondary sm:table-cell">{source.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
