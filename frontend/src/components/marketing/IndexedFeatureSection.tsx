import { SectionHeader } from '@/components/SectionHeader';

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
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            accentTitle={accentTitle}
            size="display-md"
          />
          <p className="mt-l max-w-[720px] text-body-lg leading-[1.75] text-text-muted">{lead}</p>
        </div>

        <ol
          className={`m-0 mt-2xl grid grid-cols-1 gap-4xs p-0 ${
            items.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
          }`}
        >
          {items.map(([itemTitle, body], index) => (
            <li key={itemTitle} className="bg-surface-tint p-xl">
              <span className="mb-m block text-label font-black tracking-label-wide text-action-primary">
                {String(index + 1).padStart(2, '0')}
              </span>
              <strong className="mb-xs block text-body-lg tracking-[-0.025em] text-[var(--blue-950)]">
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
