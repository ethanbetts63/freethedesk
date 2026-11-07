import { BUSINESS, type ShotKind } from '../_lib/report';
import { Logo, Stars } from './SiteMock';

/**
 * The screenshots a delivered report puts beside some recommendations, drawn
 * here because the sample's business has no site to capture. Each shows the
 * thing its recommendation is about, and nothing is a real brand: the rivals
 * and their addresses are invented, on the reserved `.example` suffix.
 */

/*
 * The frames are the engine's own (compose.shot, recommendations.css): a desktop shot in a browser window at the
 * address it was taken from, a phone shot in a handset, each floated beside what was found on the flat slab. The
 * stylesheet sizes an <img>; a drawing stands in its place and carries the same shape itself.
 */

/** A browser window around a drawing, with the address it was taken from. */
function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <figure className="rec__shot rec__shot--desktop">
      <div className="rec__shot-bar">
        <i />
        <i />
        <i />
        <span>{url}</span>
      </div>
      {children}
    </figure>
  );
}

/**
 * Recommendation 5: the phone header, menu open, the number inside it as plain text. Drawn a phone's shape (1.6 to
 * 2.3 times as tall as wide), as the engine now requires of a phone shot (shots.PHONE_SHOT_RATIO).
 */
function PhoneHeaderShot() {
  return (
    <figure className="rec__shot rec__shot--phone">
      <svg
        viewBox="8 8 200 330"
        // eslint-disable-next-line no-restricted-syntax -- the engine's .rec__shot--phone img, which rounds the screen 16px inside the handset
        className="block h-auto w-full overflow-hidden rounded-[16px]"
        role="img"
        aria-label={`The site on a phone with its menu open: the logo and a close button in the header, five links, and ${BUSINESS.phone} as plain grey text under them, with no call button.`}
      >
        <g>
          <rect x="8" y="8" width="200" height="330" className="fill-surface-page" />
          <Logo x={18} y={26} scale={0.62} />
          {/* The menu is open: its button is now a close cross, and still no call button. */}
          <g className="stroke-text-secondary" strokeWidth="2" strokeLinecap="round">
            <path d="M178 34 L190 46 M190 34 L178 46" />
          </g>
          <line x1="8" y1="64" x2="208" y2="64" className="stroke-border-subtle" />
          <g fontSize="12" fontWeight={700} className="fill-text-secondary">
            {['Hot water', 'Blocked drains', 'Gas fitting', 'Areas we cover', 'Contact'].map(
              (label, i) => (
                <g key={label}>
                  <text x="22" y={92 + i * 34}>
                    {label}
                  </text>
                  <line
                    x1="22"
                    y1={104 + i * 34}
                    x2="194"
                    y2={104 + i * 34}
                    className="stroke-border-subtle"
                  />
                </g>
              ),
            )}
          </g>
          <text x="22" y="276" fontSize="9" className="fill-text-subtle">
            Call us on {BUSINESS.phone}
          </text>
        </g>
      </svg>
    </figure>
  );
}

const TABS = ['Home', 'Hot water', 'Blocked Drains', 'Gas Fitting', 'Services', 'About', 'Contact'];

/**
 * Recommendation 1: the site's pages open in a row of tabs, every title its menu name and the business, and the
 * page under them headed by the logo.
 */
function PageTitlesShot() {
  return (
    <BrowserFrame url={`${BUSINESS.host.replace(/^www\./, '')} › every page`}>
      <svg
        viewBox="0 0 360 240"
        className="block h-auto w-full"
        role="img"
        aria-label={`Seven of the site's pages open in browser tabs. Each tab reads its menu name and then the business: 'Home | ${BUSINESS.fullName}', 'Blocked Drains | ${BUSINESS.fullName}' and so on. The open page's main heading is the logo.`}
      >
        <rect width="360" height="240" className="fill-surface-muted" />
        {/* The tab strip: the open tab stands proud, the rest sit behind it, each title cut by its tab's width. */}
        {TABS.map((tab, i) => {
          const x = 6 + i * 50;
          const open = i === 2;
          return (
            <g key={tab}>
              <path
                d={`M${x} 34 V12 a4 4 0 0 1 4 -4 H${x + 44} a4 4 0 0 1 4 4 V34 Z`}
                className={open ? 'fill-surface-page' : 'fill-surface-tint-strong'}
              />
              <text
                x={x + 7}
                y="24"
                fontSize="7"
                fontWeight={open ? 700 : 500}
                className={open ? 'fill-text-secondary' : 'fill-text-muted'}
              >
                {`${tab} | ${BUSINESS.name.slice(0, open ? 9 : 6)}…`}
              </text>
            </g>
          );
        })}
        <rect x="0" y="34" width="360" height="206" className="fill-surface-page" />
        <text x="14" y="52" fontSize="8.5" className="fill-text-subtle">
          {`Blocked Drains | ${BUSINESS.fullName}`}
        </text>
        <line x1="0" y1="60" x2="360" y2="60" className="stroke-border-subtle" />
        {/* The page's main heading, outlined: it is the logo, on this page as on every other. */}
        <rect
          x="14"
          y="72"
          width="200"
          height="44"
          rx="4"
          fill="none"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          className="stroke-fill-warning"
        />
        <Logo x={26} y={80} scale={0.8} />
        <text x="222" y="98" fontSize="8" fontWeight={700} className="fill-fill-warning">
          h1
        </text>
        <text x="14" y="146" fontSize="16" fontWeight={800} className="fill-text-secondary">
          Blocked Drains
        </text>
        <g fontSize="8.5" className="fill-text-muted">
          <text x="14" y="166">
            {`${BUSINESS.name} has served Perth families since 1998. A family`}
          </text>
          <text x="14" y="179">
            owned and operated business you can trust, with a plumber on
          </text>
          <text x="14" y="192">
            call across the northern suburbs.
          </text>
        </g>
        <rect x="14" y="206" width="110" height="20" rx="10" className="fill-action-primary" />
        <text
          x="69"
          y="219"
          fontSize="8.5"
          fontWeight={700}
          textAnchor="middle"
          className="fill-text-on-dark"
        >
          Get a quote
        </text>
      </svg>
    </BrowserFrame>
  );
}

