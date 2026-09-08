import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllArticleSlugs, getArticleBySlug, type Article } from "@/lib/articles";
import { buildArticleSchema, buildBreadcrumbSchema, buildWebPageSchema, pageMetadata } from "@/lib/seo";

import styles from "./article.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Guide not found", robots: { index: false, follow: false } };
  }

  return pageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/${article.slug}`,
    openGraphType: "article",
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const path = `/${article.slug}`;
  const structuredData = [
    buildWebPageSchema({ title: article.title, description: article.excerpt, path }),
    buildArticleSchema(article),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: article.title, path },
    ]),
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ArticleView article={article} />
    </main>
  );
}

function ArticleView({ article }: { article: Article }) {
  const publishedDate = new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Perth",
  }).format(new Date(`${article.publishedDate}T00:00:00+08:00`));

  return (
    <>
      <header className={styles.hero}>
        <div className={`shell ${styles.heroInner}`}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/guides">Guides</Link>
          </nav>
          <p className={styles.eyebrow}>
            <span /> Dealer field notes
          </p>
          <h1>{article.title}</h1>
          <p className={styles.intro}>{article.excerpt}</p>
          <p className={styles.byline}>
            By {article.authorName} <i /> Published <time dateTime={article.publishedDate}>{publishedDate}</time>
          </p>
        </div>
      </header>

      <section className={styles.articleSection}>
        <div className={`shell ${styles.articleLayout}`}>
          <aside className={styles.rail}>
            <span>Guide</span>
            <i />
            <p>Practical thinking for dealerships that want better systems and less administration.</p>
          </aside>
          <article className={styles.prose} dangerouslySetInnerHTML={{ __html: article.html }} />
        </div>
      </section>

      <section className={styles.returnSection}>
        <div className={`shell ${styles.returnInner}`}>
          <p>Keep exploring</p>
          <Link href="/guides">
            Back to all guides <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
