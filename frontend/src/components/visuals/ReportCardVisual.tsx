import type { ReactNode } from 'react';

export type ReportCardItem = {
  title: string;
  description: string;
  icon?: ReactNode;
  tag?: string;
};

type ReportCardVisualProps = {
  title: string;
  subtitle: string;
  badge: string;
  items: readonly ReportCardItem[];
  footerItems: readonly string[];
  ariaLabel?: string;
};

/**
 * A report drawn as a desktop window: traffic-light dots, a badge, numbered
 * rows that slide right on hover, and a row of summary chips at the bottom.
 *
 * Shares its row shape with `StatusPanelVisual` and the Google Business
 * Profile audit card and disagrees with both about the chrome. Merging the
 * three is a design decision, not a migration one — see tailwind-migration.md
 * 4.9.
 */
const rowClassName = [
  'grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-s border-b border-border-subtle p-m',
  'transition-[background-color,padding-left] duration-200 ease-[ease]',
  // The hover indent has to outrank the wider padding `sm` adds, which the
  // stylesheet got through specificity and utilities have to get by ordering.
  'hover:bg-surface-tint hover:pl-xl sm:px-ml sm:hover:pl-xl',
].join(' ');

export function ReportCardVisual({
  title,
  subtitle,
  badge,
  items,
  footerItems,
  ariaLabel,
}: ReportCardVisualProps) {
  return (
    <div
      className="relative min-w-0 border border-border-strong bg-surface-page shadow-block-s before:absolute before:inset-y-[-1px] before:left-[-1px] before:z-1 before:w-[3px] before:content-[''] before:[background:linear-gradient(180deg,var(--page-accent,var(--action-primary)),var(--purple-accent))]"
      aria-label={ariaLabel}
    >
      <header className="flex items-center gap-s border-b border-border-subtle bg-surface-tint p-m sm:px-ml">
        <span
          className="flex gap-3xs [&>i]:h-[8px] [&>i]:w-[8px] [&>i]:rounded-[var(--radius-circle)] [&>i]:bg-border-default"
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
        </span>
        <div>
          <strong className="block text-body tracking-[-0.01em]">{title}</strong>
          <small className="block text-ui text-text-muted">{subtitle}</small>
        </div>
        <span className="ml-auto border border-border-default bg-surface-tint-strong px-xs py-2xs text-label font-black tracking-label text-text-action uppercase">
          {badge}
        </span>
      </header>

      <ol className="m-0 list-none p-0">
        {items.map((item, index) => (
          <li key={item.title} className={rowClassName}>
            <span className="flex h-[25px] w-[25px] flex-none items-center justify-center bg-surface-navy text-label font-black text-text-on-dark">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span
              className="flex h-[40px] w-[40px] flex-none items-center justify-center border border-border-subtle text-small font-black text-text-action [background:linear-gradient(135deg,var(--surface-tint-strong),var(--purple-surface))]"
              aria-hidden="true"
            >
              {item.icon ?? '✓'}
            </span>
            <div>
              <h3 className="m-0 mb-4xs text-step-0 tracking-[-0.025em]">{item.title}</h3>
              <p className="m-0 text-body leading-[1.45] text-text-muted">{item.description}</p>
            </div>
            {/* Cut on a phone: the row is too narrow to carry a tag as well. */}
            {item.tag ? (
              <span className="hidden text-label font-black tracking-label-tight text-[var(--page-accent,var(--action-primary))] uppercase sm:inline">
                {item.tag}
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      <footer className="flex flex-wrap gap-2xs p-m sm:px-ml">
        {footerItems.map((item) => (
          <span
            key={item}
            className="bg-surface-tint px-xs py-2xs text-caption font-strong text-text-muted"
          >
            {item}
          </span>
        ))}
      </footer>
    </div>
  );
}
