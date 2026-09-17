import { cn } from '@/lib/utils';

/**
 * Numbered eyebrow opening a marketing section ("01 / Section name");
 * `onDark` for dark surfaces. Pages that set `--page-accent` tint it
 * automatically.
 *
 * The bare `section-number` class carries no styling any more. It survives as
 * a structural hook for `CaseStudyTeaser`, which styles the paragraphs around
 * this one with `[&>p:not(.section-number)]`. A section that wants a different
 * colour passes `className`, which is what the case-study operations band does
 * on its darker ground.
 */
export function SectionNumber({
  children,
  onDark = false,
  className,
}: {
  children: string;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'section-number m-0 mb-l text-caption font-black uppercase tracking-label-wide',
        onDark ? 'text-section-number-on-dark' : 'text-[var(--page-accent)]',
        className,
      )}
    >
      {children}
    </p>
  );
}
