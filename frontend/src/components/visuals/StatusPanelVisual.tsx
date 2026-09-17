import { cn } from '@/lib/utils';

export type StatusPanelItem = {
  title: string;
  description?: string;
  tag: string;
};

type StatusPanelVisualProps = {
  eyebrow: string;
  title: string;
  countLabel: string;
  items: readonly StatusPanelItem[];
  ariaLabel?: string;
};

/**
 * A numbered checklist inside an animated-border card: a live status dot, a
 * heading, a gradient count, and one row per item.
 *
 * `ReportCardVisual` and the Google Business Profile audit card are the same
 * idea with different chrome — traffic-light dots and a badge, a Google logo
 * and a gradient footer. The three share the row shape exactly and disagree
 * about the header, which is a design question rather than a migration one, so
 * they stay separate components for now. See tailwind-migration.md 4.9.
 */
const rowClassName =
  'grid grid-cols-[20px_24px_minmax(0,1fr)] items-center gap-s border border-border-subtle bg-surface-tint px-s py-m sm:grid-cols-[22px_26px_minmax(0,1fr)_auto]';

export function StatusPanelVisual({
  eyebrow,
  title,
  countLabel,
  items,
  ariaLabel,
}: StatusPanelVisualProps) {
  return (
    <div
      className="moving-colour-border mx-auto w-full max-w-[620px] min-w-0 p-xl text-text-secondary shadow-l lg:mx-0 lg:w-auto lg:max-w-none"
      aria-label={ariaLabel}
    >
      <header className="flex items-center justify-between border-b border-border-subtle pb-m">
        <div className="flex items-center gap-s">
          {/* The halo used to be a literal rgba() a couple of steps lighter
              than the dot; it is a tint of the dot's own colour now, so the
              two cannot drift apart. */}
          <span
            className="h-[9px] w-[9px] flex-none rounded-[var(--radius-circle)] bg-fill-success shadow-[0_0_0_4px_color-mix(in_srgb,var(--fill-success)_18%,transparent)]"
            aria-hidden="true"
          />
          <span>
            <small className="mb-4xs block text-nano font-black tracking-label text-text-muted uppercase">
              {eyebrow}
            </small>
            <strong className="block text-small">{title}</strong>
          </span>
        </div>
        <span className="moving-colour-text text-label font-black uppercase">{countLabel}</span>
      </header>
      <ol className="m-0 grid list-none gap-s p-0 pt-xl">
        {items.map((item, index) => (
          <li key={item.title} className={rowClassName}>
            <span className="text-label font-black text-text-muted">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span
              className="flex h-[26px] w-[26px] items-center justify-center rounded-[var(--radius-circle)] bg-surface-tint-strong text-meta font-black text-[var(--page-accent,var(--action-primary))]"
              aria-hidden="true"
            >
              ✓
            </span>
            <span>
              <strong className="block text-small">{item.title}</strong>
              {item.description ? (
                <small className="mt-4xs block text-micro leading-[1.4] text-text-muted">
                  {item.description}
                </small>
              ) : null}
            </span>
            {/* Cut on a phone: the row is already three columns wide. */}
            <span
              className={cn(
                'hidden text-tiny font-black tracking-label-tight text-text-muted uppercase sm:block',
              )}
            >
              {item.tag}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
