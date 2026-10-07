import { CtaButton } from '@/components/CtaButton';
import { SectionHeader } from '@/components/SectionHeader';
import { money, type WebsitePackage } from '@/lib/servicePricing';
import { cn } from '@/lib/utils';

/**
 * The three website packages side by side. Each card leads with its total and
 * shows the sum behind it, pages times the per-page price, so "priced per page"
 * is visible rather than claimed. Every card after the first lists only what
 * it adds to the one before.
 */
export function WebsitePackageCards({
  eyebrow,
  packages,
  lead,
  id = 'packages',
}: {
  eyebrow: string;
  packages: readonly WebsitePackage[];
  lead: string;
  id?: string;
}) {
  return (
    <section className="py-section [scroll-margin-top:24px]" id={id}>
      <div className="site-shell">
        <div className="max-w-[860px]">
          <SectionHeader
            eyebrow={eyebrow}
            title="Pick your package."
            accentTitle="Pay per page."
            size="display-md"
          />
          <p className="mt-l max-w-[720px] text-lead leading-[1.75] text-text-muted">{lead}</p>
        </div>

        <ol className="m-0 mt-2xl grid list-none grid-cols-1 gap-m p-0 lg:grid-cols-3">
          {packages.map((item, index) => (
            <li
              key={item.code}
              className={cn(
                'flex flex-col p-ml sm:p-xl',
                item.recommended
                  ? 'moving-colour-border shadow-l'
                  : 'border border-border-default bg-surface-tint',
              )}
            >
              <div className="flex items-center justify-between gap-s text-label font-heavy tracking-label text-text-subtle uppercase">
                <h3 className="m-0 text-label font-heavy tracking-label text-action-primary">
                  {item.name}
                </h3>
                {item.recommended && <span className="moving-colour-text">Recommended</span>}
              </div>

              <p className="mt-l mb-0 text-display leading-none font-heavy tracking-[-0.06em] text-text-primary">
                {money(item.total)}
              </p>
              <p className="mt-xs mb-0 text-body-sm text-text-muted">
                {item.pages} pages at {money(item.pagePrice)} a page
              </p>
              <p className="mt-l mb-0 text-body leading-relaxed text-text-secondary">
                {item.summary}
              </p>

              <p className="mt-l mb-s text-label font-heavy tracking-label text-text-subtle uppercase">
                {index === 0 ? 'Includes' : `Everything in ${packages[index - 1].name}, plus`}
              </p>
              <ul className="m-0 mb-xl grid list-none gap-s p-0">
                {item.adds.map((line) => (
                  <li
                    key={line}
                    className="grid grid-cols-[auto_minmax(0,1fr)] gap-s text-body leading-relaxed text-text-muted"
                  >
                    <span aria-hidden="true" className="font-heavy text-action-primary">
                      ✓
                    </span>
                    {line}
                  </li>
                ))}
              </ul>

              <CtaButton
                className="mt-auto"
                href="#enquiry"
                direction="down"
                size="compact"
                appearance={item.recommended ? 'brand' : 'dark'}
                fullWidth
              >
                Start with {item.name}
              </CtaButton>
            </li>
          ))}
        </ol>

        <p className="mt-l mb-0 text-body-sm text-text-muted">
          Need more pages? Each extra page costs your package&apos;s per-page price.
        </p>
      </div>
    </section>
  );
}
