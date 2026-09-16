import { SectionNumber } from '@/components/SectionNumber';

export type IndexedFeature = readonly [string, string];

export function IndexedFeatureSection({
  eyebrow,
  title,
  accentTitle,
  lead,
  items,
  id,
  footer,
}: {
  eyebrow: string;
  title: string;
  accentTitle: string;
  lead: string;
  items: readonly IndexedFeature[];
  id?: string;
  footer?: React.ReactNode;
}) {
  return (
    <section className="pt-0 pb-section [scroll-margin-top:24px]" id={id}>
      <div className="site-shell">
        <div className="max-w-[860px]">
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2 className="m-0 text-display-3 leading-[0.98] tracking-[-0.055em]">
            {title} <span className="moving-colour-text">{accentTitle}</span>
          </h2>
          <p className="mt-l max-w-[720px] text-step-0 leading-[1.75] text-text-muted">{lead}</p>
        </div>

        <ol
          className={`m-0 mt-2xl grid grid-cols-1 gap-4xs p-0 ${
            items.length === 2 ? 'min-[900px]:grid-cols-2' : 'min-[900px]:grid-cols-3'
          }`}
        >
          {items.map(([itemTitle, body], index) => (
            <li key={itemTitle} className="bg-surface-tint p-xl">
              <span className="mb-m block text-ui font-black tracking-[0.14em] text-[var(--page-accent,var(--action-primary))]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <strong className="mb-xs block text-step-0 tracking-[-0.025em] text-[var(--blue-950)]">
                {itemTitle}
              </strong>
              <p className="m-0 text-body leading-[1.65] text-text-muted">{body}</p>
            </li>
          ))}
        </ol>

        {footer}
      </div>
    </section>
  );
}
