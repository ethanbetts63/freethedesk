import Image from "next/image";
import Link from "next/link";

import styles from "./FlagshipCheckout.module.css";

const journey = [
  {
    number: "01",
    title: "Choose",
    detail: "Select the vehicle online",
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h6v6H4zM14 5h6v6h-6zM4 13h6v6H4zM14 13h6v6h-6z" /></svg>,
  },
  {
    number: "02",
    title: "Sign",
    detail: "Identity, forms and signatures",
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6zM15 3v4h4M9 12h6m-6 4h4" /></svg>,
  },
  {
    number: "03",
    title: "Pay",
    detail: "Deposit or full payment",
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3zM3 10h18M7 15h4" /></svg>,
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
            <Image className={styles.stripeLogo} src="/stripe-ar21.svg" alt="Stripe" width={120} height={60} />
            <b>Verified Identity</b>
          </div>
        </div>

        <div className={styles.copy}>
          <p className={styles.eyebrow}><span /> Flagship product</p>
          <h2>Sell &amp; License.<br /><em>Entirely online.</em></h2>
          <p className={styles.lead}>
            Let customers purchase, complete their paperwork and arrange handover without needing to visit the dealership.
          </p>
          <ul>
            <li>Sales contracts</li>
            <li>Licensing documents</li>
            <li>Identity verification</li>
            <li>Optional payment and delivery handling</li>
          </ul>
          <Link href="/licensing">Explore online licensing <span>→</span></Link>
        </div>
      </div>
    </section>
  );
}
