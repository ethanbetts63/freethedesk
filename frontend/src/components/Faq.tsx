import { SectionNumber } from "@/components/SectionNumber";
import styles from "./Faq.module.css";

export type FaqItem = { question: string; answer: string };

export function Faq({ eyebrow, title, items, id }: { eyebrow: string; title: string; items: FaqItem[]; id?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section className={styles.faqSection} id={id}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className={`shell ${styles.faqLayout}`}>
        <div>
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2>{title}</h2>
        </div>
        <div className={styles.faqList}>
          {items.map((item) => (
            <details key={item.question}>
              <summary>
                {item.question}
                <span aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
