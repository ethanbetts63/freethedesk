import { SectionNumber } from './SectionNumber';

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
    <section className="shell pb-xl pt-section" id={id} aria-labelledby={`${id}-title`}>
      <SectionNumber>{eyebrow}</SectionNumber>
      <h2
        id={`${id}-title`}
        className="mt-0 mb-xl mx-0 text-display-2 leading-[1.05] tracking-[-0.055em]"
      >
        {title} <span className="moving-colour-text">{accentTitle}</span>
      </h2>
      <div className="grid gap-l min-[900px]:grid-cols-3 min-[900px]:gap-0">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex flex-col border-t border-border-default pt-l min-[900px]:border-t-0 min-[900px]:px-l min-[900px]:py-0 min-[900px]:first:pl-0 min-[900px]:last:pr-0 min-[900px]:[&+div]:border-l min-[900px]:[&+div]:border-border-default"
          >
            <h3 className="m-0 text-step-2 tracking-[-0.035em] text-[var(--page-accent)]">
              {item.title}
            </h3>
            <p className="mt-s max-w-[42ch] text-step-0 leading-[1.6] text-text-muted">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
