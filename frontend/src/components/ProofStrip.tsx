export type ProofStat = {
  value: string;
  label: string;
  description: string;
};

/** A thin three-stat dark band, sitting flush under a hero. */
export function ProofStrip({ stats, id }: { stats: [ProofStat, ProofStat, ProofStat]; id?: string }) {
  return (
    <section className="proof-strip" id={id}>
      <div className="shell proof-strip-grid">
        {stats.map((stat) => (
          <article key={stat.label}>
            <strong>{stat.value}</strong>
            <div><h2>{stat.label}</h2><p>{stat.description}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}
