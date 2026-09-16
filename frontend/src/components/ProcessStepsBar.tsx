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
    <section className="bg-surface-dark text-text-on-dark" id={id} aria-label={ariaLabel}>
      <div className="shell">
        <ol className="m-0 flex min-h-[80px] list-none items-center gap-s py-l sm:min-h-[108px] sm:gap-xl">
          {steps.map((step) => (
            <li
              key={step}
              className="flex min-w-0 flex-1 items-center gap-s last:flex-none [&:not(:last-child)]:after:h-[10px] [&:not(:last-child)]:after:min-w-[6px] [&:not(:last-child)]:after:flex-1 [&:not(:last-child)]:after:bg-[var(--accent-on-dark-soft)] [&:not(:last-child)]:after:opacity-65 [&:not(:last-child)]:after:content-[''] [&:not(:last-child)]:after:[clip-path:polygon(0_45%,calc(100%-5px)_45%,calc(100%-5px)_0,100%_50%,calc(100%-5px)_100%,calc(100%-5px)_55%,0_55%)]"
            >
              <span
                className={`text-body font-strong tracking-[-0.025em] sm:text-step-2 ${step === accentStep ? "moving-colour-text" : ""}`}
              >
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
