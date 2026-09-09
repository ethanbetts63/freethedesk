import type { Metadata } from "next";
import Link from "next/link";

import { Eyebrow } from "@/components/Eyebrow";
import { PageSchema } from "@/components/PageSchema";
import { SectionNumber } from "@/components/SectionNumber";
import { getAllArticleMeta } from "@/lib/articles";
import { metadataFor, PAGES } from "@/lib/pages";

import styles from "./guides.module.css";

export const metadata: Metadata = metadataFor("/guides");

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Australia/Perth",
});

export default function GuidesPage() {
  const articles = getAllArticleMeta();

  return (
    <main>
      <PageSchema path="/guides" />

      <section className={styles.hero}>
        <div className={`shell ${styles.heroInner}`}>
          <Eyebrow className={styles.eyebrow}>Field notes for dealers</Eyebrow>
          <h1>
            Useful systems.
            <br />
            <em>Plain English.</em>
          </h1>
          <p className={styles.lead}>{PAGES["/guides"].description}</p>
        </div>
        <div className={styles.heroMark} aria-hidden="true">
          <span>01</span>
          <i />
        </div>
      </section>

      <section className={styles.index} aria-labelledby="latest-guides">
        <div className="shell">
          <header className={styles.indexHeader}>
            <div>
              <SectionNumber>The guide library</SectionNumber>
              <h2 id="latest-guides">Built from the work.</h2>
            </div>
            <p>Clear, practical thinking drawn from building and running dealership software in the real world.</p>
          </header>

          {articles.length > 0 ? (
            <div className={styles.grid}>
              {articles.map((article, index) => (
                <Link className={styles.card} href={`/${article.slug}`} key={article.slug}>
                  <div className={styles.cardTop}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>Guide</span>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.byline}>
                      By {article.authorName} ·{" "}
                      <time dateTime={article.publishedDate}>
                        {dateFormatter.format(new Date(`${article.publishedDate}T00:00:00+08:00`))}
                      </time>
                    </p>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                  </div>
                  <span className={styles.readLink}>
                    Read guide <b aria-hidden="true">→</b>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <span>01</span>
              <div>
                <h3>The first field note is on the way.</h3>
                <p>We are assembling practical guides for dealers who want clearer websites and less administration.</p>
              </div>
              <Link href="/contact">
                Ask us a question <b aria-hidden="true">→</b>
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
