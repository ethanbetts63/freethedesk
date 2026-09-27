import { cn } from '@/lib/utils';

/**
 * A workflow drawn as a card: a trigger event, three branches drawn with
 * borders rather than an SVG, three resulting actions, and a stat bar.
 *
 * The branch elbows, the action numbers and the eyebrow are all drawn in
 * --action-primary, so they stay one colour rather than three.
 */
/**
 * Three elbows: a riser that turns right, a straight drop, and a riser that
 * turns left. Drawn with two borders per element because an SVG would need its
 * own viewBox maths to stay aligned with the cards underneath.
 *
 * The border colour is spelled out in full rather than composed from a
 * constant: Tailwind compiles only the class strings it can read in the
 * source, and a name interpolated at runtime produces no CSS at all.
 */
const routeClassName = cn(
  'mx-auto flex h-[24px] w-[83%] justify-around overflow-hidden sm:h-[var(--size-control)] sm:w-[72%]',
  '[&>i]:h-[var(--size-control)] [&>i]:w-[33%] [&>i]:border-t [&>i]:border-l [&>i]:border-[color-mix(in_srgb,var(--action-primary)_55%,transparent)]',
  '[&>i:first-child]:border-t-0',
  '[&>i:nth-child(2)]:w-[1px]',
  '[&>i:last-child]:border-t-0 [&>i:last-child]:border-l-0 [&>i:last-child]:border-r',
);

const cardClassName = 'border border-border-subtle bg-surface-tint';

export function AutomationFeatureVisual() {
  return (
    <div
      className={cn(
        'relative px-s py-ml text-text-secondary sm:p-l',
        // The animated border, and a tinted slab behind it that deepens from a
        // phone to a desktop.
        'moving-colour-border shadow-block-s [--elevation-block-colour:color-mix(in_srgb,var(--accent-on-dark)_7%,transparent)]',
        'sm:shadow-block-l sm:[--elevation-block-colour:color-mix(in_srgb,var(--surface-inverse)_14%,transparent)]',
        // Graph paper behind the contents; children are positioned so they sit
        // above it without needing a z-index.
        "before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:[background-image:linear-gradient(var(--tint-grid)_1px,transparent_1px),linear-gradient(90deg,var(--tint-grid)_1px,transparent_1px)] before:[background-size:32px_32px]",
        '[&>*]:relative',
      )}
      aria-hidden="true"
    >
      <header className="flex items-center justify-between border-b border-border-subtle pb-m text-label font-black tracking-label text-text-subtle uppercase">
        <span>Workflow / 01</span>
        {/* background-clip: text paints the gradient into the glyphs only; the
            status dot is a child with its own background, so it is unaffected. */}
        <b className="moving-colour-text flex items-center gap-xs">
          <i className="moving-colour-fill h-[var(--size-dot)] w-[var(--size-dot)] rounded-circle" />{' '}
          Running
        </b>
      </header>
      <div className={cn(cardClassName, 'mx-auto mt-l w-[92%] px-ml py-m sm:w-[78%]')}>
        <small className="block text-caption font-black tracking-label text-action-primary uppercase">
          Trigger
        </small>
        <strong className="mt-2xs mb-3xs block text-lead">New enquiry received</strong>
        <span className="block text-label text-text-subtle">
          Customer + product context attached
        </span>
      </div>
      <div className={routeClassName}>
        <i />
        <i />
        <i />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-xs sm:grid-cols-3">
        {[
          ['01', 'CRM updated', 'No re-keying'],
          ['02', 'Team notified', 'Right person, instantly'],
          ['03', 'Follow-up queued', 'Nothing forgotten'],
        ].map(([index, title, note]) => (
          <article
            key={index}
            className={cn(
              cardClassName,
              'grid min-w-0 grid-cols-[25px_minmax(0,1fr)] gap-x-xs gap-y-4xs px-s py-m sm:block',
            )}
          >
            <span className="row-span-2 block text-caption font-black text-action-primary sm:row-auto">
              {index}
            </span>
            <strong className="m-0 block text-label text-surface-dark sm:mt-s sm:mb-3xs">
              {title}
            </strong>
            <small className="block text-label leading-[1.4] text-text-subtle">{note}</small>
          </article>
        ))}
      </div>
      <footer className="moving-colour-fill mt-m grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-s gap-y-3xs px-m py-s">
        <span className="text-label font-heavy tracking-label-tight text-[color-mix(in_srgb,var(--surface-page)_82%,transparent)] uppercase">
          Manual touches
        </span>
        <strong className="row-span-2 text-title text-text-on-dark">0</strong>
        <small className="text-label font-strong text-text-on-dark">Workflow complete</small>
      </footer>
    </div>
  );
}
