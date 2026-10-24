import { BUSINESS } from '../_lib/report';

/**
 * The invented business's homepage, drawn rather than screenshotted: a real
 * report's cover carries the client's own site, and this one has no site to
 * capture. Drawn in the site's tokens so nothing here is a real brand. The
 * phone view keeps the detail recommendation 1 is about: the header has a
 * menu button and no call button.
 */

export function Logo({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M12 0 C12 0 0 14 0 21 a12 12 0 0 0 24 0 C24 14 12 0 12 0Z"
        className="fill-action-primary"
      />
      <path
        d="M7 21 a5 5 0 0 0 5 5"
        fill="none"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="stroke-surface-page"
      />
      <text x="32" y="17" fontSize="17" fontWeight={800} className="fill-text-secondary">
        {BUSINESS.name}
      </text>
      <text
        x="32"
        y="31"
        fontSize="8.5"
        fontWeight={700}
        letterSpacing="2.4"
        className="fill-text-subtle"
      >
        PLUMBING · PERTH
      </text>
    </g>
  );
}

export function Stars({ x, y, size = 11 }: { x: number; y: number; size?: number }) {
  const star = 'M5 0l1.5 3.3 3.5.4-2.6 2.4.7 3.5L5 7.9 1.9 9.6l.7-3.5L0 3.7l3.5-.4z';
  return (
    <g transform={`translate(${x} ${y})`} className="fill-fill-warning">
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={star} transform={`translate(${i * (size + 2)} 0) scale(${size / 10})`} />
      ))}
    </g>
  );
}

/** Pipes and a tap, as the hero's artwork. */
function Pipework({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="150" cy="140" r="128" className="fill-surface-dark-soft" />
      <path d="M20 200 H110 V110 H220" strokeWidth="26" className="stroke-accent" />
      <path
        d="M20 200 H110 V110 H220"
        strokeWidth="8"
        className="stroke-surface-dark"
        strokeDasharray="1 34"
      />
      <rect x="206" y="88" width="34" height="44" rx="6" className="fill-accent" />
      <path d="M223 88 V64 M204 64 H242" strokeWidth="9" className="stroke-surface-page" />
      <path d="M240 118 H262 V142" strokeWidth="12" className="stroke-accent" />
      <path d="M262 160 c-7 10 -7 16 0 18 c7 -2 7 -8 0 -18z" className="fill-accent-on-dark" />
      <circle cx="110" cy="200" r="17" className="fill-surface-page" />
      <circle cx="110" cy="200" r="6" className="fill-action-primary" />
    </g>
  );
}

