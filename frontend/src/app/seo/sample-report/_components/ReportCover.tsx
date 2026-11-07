import { BUSINESS, COVER_CLICKS, RECOMMENDATIONS, issueCounts } from '../_lib/report';
import { Credits } from './Credits';
import { DesktopMock, PhoneMock } from './SiteMock';

/**
 * Page one, as render.py builds it: the masthead (the version and the site on one line, the business's name over
 * "search report." in blue, a sentence saying what the report reads and when), the site in a browser frame with
 * the phone over its corner, the cover row, and the credits at the foot. The drawn mocks stand where a delivered
 * report's screenshots do, since the invented business has no site to capture.
 */
export function ReportCover() {
  const counts = issueCounts(RECOMMENDATIONS);
  return (
    <div className="cover-page">
      <div className="cover">
        <header className="masthead">
          <div className="masthead__top">
            <span className="masthead__eyebrow">
              <i className="masthead__dot" />
              Search report · {BUSINESS.version}
            </span>
            {/* The engine links the host; an invented one leads nowhere, so it stands as text. */}
            <span className="masthead__host">{BUSINESS.host}</span>
          </div>
          <h1>
            {BUSINESS.fullName}
            <span className="masthead__second">search report.</span>
          </h1>
          <p className="masthead__meta">
            How people found and used {BUSINESS.host} in search, <strong>{BUSINESS.period}</strong>.
          </p>
        </header>

        <div className="cover-shots">
          <figure className="browser-shot">
            <div className="browser-shot__bar">
              <i />
              <i />
              <i />
              <span>{BUSINESS.host}</span>
            </div>
            <DesktopMock />
          </figure>
          <figure className="phone-shot">
            <PhoneMock />
          </figure>
        </div>

        {/* The owner's cover row (vocab.OWNER_COVER): the issues by impact, then the clicks against the period
            before, its label saying how long that is (compose.stats). */}
        <div className="stat-row stat-row--counts">
          <div className="stat stat--high">
            <span className="stat__value">{counts.high}</span>
            <span className="stat__label">High-impact issues</span>
          </div>
          <div className="stat stat--medium">
            <span className="stat__value">{counts.medium}</span>
            <span className="stat__label">Medium-impact issues</span>
          </div>
          <div className="stat stat--low">
            <span className="stat__value">{counts.low}</span>
            <span className="stat__label">Low-impact issues</span>
          </div>
          <div className="stat stat--clicks">
            <span className="stat__value">{COVER_CLICKS}</span>
            <span className="stat__label">Clicks (30 day period)</span>
          </div>
        </div>
      </div>
      <Credits where="cover" />
    </div>
  );
}
