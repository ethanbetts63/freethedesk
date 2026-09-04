import Link from "next/link";

import styles from "./FlagshipCheckout.module.css";

const journey = [
  {
    number: "01",
    title: "Purchase",
    detail: "Deposit or full payment",
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3zM3 10h18M7 15h4" /></svg>,
  },
  {
    number: "02",
    title: "License",
    detail: "Identity, forms and signatures",
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6zM15 3v4h4M9 12h6m-6 4h4" /></svg>,
  },
  {
    number: "03",
    title: "Handover",
    detail: "Delivery or collection",
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /></svg>,
  },
];

export function FlagshipCheckout() {
  return (
    <section className={styles.section} id="online-purchasing">
      <div className={`shell ${styles.layout}`}>
        <div className={styles.visual}>
          <div className={styles.visualHeader}>
            <span>One connected journey</span>
            <b>Entirely online</b>
          </div>

          <div className={styles.journey}>
            {journey.map((step) => (
              <article key={step.number}>
                <div className={styles.icon}>{step.icon}</div>
                <span>{step.number}</span>
                <strong>{step.title}</strong>
                <small>{step.detail}</small>
              </article>
            ))}
          </div>

          <div className={styles.status}>
            <span><i /> Customer journey complete</span>
            <strong>Dealership notified <b>✓</b></strong>
          </div>
        </div>

        <div className={styles.copy}>
          <p className={styles.eyebrow}><span /> Flagship product</p>
          <h2>Sell &amp; License.<br /><em>Entirely online.</em></h2>
          <p className={styles.lead}>
            Let customers purchase, complete their paperwork and arrange handover without needing to visit the dealership.
          </p>
          <ul>
            <li>Accept a deposit or full payment</li>
            <li>Complete licensing and contracts digitally</li>
            <li>Arrange delivery or collection online</li>
          </ul>
          <Link href="/licensing">Explore online licensing <span>→</span></Link>
        </div>
      </div>
    </section>
  );
}
