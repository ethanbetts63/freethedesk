import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Eyebrow from '@/components/common/eyebrow';
import { GuideCta, type GuideCtaKind } from '@/app/guides/_components/GuideCta';
import { GuideHero, GuideTrail } from '@/components/marketing/GuideHero';
import StructuredDataScript from '@/components/seo/StructuredDataScript';
import { getAllArticleSlugs, getArticleBySlug, type Article } from '@/lib/articles';
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  buildMetadata,
} from '@/lib/seo';

// Uncontrolled rich content: the markup comes from the article body, so the
// rules cannot be put on elements by hand.
// eslint-disable-next-line no-restricted-imports -- approved exception
import styles from './article.module.css';
import { cn } from '@/lib/utils';

export const dynamicParams = false;

/**
 * Which service each guide ends on. A guide about being found ends on SEO;
 * anything else ends on websites. Add a new guide here when it is about search.
 */
const GUIDE_CTA: Record<string, GuideCtaKind> = {
  'business-not-showing-up-on-google': 'seo',
};

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

  return buildMetadata({
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
      <StructuredDataScript structuredData={structuredData} />
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
      <GuideHero title={article.title} description={article.excerpt} titleAs="p" />

      <section className="bg-surface-page py-section-half">
        <div className="site-shell">
          <div className="mx-auto max-w-measure-wide">
            <GuideTrail
              trail={[
                { href: '/', label: 'Home' },
                { href: '/guides', label: 'Guides' },
                { label: article.title },
              ]}
            />
            <div className="mb-l">
              <Eyebrow size="sm" tone="primary">
                By {article.authorName} | Published{' '}
                <time dateTime={article.publishedDate}>{publishedDate}</time>
              </Eyebrow>
            </div>
            <article
              className={cn('prose-article', styles.article)}
              dangerouslySetInnerHTML={{ __html: article.html }}
            />
            <div className="mt-2xl border-t border-border-default pt-xl">
              <Link
                href="/guides"
                className="text-body font-strong text-text-action hover:underline"
              >
                ← All guides
              </Link>
            </div>
          </div>
        </div>
      </section>

      <GuideCta kind={GUIDE_CTA[article.slug] ?? 'website'} />
    </>
  );
}
