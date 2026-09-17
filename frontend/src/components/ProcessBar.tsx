import Link from 'next/link';
import type { CSSProperties } from 'react';

const contentClassName =
  'group grid min-h-[76px] grid-cols-[auto_minmax(0,1fr)] items-center gap-xs px-xs py-s text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent-on-dark-soft)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-s sm:px-ml sm:py-m lg:min-h-[104px] lg:px-l lg:py-ml';

export type ProcessBarStep = {
  label: string;
  description: string;
  href?: string;
};

export function ProcessBar({
  label,
  steps,
  id,
}: {
  label: string;
  steps: readonly ProcessBarStep[];
  id?: string;
}) {
  return (
    <section className="bg-surface-dark text-text-on-dark" aria-label={label} id={id}>
      <div className="site-shell py-0">
        <p className="pt-m pr-0 pb-s pl-0 text-meta font-black tracking-[0.14em] text-[var(--accent-on-dark-soft)] uppercase lg:pt-ml">
          {label}
        </p>
        <ol
          className="m-0 grid grid-cols-2 list-none p-0 lg:grid-cols-[repeat(var(--process-columns,4),minmax(0,1fr))]"
          style={{ '--process-columns': steps.length } as CSSProperties}
        >
          {steps.map((step, index) => {
            const content = (
              <>
                <span className="text-caption font-black tracking-[0.1em] text-[var(--accent-on-dark-soft)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <strong className="block text-lead tracking-[-0.02em]">{step.label}</strong>
                  <small className="mt-3xs hidden text-ui leading-[1.4] text-text-on-dark-muted sm:block">
                    {step.description}
                  </small>
                </span>
                {step.href && (
                  <span
                    className="hidden text-step-0 text-[var(--accent-on-dark-soft)] transition-transform duration-[160ms] ease sm:block group-hover:translate-y-[3px]"
                    aria-hidden="true"
                  >
                    ↓
                  </span>
                )}
              </>
            );

            return (
              <li
                key={step.label}
                className="min-w-0 border-t border-border-on-dark even:border-l even:border-border-on-dark lg:even:border-l-0 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-border-on-dark"
              >
                {step.href ? (
                  <Link className={contentClassName} href={step.href}>
                    {content}
                  </Link>
                ) : (
                  <div className={contentClassName}>{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
