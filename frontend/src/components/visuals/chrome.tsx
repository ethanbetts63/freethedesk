import { cn } from '@/lib/utils';

/**
 * The three dots in a drawn browser bar.
 *
 * Five illustrations draw a browser window — the case-study frame, the two
 * feature visuals, the report card and the SEO redirect check — and every one
 * of them spelled these dots out again. They only ever disagreed about the
 * dot's size and its colour, which is what this takes.
 *
 * The sizes are a literal map rather than an interpolated `h-[${size}px]`:
 * Tailwind compiles only the class strings it can read in the source, and a
 * name built at runtime produces no CSS at all, silently.
 */
const DOT_SIZES = {
  4: '[&>i]:h-[4px] [&>i]:w-[4px]',
  6: '[&>i]:h-[6px] [&>i]:w-[6px]',
  8: '[&>i]:h-[8px] [&>i]:w-[8px]',
} as const;

export function TrafficLights({
  size = 6,
  tone = '[&>i]:bg-border-strong',
  className,
}: {
  size?: keyof typeof DOT_SIZES;
  /** A `[&>i]:` background utility, written out at the call site so Tailwind reads it. */
  tone?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex flex-none gap-3xs [&>i]:rounded-circle',
        DOT_SIZES[size],
        tone,
        className,
      )}
    >
      <i />
      <i />
      <i />
    </span>
  );
}

/**
 * The round badge that holds a step number or a tick. Eight places draw one at
 * sizes from 26px to 52px; the size and the colours stay with the caller
 * because they are what each drawing is choosing.
 */
export const stepBadgeClassName = 'flex flex-none items-center justify-center rounded-circle';

/**
 * Supplementary text dropped on a phone, where the row it sits in is already
 * as wide as it can be. One editorial rule — "this part is the first to go" —
 * that had grown five spellings across the visuals.
 */
export const hiddenBelowSmClassName = 'hidden sm:block';
