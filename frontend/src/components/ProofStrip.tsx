export type ProofStat = {
  value: string;
  label: string;
  description: string;
};

export function ProofStrip({ stats, id }: { stats: readonly ProofStat[]; id?: string }) {
  return (
    <section className="bg-surface-dark text-text-on-dark" id={id}>
      <div className="site-shell grid grid-cols-[auto_minmax(0,max-content)] justify-center gap-x-s lg:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] lg:justify-normal lg:gap-x-0">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="col-span-full grid min-h-auto grid-cols-subgrid items-center gap-s py-xl [article+&]:border-t [article+&]:border-border-on-dark lg:col-auto lg:grid-cols-[minmax(0,1fr)] lg:min-h-[160px] lg:items-start lg:gap-ml lg:px-xl lg:[article+&]:border-t-0 lg:[article+&]:border-l xl:grid-cols-[auto_minmax(0,1fr)] xl:items-center"
          >
            {/* eslint-disable-next-line no-restricted-syntax -- Optical kerning after the final glyph: em-relative to the numeral's own size, not interface spacing. */}
            <strong className="moving-colour-text inline-block justify-self-center pr-[0.07em] text-display tracking-[-0.07em] whitespace-nowrap lg:justify-self-start">
              {stat.value}
            </strong>
            <div>
              <h2 className="m-0 mb-2xs text-step-0">{stat.label}</h2>
              <p className="m-0 text-body leading-[1.5] text-text-on-dark-muted">
                {stat.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
