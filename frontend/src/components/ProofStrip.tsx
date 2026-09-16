export type ProofStat = {
  value: string;
  label: string;
  description: string;
};

export function ProofStrip({ stats, id }: { stats: readonly ProofStat[]; id?: string }) {
  return (
    <section className="bg-surface-dark text-text-on-dark" id={id}>
      <div className="shell grid grid-cols-[auto_minmax(0,max-content)] justify-center gap-x-s min-[900px]:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] min-[900px]:justify-normal min-[900px]:gap-x-0">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="col-span-full grid min-h-auto grid-cols-subgrid items-center gap-s py-xl [article+&]:border-t [article+&]:border-border-on-dark min-[900px]:col-auto min-[900px]:grid-cols-[minmax(0,1fr)] min-[900px]:min-h-[160px] min-[900px]:items-start min-[900px]:gap-ml min-[900px]:px-xl min-[900px]:[article+&]:border-t-0 min-[900px]:[article+&]:border-l min-[1080px]:grid-cols-[auto_minmax(0,1fr)] min-[1080px]:items-center"
          >
            <strong className="moving-colour-text inline-block justify-self-center pr-[0.07em] text-display-2 tracking-[-0.07em] whitespace-nowrap min-[900px]:justify-self-start">
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
