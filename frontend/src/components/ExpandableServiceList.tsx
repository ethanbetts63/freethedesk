import { SectionNumber } from './SectionNumber';
import type { Service } from './ServiceScroll';
import { focusRingClassName } from '@/lib/controlState';
import { cn } from '@/lib/utils';

/**
 * The accent this section draws its numbers, ticks and toggles in: whatever
 * `--page-accent` the route sets, falling back to the interactive blue. Not a
 * token, because the point of it is that each service page overrides it.
 */
const accentClassName = 'text-[var(--page-accent)]';

/**
 * The body copy hangs under the summary's icon column, so its indent is a
 * function of that grid (34px icon + 70px number) rather than of the space
 * scale — which is why both values are literal and live on the section as
 * custom properties instead of being spelled out at each use.
 */
const indentVarsClassName =
  '[--services-indent:78px] [--services-inset:var(--space-3xs)] sm:[--services-indent:144px] sm:[--services-inset:76px]';

const summaryClassName = cn(
  'grid cursor-pointer list-none grid-cols-[auto_46px_minmax(0,1fr)_auto] items-center gap-s px-3xs py-ml',
  'min-h-[112px] [&::-webkit-details-marker]:hidden',
  'sm:min-h-[142px] sm:grid-cols-[34px_70px_minmax(0,1fr)_auto] sm:gap-ml sm:px-m sm:py-l',
  focusRingClassName,
);

/**
 * The tick sits in the padding rather than in a marker so the two-column list
 * can hang its second column off a border without the bullets moving with it.
 */
const listItemClassName = cn(
  "relative border-t border-border-default py-s pr-0 pl-l leading-[1.55] text-text-muted before:absolute before:left-0 before:font-black before:content-['✓']",
  'before:text-[var(--page-accent)]',
  'sm:even:border-l sm:even:border-border-default sm:even:pl-xl sm:even:before:left-[18px]',
);

export function ExpandableServiceList({
  services,
  eyebrow,
  title,
  description,
  id,
}: {
  services: readonly Service[];
  eyebrow: string;
  title: string;
  description: string;
  id?: string;
}) {
  return (
    <section className={cn('site-shell py-section', indentVarsClassName)} id={id}>
      {/* At `sm` the description moves into a second column and sits on the
          heading's baseline, so it spans both of the left column's rows. */}
      <header className="mb-2xl grid gap-ml sm:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <SectionNumber>{eyebrow}</SectionNumber>
        <h2 className="m-0 max-w-[850px] text-display-4 leading-[0.98] tracking-[-0.06em] sm:col-start-1">
          {title}
        </h2>
        <p className="m-0 max-w-[680px] leading-[1.7] text-text-muted sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:self-end">
          {description}
        </p>
      </header>
      <div className="border-b border-border-default">
        {services.map((service, index) => (
          <details
            key={service.title}
            open={index === 0}
            className="group border-t border-border-default"
          >
            <summary className={summaryClassName}>
              <span className={cn('text-caption font-black tracking-label', accentClassName)}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span
                className="flex items-center justify-center [&>svg]:h-[38px] [&>svg]:w-[38px] sm:[&>svg]:h-[54px] sm:[&>svg]:w-[54px]"
                style={{ color: service.color }}
                aria-hidden="true"
              >
                {service.icon}
              </span>
              <span>
                <strong className="block text-step-1 tracking-[-0.025em]">{service.title}</strong>
                {/* Hidden on a phone: at that width the row is already 112px
                    tall and the title has to carry the meaning alone. */}
                <small className="mt-2xs hidden max-w-[760px] text-small leading-[1.55] text-text-muted sm:block">
                  {service.body}
                </small>
              </span>
              <span
                className={cn(
                  'flex h-[34px] w-[34px] items-center justify-center rounded-circle border border-border-default text-glyph transition-[rotate] duration-[180ms] ease-[ease] group-open:rotate-45',
                  accentClassName,
                )}
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            {/* eslint-disable-next-line no-restricted-syntax -- Both values are the list's
          own local properties, set on the row above; this is a token read. */}
            <div className="pt-0 pr-[var(--services-inset)] pb-xl pl-[var(--services-indent)]">
              <p
                className={cn(
                  'm-0 mb-s text-meta font-black tracking-label uppercase',
                  accentClassName,
                )}
              >
                Examples of what we check
              </p>
              <ul className="m-0 grid list-none gap-0 p-0 sm:grid-cols-2">
                {service.examples.map((example) => (
                  <li key={example} className={listItemClassName}>
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
