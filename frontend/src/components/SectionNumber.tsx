import { cn } from '@/lib/utils';

/**
 * Numbered eyebrow opening a marketing section ("01 / Section name");
 * `onDark` for dark surfaces. Pages that set `--page-accent` tint it
 * automatically.
 *
 * The bare `section-number` / `section-number-light` classes carry no styling
 * any more - they survive as structural hooks for
 * `app/portfolio/case-study.css`, which both selects around this element
 * (`.case-split-copy > p:not(.section-number)`) and overrides its colour
 * (`.case-operations-section .section-number-light`). That stylesheet is
 * imported unlayered, so its override still wins over the utilities below,
 * exactly as it did over the deleted `.section-number-light` rule. Both hooks
 * go when it migrates in Phase 4.
 */
export function SectionNumber({
  children,
  onDark = false,
}: {
  children: string;
  onDark?: boolean;
}) {
  return (
    <p
      className={cn(
        'section-number m-0 mb-l text-caption font-black uppercase tracking-label-wide',
        onDark ? 'section-number-light text-section-number-on-dark' : 'text-[var(--page-accent)]',
      )}
    >
      {children}
    </p>
  );
}
