import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { AiReadinessForm } from './AiReadinessForm';

/* Deliberately has no "use client": rendered from a server page it stays on the
   server, and only AiReadinessForm ships. The mobile dialog pulls it into the
   client bundle instead, which is why the markup lives here rather than in a
   server-only component the dialog could not import. */

/**
 * Two placements, one banner. Inline it is a full-width strip that only exists
 * on wide viewports; inside AiReadinessDialog it is the whole prompt, and only
 * ever renders narrow. The CSS module this replaces expressed the second
 * placement as descendant overrides (`.modalBanner .inner`), which meant the
 * dialog reached into the banner's internals to restyle them. It is a variant,
 * so it is spelled as one.
 */
export type AiReadinessPlacement = 'inline' | 'dialog';

const bannerVariants = cva('relative overflow-hidden bg-surface-navy text-text-on-dark', {
  variants: {
    placement: {
      // Under `sm` the inline strip is suppressed entirely and AiReadinessModal
      // offers the dialog instead, a minute in.
      inline: 'hidden sm:block',
      dialog: 'block',
    },
  },
  defaultVariants: { placement: 'inline' },
});

const innerVariants = cva('grid min-h-0 grid-cols-[minmax(0,1fr)] justify-between gap-m', {
  variants: {
    placement: {
      // Stacked until there is room for heading and form side by side, then one
      // strip-height row. Was `min-width: 1080px`; converted to the canonical
      // `lg` (1024px) per the rule tokens.css states for freethedesk's two
      // pre-migration breakpoints. 1024 rather than 1280 because the heading
      // already shrank below its 480px cap at 1080 - the row was designed to
      // start as soon as it fits, and 1280 would withhold it from a 200px band
      // where it currently works.
      inline: 'items-center py-l lg:flex lg:min-h-[92px] lg:gap-xl lg:py-m',
      // Overrides the rail's own gutter: inside a 440px dialog the strip's
      // horizontal padding is the card's padding.
      dialog: 'items-stretch px-l pt-2xl pb-xl',
    },
  },
  defaultVariants: { placement: 'inline' },
});

const headingVariants = cva('m-0 leading-[1.1] tracking-[-0.035em]', {
  variants: {
    placement: {
      inline: 'text-title-sm lg:max-w-[480px]',
      dialog: 'max-w-[320px] text-display-sm',
    },
  },
  defaultVariants: { placement: 'inline' },
});

export function AiReadinessBanner({
  placement = 'inline',
  titleId = 'ai-readiness-banner-title',
  id,
}: {
  placement?: AiReadinessPlacement;
  titleId?: string;
  id?: string;
}) {
  return (
    <section className={bannerVariants({ placement })} aria-labelledby={titleId} id={id}>
      <div className={cn('site-shell', innerVariants({ placement }))}>
        <div>
          <h2 id={titleId} className={headingVariants({ placement })}>
            Can customers find you <span className="moving-colour-text">in AI answers?</span>
          </h2>
        </div>
        <AiReadinessForm />
      </div>
      <span aria-hidden="true" className="moving-colour-fill absolute inset-x-0 bottom-0 h-[3px]" />
    </section>
  );
}
