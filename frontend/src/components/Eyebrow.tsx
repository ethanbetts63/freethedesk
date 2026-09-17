import { cn } from '@/lib/utils';

/**
 * The small uppercase kicker that labels a section, with its leading dot.
 *
 * Sections tint it by setting `--eyebrow-accent` (see `Hero`); unset, it falls
 * back to `--text-action`.
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
        'm-0 mb-l flex items-center gap-s',
        'text-caption font-heavy uppercase tracking-label-wide',
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
