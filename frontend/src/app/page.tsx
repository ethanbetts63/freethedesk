const capabilities = [
  "Inventory and product discovery",
  "Parts, service and hire workflows",
  "Dealer admin tools and automation",
];

export default function Home() {
  return (
    <main>
      <nav className="nav" aria-label="Primary navigation">
        <a className="brand" href="#top">free<span>the</span>desk</a>
        <a className="nav-link" href="mailto:hello@freethedesk.com.au">Start a conversation</a>
      </nav>

      <section className="hero" id="top">
        <p className="eyebrow">Dealer operations systems</p>
        <h1>More sales floor.<br />Less admin desk.</h1>
        <p className="intro">
          Free the Desk builds fast dealer websites and practical systems that keep inventory,
          customer enquiries, parts, service and teams moving.
        </p>
        <a className="button" href="mailto:hello@freethedesk.com.au?subject=Free%20the%20Desk%20enquiry">
          Talk through your dealership
        </a>
      </section>

      <section className="capabilities" aria-label="What we help with">
        {capabilities.map((capability, index) => (
          <article key={capability}>
            <p>0{index + 1}</p>
            <h2>{capability}</h2>
          </article>
        ))}
      </section>
    </main>
  );
}

