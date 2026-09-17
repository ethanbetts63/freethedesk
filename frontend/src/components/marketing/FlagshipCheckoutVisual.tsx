import Image from 'next/image';

const journey = [
  {
    number: '01',
    title: 'Choose',
    detail: 'Select the vehicle online',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5h6v6H4zM14 5h6v6h-6zM4 13h6v6H4zM14 13h6v6h-6z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Sign',
    detail: 'Identity, forms and signatures',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3h9l3 3v15H6zM15 3v4h4M9 12h6m-6 4h4" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Pay',
    detail: 'Optional deposit or full payment',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6h18v12H3zM3 10h18M7 15h4" />
      </svg>
    ),
  },
] as const;

/**
 * The three-step purchase journey. On a phone each step is a row with its icon
 * and number beside the copy; from `sm` they become three columns with the
 * connector running through the icons.
 */
const stepClassName =
  'relative z-1 grid min-w-0 grid-cols-[38px_28px_minmax(0,1fr)] items-center gap-x-s gap-y-3xs border border-border-subtle bg-surface-tint p-s sm:block sm:px-s sm:py-m';

const iconClassName =
  'm-0 flex h-[38px] w-[38px] items-center justify-center border border-border-default bg-surface-tint-strong text-[var(--section-accent)] [grid-row:1/3] sm:mb-ml [&>svg]:h-[19px] [&>svg]:w-[19px] [&>svg]:fill-none [&>svg]:stroke-current [&>svg]:[stroke-linecap:round] [&>svg]:[stroke-linejoin:round] [&>svg]:[stroke-width:1.6]';

export function FlagshipCheckoutVisual() {
  return (
    <div
      className="moving-colour-border min-w-0 p-ml shadow-l sm:p-xl [--section-accent:var(--page-accent,var(--action-primary))]"
      aria-label="An online dealership purchase and licensing journey"
    >
      <div className="flex flex-col items-start justify-between gap-2xs border-b border-border-subtle pb-m text-caption font-control tracking-label text-text-muted uppercase sm:flex-row sm:items-center sm:gap-0">
        <span>One connected journey</span>
        <b className="moving-colour-text">Entirely online</b>
      </div>

      {/* The connector is a ::before rather than a border on the steps: it has
          to stop short at both ends, which a border cannot do. */}
      <div className="relative grid grid-cols-[minmax(0,1fr)] gap-s py-ml before:absolute before:top-[14%] before:bottom-[20%] before:left-[19px] before:w-[1px] before:bg-border-default before:content-[''] sm:grid-cols-3 sm:py-xl sm:before:top-[57px] sm:before:right-[15%] sm:before:bottom-auto sm:before:left-[15%] sm:before:h-[1px] sm:before:w-auto">
        {journey.map((step) => (
          <article key={step.number} className={stepClassName}>
            <div className={iconClassName}>{step.icon}</div>
            <span className="col-start-2 block text-label font-black tracking-label text-[var(--section-accent)] [grid-row:1/3]">
              {step.number}
            </span>
            <strong className="col-start-3 m-0 block text-lead sm:mt-2xs">{step.title}</strong>
            <small className="col-start-3 m-0 block text-caption leading-[1.45] text-text-muted sm:mt-2xs">
              {step.detail}
            </small>
          </article>
        ))}
      </div>

      {/* Pale blue, not the moving gradient: the Stripe wordmark is a
          blue-violet and vanished as the gradient swept its own colours under
          it. The label goes dark to stay readable on the light ground. */}
      <div className="flex items-center justify-center gap-0 bg-[var(--blue-400)] px-m py-m text-caption font-strong text-[var(--blue-950)] shadow-s sm:text-small">
        <span>Identity Verification by</span>
        <Image
          className="h-[28px] w-auto flex-none"
          src="/stripe-ar21.svg"
          alt="Stripe"
          width={120}
          height={60}
        />
      </div>
    </div>
  );
}
