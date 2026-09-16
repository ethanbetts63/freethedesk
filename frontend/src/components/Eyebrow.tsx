import { cn } from '@/lib/utils';

/**
 * The small uppercase kicker that labels a section, with its leading dot.
 *
 * Sections tint it by setting `--eyebrow-accent` (see `Hero`); unset, it falls
 * back to `--text-action`.
 *
 * The bare `eyebrow` class carries no styling any more - it survives only as a
 * structural hook for `app/portfolio/case-study.css`, which selects the
 * paragraphs around this one with `.case-hero-copy > p:not(.eyebrow)`. It goes
 * when that stylesheet migrates in Phase 4; until then, removing it here would
 * silently restyle the case-study hero copy.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'eyebrow m-0 mb-l flex items-center gap-s',
        'text-caption font-heavy uppercase tracking-[0.17em]',
        'text-[var(--eyebrow-accent,var(--text-action))]',
        className,
      )}
    >
      {/* 50% and a full pill round a 7x7 box identically; --radius-circle has
          no other consumer, so this uses the stock utility. */}
      <span className="h-[7px] w-[7px] rounded-full bg-current" />
      {children}
    </p>
  );
}
