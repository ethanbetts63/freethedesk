import { CtaButton } from '@/components/CtaButton';
import { SectionNumber } from '@/components/SectionNumber';

export function ManualAdminCta({
  id,
  href = '/contact',
  eyebrow = 'Start with the busywork',
  title = 'What is manual admin actually costing you?',
  children = (
    <>
      Tell us what gets copied, chased or checked each week. We&apos;ll help you find the simplest
      worthwhile place to begin.
    </>
  ),
  buttonLabel = 'Find your first automation',
}: {
  /** Where a page's floating button hides, so the two never show together. */
  id?: string;
  href?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  children?: React.ReactNode;
  buttonLabel?: React.ReactNode;
}) {
  return (
    // .site-shell already supplies the base left/right gutter padding; only the
    // >=640px override needs to be stated here.
    <section
      className="site-shell my-section bg-surface-tint py-section text-center sm:px-xl sm:py-3xl"
      id={id}
    >
      <SectionNumber>{eyebrow}</SectionNumber>
      <h2 className="m-0 text-display tracking-[-0.05em]">{title}</h2>
      <p className="mx-auto my-xl max-w-[570px] text-lead leading-[1.7] text-text-muted">
        {children}
      </p>
      {/* Closing section, so in-page links scroll up. */}
      <CtaButton href={href} direction={href.startsWith('#') ? 'up' : 'page'} size="large">
        {buttonLabel}
      </CtaButton>
    </section>
  );
}
