import type { FlowCardNode } from './FlowCardVisual';

/**
 * A customer's path as one track: where they start, the steps between, and the
 * finished action, joined by a single line. The steps sit on the line at full
 * width rather than narrowing like a funnel, so every label stays readable,
 * and only the end point is filled in.
 */
export function JourneyTrackVisual({
  label,
  start,
  steps,
  end,
  ariaLabel,
}: {
  label: string;
  start: FlowCardNode;
  steps: readonly Omit<FlowCardNode, 'label'>[];
  end: FlowCardNode;
  ariaLabel: string;
}) {
  return (
    <figure className="m-0 moving-colour-border p-ml shadow-l sm:p-xl" aria-label={ariaLabel}>
      <figcaption className="mb-l flex items-center justify-between gap-s text-label font-heavy tracking-label text-text-subtle uppercase">
        <span>{label}</span>
        <span className="text-action-primary">{steps.length} steps, one action</span>
      </figcaption>

      {/* The line runs behind the markers, from the first centre to the last. */}
      <ol className="relative m-0 grid list-none gap-m p-0 before:absolute before:top-[20px] before:bottom-[20px] before:left-[19px] before:w-[2px] before:bg-border-default before:content-['']">
        <li className="relative grid grid-cols-[40px_minmax(0,1fr)] items-center gap-m">
          <span
            aria-hidden="true"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-full border-2 border-border-default bg-surface-page text-label font-heavy text-text-subtle"
          >
            A
          </span>
          <div>
            <small className="block text-caption font-heavy tracking-label text-text-subtle uppercase">
              {start.label}
            </small>
            <strong className="block text-lead tracking-[-0.025em] text-text-secondary">
              {start.title}
            </strong>
            <span className="text-body-sm text-text-muted">{start.description}</span>
          </div>
        </li>

        {steps.map((step, index) => (
          <li
            key={step.title}
            className="relative grid grid-cols-[40px_minmax(0,1fr)] items-center gap-m"
          >
            <span
              aria-hidden="true"
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full border-2 border-action-primary bg-surface-page text-label font-heavy text-action-primary"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="border border-border-default bg-surface-tint px-m py-s">
              <strong className="block text-body font-strong text-text-secondary">
                {step.title}
              </strong>
              <span className="text-body-sm text-text-muted">{step.description}</span>
            </div>
          </li>
        ))}

        <li className="relative grid grid-cols-[40px_minmax(0,1fr)] items-center gap-m">
          <span
            aria-hidden="true"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-action-primary text-lead font-heavy text-text-on-dark"
          >
            ✓
          </span>
          <div className="bg-surface-dark px-m py-s text-text-on-dark">
            <small className="block text-caption font-heavy tracking-label text-[var(--accent-on-dark)] uppercase">
              {end.label}
            </small>
            <strong className="block text-lead tracking-[-0.025em]">{end.title}</strong>
            <span className="text-body-sm text-[var(--text-on-dark-muted)]">{end.description}</span>
          </div>
        </li>
      </ol>
    </figure>
  );
}
