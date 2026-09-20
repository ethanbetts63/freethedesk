/* Component registry: freetheplatform/frontend/registry/src/components/marketing/FaqSection.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Eyebrow from '@/components/common/eyebrow';
import StructuredDataScript from '@/components/seo/StructuredDataScript';
import { renderFaqAnswer } from '@/components/marketing/renderFaqAnswer';
import type { FaqItem } from '@/types/FaqItem';
import { focusRingClassName } from '@/lib/controlState';
import { cn } from '@/lib/utils';

interface FaqSectionProps {
  title: string;
  items: FaqItem[];
  /** The kicker above the heading. Pass a numbered string where the site numbers its sections. */
  eyebrow?: string;
  id?: string;
  /**
   * Emit `FAQPage` structured data from this section.
   *
   * Off by default because a page that composes its schema centrally — one
   * `StructuredDataScript` holding `WebPage` + `BreadcrumbList` + the rest, as
   * `_docs/seo-standard.md` §3 describes — must not also get a second FAQPage
   * block from here. Turn it on where this section is the only thing that
   * knows the questions.
   */
  emitSchema?: boolean;
}

/**
 * The questions-and-answers band: heading on the left, a rule-separated
 * `<details>` list on the right.
 *
 * The answer is plain text in `FaqItem` because it is also the source of
 * `FAQPage` structured data, which must not contain markup. `renderFaqAnswer`
 * is what turns declared phrases into links for the visible copy only, so the
 * schema and the page can never disagree about what the answer says.
 */
export const FaqSection = ({
  title,
  items,
  eyebrow = 'Common questions',
  id,
  emitSchema = false,
}: FaqSectionProps) => {
  const schema = items.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }
    : null;

  return (
    <section className="bg-surface-muted py-section" id={id}>
      {emitSchema && <StructuredDataScript structuredData={schema} />}

      <div className="site-shell grid grid-cols-1 gap-l lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-split">
        <div>
          <Eyebrow size="sm" tone="brand" className="mb-l">
            {eyebrow}
          </Eyebrow>
          <h2 className="m-0 text-hero leading-[0.93] font-black tracking-[-0.055em] text-text-primary [overflow-wrap:break-word] sm:[overflow-wrap:normal]">
            {title}
          </h2>
        </div>

        <div className="border-t border-border-default">
          {items.map((item) => (
            <details key={item.question} className="group border-b border-border-default">
              {/* Both marker rules: `marker:` covers the standard pseudo-element,
                  the WebKit one covers Safari, which still draws its own. */}
              <summary
                className={cn(
                  'flex cursor-pointer list-none items-center justify-between gap-m py-l marker:hidden [&::-webkit-details-marker]:hidden',
                  focusRingClassName,
                  // A full-width row: the outline wants clearance from the
                  // question text, not a hairline around it.
                  'focus-visible:outline-offset-4',
                )}
              >
                <h3 className="m-0 text-lead font-strong text-text-primary">{item.question}</h3>
                <span
                  aria-hidden="true"
                  className="h-0 w-0 flex-none border-x-[6px] border-t-[7px] border-x-transparent border-t-action-primary transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <p className="-mt-1 mb-l text-body leading-[1.72] text-text-secondary sm:mr-2xl">
                {renderFaqAnswer(item)}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};
