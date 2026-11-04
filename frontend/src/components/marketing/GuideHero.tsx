/**
 * The guides' hero: a short dark band with the title and summary in a centred
 * panel, after Scooter Shop's licence guide. The band is the site's dark grid
 * rather than a photograph, so the panel is what frames the words.
 */
export function GuideHero({ title, description }: { title: string; description: string }) {
  return (
    <section className="relative overflow-hidden bg-surface-dark text-text-on-dark before:absolute before:inset-0 before:content-[''] before:[background-image:linear-gradient(var(--tint-grid-on-dark)_1px,transparent_1px),linear-gradient(90deg,var(--tint-grid-on-dark)_1px,transparent_1px)] before:[background-size:var(--hero-grid-size)_var(--hero-grid-size)] after:absolute after:top-[-40%] after:right-[-6%] after:size-[clamp(220px,30vw,420px)] after:rounded-full after:bg-accent after:opacity-[0.14] after:content-[''] after:[filter:blur(24px)]">
      <div className="site-shell relative z-1 flex min-h-[200px] items-end py-l sm:min-h-[260px] sm:items-center sm:justify-center sm:py-xl">
        <div className="sm:max-w-measure-tight sm:rounded-md sm:border sm:border-border-on-dark sm:bg-surface-dark-soft/80 sm:px-xl sm:py-l sm:text-center sm:backdrop-blur-sm">
          <h1 className="m-0 text-title leading-[1.1] font-heavy tracking-[-0.04em] text-text-on-dark">
            {title}
          </h1>
          <p className="mt-xs mb-0 text-body leading-relaxed text-text-on-dark-muted">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
