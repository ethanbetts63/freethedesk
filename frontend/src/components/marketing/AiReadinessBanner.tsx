import { AiReadinessForm } from './AiReadinessForm';

/* Deliberately has no "use client": rendered from a server page it stays on the
   server, and only AiReadinessForm ships. */

/**
 * A full-width strip on wide viewports, left out under `sm`. Its heading is
 * plain text, not a heading element: the strip sits above the hero, and the
 * page's first heading should be its own h1.
 */
export function AiReadinessBanner({ id }: { id?: string }) {
  return (
    <section
      className="relative hidden overflow-hidden bg-surface-navy text-text-on-dark sm:block"
      aria-labelledby="ai-readiness-banner-title"
      id={id}
    >
      {/* Stacked until there is room for heading and form side by side, then one
          strip-height row, from `lg`. */}
      <div className="site-shell grid min-h-0 grid-cols-[minmax(0,1fr)] items-center justify-between gap-m py-l lg:flex lg:min-h-[92px] lg:gap-xl lg:py-m">
        <div>
          <p
            id="ai-readiness-banner-title"
            className="m-0 text-title-sm leading-[1.1] tracking-[-0.035em] lg:max-w-[480px]"
          >
            Can customers find you <span className="moving-colour-text">in AI answers?</span>
          </p>
        </div>
        <AiReadinessForm />
      </div>
      <span aria-hidden="true" className="moving-colour-fill absolute inset-x-0 bottom-0 h-[3px]" />
    </section>
  );
}
