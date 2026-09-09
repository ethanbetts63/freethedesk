"use client";

import { PageHeading } from "./shared";
import styles from "../../_styles/preview.module.css";

export function ArticlesPage() {
  return (
    <div className={styles.examplePage}>
      <PageHeading eyebrow="Advice and ownership" title="Guides for the road ahead." detail="View all guides →" />
      <div className={styles.journalFeature}>
        <div />
        <section>
          <small>Buying guide · 7 min</small>
          <h3>How to choose the right machine for the way you ride.</h3>
          <p>A practical guide to finding the right balance of comfort, performance and everyday usability.</p>
          <b>Read the guide →</b>
        </section>
      </div>
      <div className={styles.journalGrid}>
        <article>
          <i />
          <small>Ownership</small>
          <strong>Preparing for your first service</strong>
        </article>
        <article>
          <i />
          <small>Routes</small>
          <strong>Three perfect weekend escapes</strong>
        </article>
      </div>
    </div>
  );
}
