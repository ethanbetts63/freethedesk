export type ProofStat = {
  value: string;
  label: string;
  description: string;
};

export function ProofStrip({ stats, id }: { stats: readonly ProofStat[]; id?: string }) {
  return (
    <section className="proof-strip" id={id}>
      <div className="shell proof-strip-grid">
        {stats.map((stat) => (
          <article key={stat.label}>
            <strong className="moving-colour-text">{stat.value}</strong>
            <div>
              <h2>{stat.label}</h2>
              <p>{stat.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
