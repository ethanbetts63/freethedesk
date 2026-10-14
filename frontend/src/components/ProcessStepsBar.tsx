export function ProcessStepsBar({
  steps,
  id,
  ariaLabel,
  accentStep = steps.at(-1),
}: {
  steps: readonly string[];
  id: string;
  ariaLabel: string;
  accentStep?: string;
}) {
  return (
    <>
      {/* The id is a marker the floating buttons watch. It stays in the layout on
          phones, where the bar is hidden, because a hidden element reads as
          already scrolled past. */}
      <span id={id} aria-hidden="true" className="block" />
      <section className="bg-surface-dark text-text-on-dark max-sm:hidden" aria-label={ariaLabel}>
        <div className="site-shell">
          {/* The list's gap and each step's gap are the same, so an arrow sits as far
            from the word after it as from the word before. */}
          <ol className="m-0 flex min-h-[108px] list-none items-center gap-xl py-l">
            {steps.map((step) => (
              <li
                key={step}
                className="flex min-w-0 flex-1 items-center gap-xl last:flex-none [&:not(:last-child)]:after:h-[10px] [&:not(:last-child)]:after:min-w-[var(--size-dot)] [&:not(:last-child)]:after:flex-1 [&:not(:last-child)]:after:bg-[var(--accent-on-dark-soft)] [&:not(:last-child)]:after:opacity-65 [&:not(:last-child)]:after:content-[''] [&:not(:last-child)]:after:[clip-path:polygon(0_45%,calc(100%-5px)_45%,calc(100%-5px)_0,100%_50%,calc(100%-5px)_100%,calc(100%-5px)_55%,0_55%)]"
              >
                <span
                  className={`text-title-sm font-strong tracking-[-0.025em] ${step === accentStep ? 'moving-colour-text' : ''}`}
                >
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
