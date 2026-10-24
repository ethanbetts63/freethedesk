import { cn } from '@/lib/utils';

import { BUSINESS, type ShotKind } from '../_lib/report';
import { display } from './ReportPrimitives';
import { Logo, Stars } from './SiteMock';

/**
 * The screenshots a delivered report puts beside some recommendations, drawn
 * here because the sample's business has no site to capture. Each shows the
 * thing its recommendation is about, and nothing is a real brand: the rivals
 * and their addresses are invented, on the reserved `.example` suffix.
 */

/** A browser window around a drawing, with the address it was taken from. */
function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-md border border-border-default bg-surface-page shadow-s">
      <div className="flex items-center gap-2xs border-b border-border-subtle bg-surface-muted px-xs py-2xs">
        <span aria-hidden="true" className="size-2xs rounded-full bg-fill-danger" />
        <span aria-hidden="true" className="size-2xs rounded-full bg-fill-warning" />
        <span aria-hidden="true" className="size-2xs rounded-full bg-fill-success" />
        <span
          className={cn(
            display,
            'ml-2xs min-w-0 flex-1 truncate rounded-sm border border-border-subtle bg-surface-page px-2xs text-caption text-text-subtle',
          )}
        >
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

/** Recommendation 1: the phone header, menu open, the number inside it as plain text. */
function PhoneHeaderShot() {
  return (
    <svg
      viewBox="0 0 216 300"
      className="mx-auto block h-auto w-full max-w-[13rem]"
      role="img"
      aria-label={`The site on a phone with its menu open: the logo and a close button in the header, five links, and ${BUSINESS.phone} as plain grey text under them, with no call button.`}
    >
      <rect width="216" height="300" rx="26" className="fill-text-primary" />
      <clipPath id="rec-phone-screen">
        <rect x="8" y="8" width="200" height="292" rx="20" />
      </clipPath>
      <g clipPath="url(#rec-phone-screen)">
        <rect x="8" y="8" width="200" height="292" className="fill-surface-page" />
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

/** Recommendation 2: the results for a blocked-drain search, the two above with a price, this one with a history. */
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
      'Fixed price before he started and it didn’t',
      'change. Left the laundry tidier than he found it.',
    ],
  },
] as const;

/** Recommendation 5: the Business Profile's reviews, a late arrival among them, and no reply under any. */
function ReviewsShot() {
  return (
    <BrowserFrame url="google.com/maps › Wattle & Wrench Plumbing › Reviews">
      <svg
        viewBox="0 0 360 290"
        className="block h-auto w-full"
        role="img"
        aria-label={`${BUSINESS.fullName}'s Google reviews: 4.6 from 64 reviews. A two-star review describes a plumber arriving more than two hours late without a call; a five-star review praises the fixed price. Neither has a reply from the business.`}
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

/** Recommendation 6: the contact page after a quote request, with three different reply promises on it. */
function QuoteThanksShot() {
  return (
    <BrowserFrame url={`${BUSINESS.host.replace(/^www\./, '')}/contact`}>
      <svg
        viewBox="0 0 360 290"
        className="block h-auto w-full"
        role="img"
        aria-label="The contact page after a quote request is sent. The form is replaced by 'Thanks, we'll be in touch' and nothing else. Beside it the page says 'We call back within the hour', and the footer says 'Quotes answered the same business day'."
      >
        <rect width="360" height="290" className="fill-surface-page" />
        <Logo x={16} y={12} scale={0.6} />
        <line x1="0" y1="44" x2="360" y2="44" className="stroke-border-subtle" />
        <text x="18" y="74" fontSize="16" fontWeight={800} className="fill-text-secondary">
          Get a quote
        </text>
        <g fontSize="8.5" className="fill-text-muted">
          <text x="18" y="94">
            Tell us what needs fixing.
          </text>
          <text x="18" y="107">
            We call back within the hour.
          </text>
        </g>
        {/* Where the form was: one line, and no confirmation sent. */}
        <rect
          x="180"
          y="62"
          width="162"
          height="130"
          rx="5"
          className="fill-surface-muted stroke-border-default"
        />
        <circle cx="261" cy="104" r="14" className="fill-surface-success" />
        <path
          d="M254 104 l5 5 l9 -10"
          fill="none"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-text-success"
        />
        <text
          x="261"
          y="140"
          fontSize="10.5"
          fontWeight={700}
          textAnchor="middle"
          className="fill-text-secondary"
        >
          Thanks, we’ll be in touch.
        </text>
        <rect x="0" y="232" width="360" height="58" className="fill-surface-dark" />
        <g fontSize="8.5" className="fill-text-on-dark-muted">
          <text x="18" y="256">
            {BUSINESS.phone} · Northern suburbs
          </text>
          <text x="18" y="272">
            Quotes answered the same business day
          </text>
        </g>
      </svg>
    </BrowserFrame>
  );
}

/** Recommendation 9: the Business Profile's services and updates, and photos that are all of the vans. */
function ProfileServicesShot() {
  return (
    <BrowserFrame url={`google.com › ${BUSINESS.fullName} › Edit profile`}>
      <svg
        viewBox="0 0 360 300"
        className="block h-auto w-full"
        role="img"
        aria-label={`${BUSINESS.fullName}'s Business Profile. Services: three, all under Plumber, with no descriptions. Updates: no posts yet. Photos: four, every one of the work vans.`}
      >
        <rect width="360" height="300" className="fill-surface-page" />
        <text x="18" y="30" fontSize="13" fontWeight={800} className="fill-text-secondary">
          Services
        </text>
        <text x="18" y="50" fontSize="9" fontWeight={700} className="fill-text-chrome">
          Plumber
        </text>
        {['General plumbing', 'Hot water', 'Drains'].map((service, i) => (
          <g key={service}>
            <text x="18" y={70 + i * 20} fontSize="9.5" className="fill-text-muted">
              {service}
            </text>
            <line
              x1="18"
              y1={76 + i * 20}
              x2="342"
              y2={76 + i * 20}
              className="stroke-border-subtle"
            />
          </g>
        ))}
        <text x="18" y="148" fontSize="13" fontWeight={800} className="fill-text-secondary">
          Updates
        </text>
        <text x="18" y="166" fontSize="9.5" className="fill-text-subtle">
          No posts yet
        </text>
        <text x="18" y="200" fontSize="13" fontWeight={800} className="fill-text-secondary">
          Photos
        </text>
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${18 + i * 82} 214)`}>
            <rect width="74" height="62" rx="4" className="fill-surface-tint-strong" />
            {/* A work van, side on. */}
            <path d="M8 40 V22 H44 L56 30 H66 V40 Z" className="fill-surface-page" />
            <rect x="12" y="25" width="24" height="7" rx="1" className="fill-action-primary" />
            <circle cx="20" cy="42" r="5" className="fill-text-chrome" />
            <circle cx="54" cy="42" r="5" className="fill-text-chrome" />
          </g>
        ))}
      </svg>
    </BrowserFrame>
  );
}

const SHOTS: Record<ShotKind, () => React.JSX.Element> = {
  'phone-header': PhoneHeaderShot,
  'search-results': SearchResultShot,
  reviews: ReviewsShot,
  'quote-thanks': QuoteThanksShot,
  'profile-services': ProfileServicesShot,
};

export function RecShot({ kind }: { kind: ShotKind }) {
  const Shot = SHOTS[kind];
  return (
    <figure className="m-0 mb-s md:mb-0">
      <Shot />
    </figure>
  );
}