export function DesktopMock() {
  return (
    <svg viewBox="0 0 960 540" className="block h-auto w-full" aria-hidden="true">
      <rect width="960" height="540" className="fill-surface-page" />
      {/* Header */}
      <Logo x={36} y={16} />
      <g fontSize="12.5" fontWeight={600} className="fill-text-chrome">
        <text x="350" y="40">
          Hot water
        </text>
        <text x="436" y="40">
          Blocked drains
        </text>
        <text x="547" y="40">
          Gas fitting
        </text>
        <text x="634" y="40">
          Areas
        </text>
        <text x="690" y="40">
          Contact
        </text>
      </g>
      <text x="770" y="40" fontSize="12" fontWeight={700} className="fill-text-secondary">
        {BUSINESS.phone}
      </text>
      <rect x="868" y="20" width="62" height="30" rx="4" className="fill-action-primary" />
      <text
        x="899"
        y="39.5"
        fontSize="10.5"
        fontWeight={700}
        textAnchor="middle"
        className="fill-surface-page"
      >
        Quote
      </text>

      {/* Hero */}
      <rect y="68" width="960" height="320" className="fill-surface-dark" />
      <g className="stroke-surface-dark-soft" strokeWidth="1">
        {Array.from({ length: 15 }, (_, i) => (
          <line key={`v${i}`} x1={i * 64} x2={i * 64} y1="68" y2="388" />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`h${i}`} x1="0" x2="960" y1={68 + i * 64} y2={68 + i * 64} />
        ))}
      </g>
      <text
        x="56"
        y="128"
        fontSize="11"
        fontWeight={700}
        letterSpacing="2.6"
        className="fill-accent"
      >
        NORTHERN SUBURBS · SINCE 1998
      </text>
      <g fontSize="46" fontWeight={900} letterSpacing="-1.6" className="fill-surface-page">
        <text x="54" y="184">
          Perth plumbing,
        </text>
        <text x="54" y="234" className="fill-accent">
          fixed the same day.
        </text>
      </g>
      <g fontSize="14.5" className="fill-text-on-dark-muted">
        <text x="56" y="272">
          Hot water, blocked drains and gas fitting from licensed
        </text>
        <text x="56" y="294">
          plumbers, with a fixed quote before we start.
        </text>
      </g>
      <rect x="56" y="318" width="140" height="40" rx="4" className="fill-action-primary" />
      <text
        x="126"
        y="343"
        fontSize="12"
        fontWeight={700}
        textAnchor="middle"
        className="fill-surface-page"
      >
        GET A QUOTE →
      </text>
      <rect
        x="208"
        y="318"
        width="140"
        height="40"
        rx="4"
        fill="none"
        strokeWidth="1.5"
        className="stroke-text-on-dark-muted"
      />
      <text
        x="278"
        y="343"
        fontSize="12"
        fontWeight={700}
        textAnchor="middle"
        className="fill-surface-page"
      >
        OUR SERVICES
      </text>
      <Pipework x={590} y={90} />

      {/* Reviews and services strip */}
      <rect y="388" width="960" height="152" className="fill-surface-muted" />
      <Stars x={56} y={408} />
      <text x="128" y="417" fontSize="12" fontWeight={700} className="fill-text-secondary">
        4.6 on Google
      </text>
      {[
        { title: 'Hot water', note: 'From $1,490 installed' },
        { title: 'Blocked drains', note: 'Since 1998' },
        { title: 'Gas fitting', note: 'Licensed gas fitters' },
      ].map((card, i) => (
        <g key={card.title} transform={`translate(${56 + i * 290} 436)`}>
          <rect
            width="270"
            height="84"
            rx="6"
            className="fill-surface-page stroke-border-default"
          />
          <rect x="18" y="18" width="30" height="30" rx="15" className="fill-surface-info" />
          <text x="62" y="38" fontSize="15" fontWeight={800} className="fill-text-secondary">
            {card.title}
          </text>
          <text x="62" y="58" fontSize="11.5" className="fill-text-muted">
            {card.note}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function PhoneMock() {
  return (
    <svg viewBox="0 0 228 456" className="block h-auto w-full" aria-hidden="true">
      {/* The slab behind the handset, as every visual on the site carries one. */}
      <rect x="12" y="12" width="216" height="444" rx="30" className="fill-surface-tint-strong" />
      <rect width="216" height="444" rx="30" className="fill-text-primary" />
      <clipPath id="sample-phone-screen">
        <rect x="8" y="8" width="200" height="428" rx="23" />
      </clipPath>
      <g clipPath="url(#sample-phone-screen)">
        <rect x="8" y="8" width="200" height="428" className="fill-surface-page" />
        <Logo x={18} y={26} scale={0.62} />
        {/* The menu button, and no call button beside it. */}
        <g className="stroke-text-secondary" strokeWidth="2" strokeLinecap="round">
          <path d="M176 36 H192 M176 42 H192 M176 48 H192" />
        </g>
        <rect x="8" y="66" width="200" height="214" className="fill-surface-dark" />
        <text
          x="22"
          y="94"
          fontSize="7"
          fontWeight={700}
          letterSpacing="1.6"
          className="fill-accent"
        >
          NORTHERN SUBURBS
        </text>
        <g fontSize="22" fontWeight={900} letterSpacing="-0.8" className="fill-surface-page">
          <text x="21" y="124">
            Perth plumbing,
          </text>
          <text x="21" y="150" className="fill-accent">
            fixed the
          </text>
          <text x="21" y="176" className="fill-accent">
            same day.
          </text>
        </g>
        <g fontSize="8.6" className="fill-text-on-dark-muted">
          <text x="22" y="200">
            Hot water, blocked drains and gas
          </text>
          <text x="22" y="213">
            fitting, with a fixed quote first.
          </text>
        </g>
        <rect x="22" y="230" width="172" height="30" rx="3" className="fill-action-primary" />
        <text
          x="108"
          y="249"
          fontSize="8.5"
          fontWeight={700}
          textAnchor="middle"
          className="fill-surface-page"
        >
          GET A QUOTE →
        </text>
        <rect x="8" y="280" width="200" height="160" className="fill-surface-muted" />
        <Stars x={22} y={296} size={8} />
        <text x="76" y="303.5" fontSize="8.5" fontWeight={700} className="fill-text-secondary">
          4.6 on Google
        </text>
        <rect
          x="22"
          y="318"
          width="172"
          height="52"
          rx="5"
          className="fill-surface-page stroke-border-default"
        />
        <text x="36" y="340" fontSize="11" fontWeight={800} className="fill-text-secondary">
          Hot water
        </text>
        <text x="36" y="356" fontSize="8.5" className="fill-text-muted">
          From $1,490 installed
        </text>
        <rect
          x="22"
          y="378"
          width="172"
          height="52"
          rx="5"
          className="fill-surface-page stroke-border-default"
        />
        <text x="36" y="400" fontSize="11" fontWeight={800} className="fill-text-secondary">
          Blocked drains
        </text>
        <text x="36" y="416" fontSize="8.5" className="fill-text-muted">
          Since 1998
        </text>
      </g>
    </svg>
  );
}
