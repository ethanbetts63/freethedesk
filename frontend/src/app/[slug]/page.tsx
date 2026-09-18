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

// Uncontrolled rich content: the markup comes from the article body, so the
// rules cannot be put on elements by hand.
// eslint-disable-next-line no-restricted-imports -- approved exception
import styles from './article.module.css';
import { cn } from '@/lib/utils';

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
      <header className="relative overflow-hidden bg-surface-dark pt-2xl pb-section-tall text-text-on-dark before:absolute before:inset-0 before:content-[''] before:[background-image:linear-gradient(color-mix(in_srgb,var(--blue-400)_5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--blue-400)_5%,transparent)_1px,transparent_1px)] before:[background-size:64px_64px] before:[mask-image:linear-gradient(90deg,var(--text-primary),transparent_88%)] after:absolute after:top-[-180px] after:right-[-100px] after:h-[380px] after:w-[380px] after:rounded-full after:bg-accent after:opacity-10 after:content-[''] after:[filter:blur(24px)]">
        <div className="site-shell relative z-1">
          <nav
            className="mb-2xl flex items-center gap-xs text-label font-strong text-[var(--text-on-dark-subtle)] [&_a]:transition-colors [&_a]:duration-200 [&_a:hover]:text-accent sm:mb-section"
            aria-label="Breadcrumb"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/guides">Guides</Link>
          </nav>
          <Eyebrow className="mb-l gap-xs text-caption tracking-label-wide text-accent">
            Dealer field notes
          </Eyebrow>
          <h1 className="m-0 max-w-[1040px] text-hero-lg leading-[0.94] tracking-[-0.07em]">
            {article.title}
          </h1>
          <p className="mt-xl max-w-[720px] text-step-1 leading-[1.65] text-[var(--text-on-dark-muted)]">
            {article.excerpt}
          </p>
          <p className="mt-xl flex flex-wrap items-center gap-xs text-caption font-heavy tracking-label-tight text-[var(--text-on-dark-subtle)] uppercase">
            By {article.authorName}{' '}
            <i className="hidden h-px w-[28px] bg-[var(--border-on-dark-strong)] sm:block" />{' '}
            Published <time dateTime={article.publishedDate}>{publishedDate}</time>
          </p>
        </div>
      </header>

      <section className="bg-surface-page py-section-tall">
        <div className="site-shell grid grid-cols-1 items-start justify-center gap-split lg:grid-cols-[210px_minmax(0,760px)]">
          <aside className="static flex gap-m border-b border-border-default pb-ml lg:sticky lg:top-[120px] lg:gap-0 lg:border-b-0 lg:pb-0">
            <span className="text-caption font-heavy tracking-label-wide text-text-action uppercase">
              Guide
            </span>
            <i className="my-ml hidden h-px w-[72px] bg-border-default lg:block" />
            <p className="hidden max-w-[180px] text-label leading-[1.6] text-text-subtle lg:block">
              Practical thinking for dealerships that want better systems and less administration.
            </p>
          </aside>
          <article
            className={cn('prose', styles.article)}
            dangerouslySetInnerHTML={{ __html: article.html }}
          />
        </div>
      </section>

      <section className="border-t border-border-default bg-surface-tint">
        <div className="site-shell flex min-h-[148px] flex-col items-start justify-center gap-m sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <p className="m-0 text-caption font-heavy tracking-label text-text-subtle uppercase">
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
