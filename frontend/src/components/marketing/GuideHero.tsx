import Link from 'next/link';

/**
 * The guides' hero: a short dark band with the title and summary in a centred
 * panel, after Scooter Shop's licence guide. The band is the site's dark grid
 * rather than a photograph, so the panel is what frames the words.
 *
 * `titleAs="p"` where the article body opens with its own `h1`, so the page
 * keeps one.
 */
export function GuideHero({
  title,
  description,
  titleAs: Title = 'h1',
}: {
  title: string;
  description: string;
  titleAs?: 'h1' | 'p';
}) {
  return (
    <section className="relative overflow-hidden bg-surface-dark text-text-on-dark before:absolute before:inset-0 before:content-[''] before:[background-image:linear-gradient(var(--tint-grid-on-dark)_1px,transparent_1px),linear-gradient(90deg,var(--tint-grid-on-dark)_1px,transparent_1px)] before:[background-size:var(--hero-grid-size)_var(--hero-grid-size)] after:absolute after:top-[-40%] after:right-[-6%] after:size-[clamp(220px,30vw,420px)] after:rounded-full after:bg-accent after:opacity-[0.14] after:content-[''] after:[filter:blur(24px)]">
      <div className="site-shell relative z-1 flex min-h-[200px] items-end py-l sm:min-h-[260px] sm:items-center sm:justify-center sm:py-xl">
        <div className="sm:max-w-measure-tight sm:rounded-md sm:border sm:border-border-on-dark sm:bg-surface-dark-soft/80 sm:px-xl sm:py-l sm:text-center sm:backdrop-blur-sm">
          <Title className="m-0 text-title leading-[1.1] font-heavy tracking-[-0.04em] text-text-on-dark">
            {title}
          </Title>
          <p className="mt-xs mb-0 text-body leading-relaxed text-text-on-dark-muted">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

/** The trail under the hero, Home to the page, as plain links. */
export function GuideTrail({ trail }: { trail: readonly { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-xl text-body-sm text-text-muted">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-xs gap-y-3xs p-0">
        {trail.map((step, index) => (
          <li key={step.label} className="flex items-center gap-xs">
            {index > 0 && <span aria-hidden="true">/</span>}
            {step.href ? (
              <Link href={step.href} className="transition-colors hover:text-text-action">
                {step.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-text-primary">
                {step.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
