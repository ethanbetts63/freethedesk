import { SectionNumber } from "./SectionNumber";
import styles from "./ProcessIntroduction.module.css";

export type ProcessIntroductionItem = {
  title: string;
  description: string;
};

export function ProcessIntroduction({
  eyebrow,
  title,
  accentTitle,
  items,
  id,
}: {
  eyebrow: string;
  title: string;
  accentTitle: string;
  items: readonly ProcessIntroductionItem[];
  id: string;
}) {
  return (
    <section className={`shell ${styles.section}`} id={id} aria-labelledby={`${id}-title`}>
      <SectionNumber>{eyebrow}</SectionNumber>
      <h2 id={`${id}-title`}>
        {title} <span className="moving-colour-text">{accentTitle}</span>
      </h2>
      <div className={styles.columns}>
        {items.map((item) => (
          <div key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
