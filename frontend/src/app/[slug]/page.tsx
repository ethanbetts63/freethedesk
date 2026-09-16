import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Eyebrow } from '@/components/Eyebrow';
import { getAllArticleSlugs, getArticleBySlug, type Article } from '@/lib/articles';
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  pageMetadata,
} from '@/lib/seo';

import styles from './article.module.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: 'Guide not found', robots: { index: false, follow: false } };
  }

  return pageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/${article.slug}`,
    openGraphType: 'article',
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
      { name: 'Home', path: '/' },
      { name: 'Guides', path: '/guides' },
      { name: article.title, path },
    ]),
  ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ArticleView article={article} />
    </main>
  );
}

function ArticleView({ article }: { article: Article }) {
  const publishedDate = new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Australia/Perth',
  }).format(new Date(`${article.publishedDate}T00:00:00+08:00`));

  return (
    <>
      <header className="relative overflow-hidden bg-surface-dark pt-2xl pb-[clamp(84px,10vw,138px)] text-text-on-dark before:absolute before:inset-0 before:content-[''] before:[background-image:linear-gradient(color-mix(in_srgb,var(--blue-400)_5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--blue-400)_5%,transparent)_1px,transparent_1px)] before:[background-size:64px_64px] before:[mask-image:linear-gradient(90deg,var(--text-primary),transparent_88%)] after:absolute after:top-[-180px] after:right-[-100px] after:h-[380px] after:w-[380px] after:rounded-full after:bg-accent after:opacity-10 after:content-[''] after:[filter:blur(24px)]">
        <div className="site-shell relative z-1">
          <nav
            className="mb-2xl flex items-center gap-xs text-ui font-strong text-[var(--text-on-dark-subtle)] [&_a]:transition-colors [&_a]:duration-200 [&_a:hover]:text-accent sm:mb-[clamp(70px,9vw,112px)]"
            aria-label="Breadcrumb"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/guides">Guides</Link>
          </nav>
          <Eyebrow className="mb-l gap-xs text-caption tracking-[0.14em] text-accent">
            Dealer field notes
          </Eyebrow>
          <h1 className="m-0 max-w-[1040px] text-display-6 leading-[0.94] tracking-[-0.07em]">
            {article.title}
          </h1>
          <p className="mt-xl max-w-[720px] text-step-1 leading-[1.65] text-[var(--text-on-dark-muted)]">
            {article.excerpt}
          </p>
          <p className="mt-xl flex flex-wrap items-center gap-xs text-caption font-heavy tracking-[0.07em] text-[var(--text-on-dark-subtle)] uppercase">
            By {article.authorName}{' '}
            <i className="hidden h-px w-[28px] bg-[var(--border-on-dark-strong)] sm:block" />{' '}
            Published <time dateTime={article.publishedDate}>{publishedDate}</time>
          </p>
        </div>
      </header>

      <section className="bg-surface-page py-[clamp(78px,10vw,132px)]">
        <div className="site-shell grid grid-cols-1 items-start justify-center gap-[clamp(52px,8vw,120px)] min-[900px]:grid-cols-[210px_minmax(0,760px)]">
          <aside className="static flex gap-m border-b border-border-default pb-ml min-[900px]:sticky min-[900px]:top-[120px] min-[900px]:gap-0 min-[900px]:border-b-0 min-[900px]:pb-0">
            <span className="text-caption font-heavy tracking-[0.14em] text-text-action uppercase">
              Guide
            </span>
            <i className="my-ml hidden h-px w-[72px] bg-border-default min-[900px]:block" />
            <p className="hidden max-w-[180px] text-ui leading-[1.6] text-text-subtle min-[900px]:block">
              Practical thinking for dealerships that want better systems and less administration.
            </p>
          </aside>
          <article className={styles.prose} dangerouslySetInnerHTML={{ __html: article.html }} />
        </div>
      </section>

      <section className="border-t border-border-default bg-surface-tint">
        <div className="site-shell flex min-h-[148px] flex-col items-start justify-center gap-m sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <p className="m-0 text-caption font-heavy tracking-[0.12em] text-text-subtle uppercase">
            Keep exploring
          </p>
          <Link className="group flex items-center gap-xl text-body font-heavy" href="/guides">
            Back to all guides{' '}
            <span
              aria-hidden="true"
              className="text-step-0 text-text-action transition-transform duration-200 group-hover:translate-x-[5px]"
            >
              →
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
