import { SectionNumber } from "@/components/SectionNumber";

import styles from "./ConversionFunnel.module.css";

export function ConversionFunnel({ eyebrow }: { eyebrow: string }) {
  return (
    <section className={`shell ${styles.section}`} id="customer-journeys">
      <div className={styles.visual} aria-hidden="true">
        <div className={styles.browser}>
          <i />
          <i />
          <i />
          <span>customer journey</span>
        </div>
        <div className={styles.funnelBody}>
          <div className={styles.funnelStart}>
            <span>Point A</span>
            <strong>Interested visitor</strong>
            <small>Intent captured</small>
          </div>
          <ol className={styles.funnelSteps}>
            <li>
              <span>01</span>
              <strong>Find the path</strong>
              <small>One clear route forward</small>
            </li>
            <li>
              <span>02</span>
              <strong>Understand the offer</strong>
              <small>The right detail, in the right order</small>
            </li>
            <li>
              <span>03</span>
              <strong>Take action</strong>
              <small>Only the essential effort</small>
            </li>
          </ol>
          <div className={styles.funnelResult}>
            <span className={styles.funnelResultTick} aria-hidden="true">
              ✓
            </span>
            <span>Point B</span>
            <strong>Action complete</strong>
            <small>Next step confirmed</small>
          </div>
        </div>
      </div>
      <div className={styles.copy}>
        <SectionNumber>{eyebrow}</SectionNumber>
        <h2>
          Websites designed to
          <br className={styles.desktopBreak} />
          <span className="moving-colour-text">be obvious.</span>
        </h2>
        <p>
          Visitors shouldn&apos;t have to work out what to do next. We create clear paths from their first click to a
          purchase, booking or enquiry.
        </p>
        <ul>
          <li>One clear action at every stage</li>
          <li>Fewer fields, choices and dead ends</li>
          <li>A clear confirmation and handoff at the end</li>
        </ul>
      </div>
    </section>
  );
}