type Result = { site: string; url: string; title: string; lines: readonly string[] };

const RESULTS: readonly Result[] = [
  {
    site: 'Banksia Drains',
    url: 'banksiadrains.example › blocked-drains',
    title: 'Blocked Drains Perth | From $149, Same Day',
    lines: [
      'Blocked drain cleared from $149, call-out included. Same-day',
      'across Perth, 7 days. Fixed price before we start.',
    ],
  },
  {
    site: 'Coastline Plumbing',
    url: 'coastlineplumbing.example › drains',
    title: 'Blocked Drain Plumber Perth - Same Day Service',
    lines: [
      'Same-day blocked drain clearing from $165. Camera inspection',
      'and jetting. Northern and western suburbs.',
    ],
  },
  {
    site: BUSINESS.fullName,
    url: `${BUSINESS.host.replace(/^www\./, '')} › blocked-drains`,
    title: `Blocked Drains | ${BUSINESS.fullName}`,
    lines: [
      `${BUSINESS.name} has served Perth families since 1998. A`,
      'family owned and operated business you can trust.',
    ],
  },
];

/** Recommendation 4: the results for a blocked-drain search, the two above with a price, this one with a history. */
function SearchResultShot() {
  return (
    <BrowserFrame url="google.com/search?q=blocked+drain+plumber+perth">
      <svg
        viewBox="0 0 360 300"
        className="block h-auto w-full"
        role="img"
        aria-label={`Google's results for blocked drain plumber perth. Banksia Drains and Coastline Plumbing lead with a price and same-day service; ${BUSINESS.fullName}, third, describes itself as serving Perth families since 1998.`}
      >
        <rect width="360" height="300" className="fill-surface-page" />
        <rect
          x="16"
          y="14"
          width="328"
          height="26"
          rx="13"
          className="fill-surface-page stroke-border-default"
        />
        <text x="30" y="31" fontSize="10" className="fill-text-secondary">
          blocked drain plumber perth
        </text>
        {RESULTS.map((result, i) => {
          const y = 62 + i * 78;
          return (
            <g key={result.site}>
              <circle cx="26" cy={y + 4} r="7" className="fill-surface-tint-strong" />
              <text
                x="40"
                y={y + 2}
                fontSize="8.5"
                fontWeight={700}
                className="fill-text-secondary"
              >
                {result.site}
              </text>
              <text x="40" y={y + 12} fontSize="7.5" className="fill-text-subtle">
                {result.url}
              </text>
              <text x="18" y={y + 30} fontSize="11" className="fill-action-primary">
                {result.title}
              </text>
              {result.lines.map((line, j) => (
                <text
                  key={line}
                  x="18"
                  y={y + 45 + j * 12}
                  fontSize="8.5"
                  className="fill-text-muted"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </BrowserFrame>
  );
}

const REVIEWS = [
  {
    name: 'Karen M.',
    stars: 2,
    when: '3 weeks ago',
    lines: [
      'Told the plumber would come between 8 and 10.',
      'He turned up at half twelve and nobody rang.',
      'The repair itself was fine.',
    ],
  },
  {
    name: 'Daniel T.',
    stars: 5,
    when: '1 month ago',
    lines: [
      'Marcus gave a fixed price before he started and',
      'it didn’t change. Left the laundry tidier than he',
      'found it.',
    ],
  },
] as const;

/** Recommendation 6: the Business Profile's reviews, a late arrival among them, and no reply under any. */
function ReviewsShot() {
  return (
    <BrowserFrame url="google.com/maps › Wattle & Wrench Plumbing › Reviews">
      <svg
        viewBox="0 0 360 290"
        className="block h-auto w-full"
        role="img"
        aria-label={`${BUSINESS.fullName}'s Google reviews: 4.6 from 64 reviews. A two-star review describes a plumber arriving more than two hours late without a call; a five-star review praises Marcus for a fixed price. Neither has a reply from the business.`}
      >
        <rect width="360" height="290" className="fill-surface-page" />
        <text x="18" y="34" fontSize="26" fontWeight={800} className="fill-text-secondary">
          4.6
        </text>
        <Stars x={66} y={18} size={11} />
        <text x="66" y="42" fontSize="9" className="fill-text-subtle">
          64 reviews
        </text>
        <line x1="18" y1="56" x2="342" y2="56" className="stroke-border-subtle" />
        {REVIEWS.map((review, i) => {
          const y = 80 + i * 108;
          return (
            <g key={review.name}>
              <circle cx="30" cy={y} r="11" className="fill-surface-tint-strong" />
              <text
                x="30"
                y={y + 4}
                fontSize="10"
                fontWeight={700}
                textAnchor="middle"
                className="fill-text-chrome"
              >
                {review.name[0]}
              </text>
              <text x="48" y={y - 2} fontSize="10" fontWeight={700} className="fill-text-secondary">
                {review.name}
              </text>
              <g className="fill-fill-warning">
                {Array.from({ length: 5 }, (_, s) => (
                  <path
                    key={s}
                    d="M5 0l1.5 3.3 3.5.4-2.6 2.4.7 3.5L5 7.9 1.9 9.6l.7-3.5L0 3.7l3.5-.4z"
                    transform={`translate(${48 + s * 11} ${y + 5}) scale(0.9)`}
                    className={s < review.stars ? undefined : 'fill-border-default'}
                  />
                ))}
              </g>
              <text x="108" y={y + 13} fontSize="8.5" className="fill-text-subtle">
                {review.when}
              </text>
              {review.lines.map((line, j) => (
                <text
                  key={line}
                  x="48"
                  y={y + 32 + j * 13}
                  fontSize="9.5"
                  className="fill-text-muted"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </BrowserFrame>
  );
}

const PROFILE_ROWS = [
  { label: 'Category', value: 'Contractor', flag: true },
  { label: 'Address', value: '14 Peregrine Way, Kingsley', flag: true },
  { label: 'Service area', value: 'None set', flag: true },
  { label: 'Hours', value: 'Mon to Fri 7am to 5pm · Sat, Sun closed', flag: true },
  { label: 'Services', value: '3 listed', flag: false },
  { label: 'Reviews', value: '4.6 from 64 · no replies', flag: false },
] as const;

/** Recommendation 8: the Business Profile's details, as the owner's edit page lists them. */
function ProfileDetailsShot() {
  return (
    <BrowserFrame url={`google.com › ${BUSINESS.fullName} › Edit profile`}>
      <svg
        viewBox="0 0 360 300"
        className="block h-auto w-full"
        role="img"
        aria-label={`${BUSINESS.fullName}'s Business Profile, as the owner edits it. Category: Contractor. Address: a house in Kingsley. Service area: none set. Hours: Monday to Friday 7am to 5pm, closed Saturday and Sunday. Services: three listed. Reviews: 4.6 from 64, no replies.`}
      >
        <rect width="360" height="300" className="fill-surface-page" />
        <text x="18" y="30" fontSize="13" fontWeight={800} className="fill-text-secondary">
          About your business
        </text>
        <line x1="18" y1="44" x2="342" y2="44" className="stroke-border-subtle" />
        {PROFILE_ROWS.map((row, i) => {
          const y = 70 + i * 40;
          return (
            <g key={row.label}>
              <text x="18" y={y} fontSize="8" fontWeight={700} className="fill-text-subtle">
                {row.label.toUpperCase()}
              </text>
              <text x="18" y={y + 15} fontSize="10.5" className="fill-text-secondary">
                {row.value}
              </text>
              {/* A pencil at the row's end: each of these is a setting the owner can change. */}
              <path
                d={`M326 ${y + 2} l8 -8 l5 5 l-8 8 h-5 z`}
                className={row.flag ? 'fill-fill-warning' : 'fill-border-default'}
              />
              <line x1="18" y1={y + 26} x2="342" y2={y + 26} className="stroke-border-subtle" />
            </g>
          );
        })}
      </svg>
    </BrowserFrame>
  );
}

const SHOTS: Record<ShotKind, () => React.JSX.Element> = {
  'phone-header': PhoneHeaderShot,
  'page-titles': PageTitlesShot,
  'search-results': SearchResultShot,
  reviews: ReviewsShot,
  'profile-details': ProfileDetailsShot,
};

export function RecShot({ kind }: { kind: ShotKind }) {
  const Shot = SHOTS[kind];
  return <Shot />;
}
