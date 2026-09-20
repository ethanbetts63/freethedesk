import { SectionHeader } from './SectionHeader';

export type ProcessIntroductionItem = {
  title: string;
  description: string;
};

export function ProcessIntroduction({
  eyebrow,
  title,
  accentTitle,
  items,
  id,
}: {
  eyebrow: string;
  title: string;
  accentTitle: string;
  items: readonly ProcessIntroductionItem[];
  id: string;
}) {
  return (
    <section className="site-shell pb-xl pt-section" id={id} aria-labelledby={`${id}-title`}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        accentTitle={accentTitle}
        titleId={`${id}-title`}
        titleClassName="mb-xl"
      />
      <div className="grid gap-l lg:grid-cols-3 lg:gap-0">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex flex-col border-t border-border-default pt-l lg:border-t-0 lg:px-l lg:py-0 lg:first:pl-0 lg:last:pr-0 lg:[&+div]:border-l lg:[&+div]:border-border-default"
          >
            <h3 className="m-0 text-title-sm tracking-[-0.035em] text-action-primary">
              {item.title}
            </h3>
            <p className="mt-s max-w-[42ch] text-lead leading-[1.6] text-text-muted">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
