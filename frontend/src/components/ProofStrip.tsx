export type ProofStat = {
  value: string;
  label: string;
  description: string;
};

/** A thin dark band of stats, sitting flush under a hero. Sized to however many stats it is given. */
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
