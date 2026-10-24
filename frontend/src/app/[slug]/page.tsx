import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Eyebrow from '@/components/common/eyebrow';
import { GuideCta, type GuideCtaKind } from '@/app/guides/_components/GuideCta';
import { GuideOffer, type GuideOfferKind } from '@/app/guides/_components/GuideOffer';
import { GuideHero, GuideTrail } from '@/components/marketing/GuideHero';
import StructuredDataScript from '@/components/seo/StructuredDataScript';
import type { PublicSiteSettings } from '@/lib/api';
import { getAllArticleSlugs, getArticleBySlug, type Article } from '@/lib/articles';
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  buildMetadata,
} from '@/lib/seo';
import { getSiteSettingsServer, SERVICE_PRICE_FIELDS } from '@/lib/serverApi';

// Uncontrolled rich content: the markup comes from the article body, so the
// rules cannot be put on elements by hand.
// eslint-disable-next-line no-restricted-imports -- approved exception
import styles from './article.module.css';
import { cn } from '@/lib/utils';

export const dynamicParams = false;

/* The box after the first section quotes the admin's prices, so a guide renders per request. */
export const dynamic = 'force-dynamic';

/**
 * Which service each guide ends on. A guide about being found ends on SEO;
 * anything else ends on websites. Add a new guide here when it is about search.
 */
const GUIDE_CTA: Record<string, GuideCtaKind> = {
  'business-not-showing-up-on-google': 'seo',
  'dealer-online-wa': 'licensing',
  'how-to-show-up-in-ai-search': 'seo',
};

/** Which service a guide's opening box offers. Anything not listed offers websites. */
const GUIDE_OFFER: Record<string, GuideOfferKind> = {
  'business-not-showing-up-on-google': 'seo',
  'dealer-online-wa': 'licensing',
  'how-to-show-up-in-ai-search': 'seo',
  'what-to-automate-in-a-small-business': 'automation',
  'wordpress-website-cost-perth': 'redesign',
};

const OFFER_PRICE_FIELDS = [
  ...SERVICE_PRICE_FIELDS,
  'seo_monthly_price',
  'seo_quarterly_price',
  'seo_yearly_price',
  'seo_oneoff_price',
  'licensing_price',
] as const;

/** The guide's html cut after its first section: before its second `<h2>`, or whole if it has none. */
function splitAfterFirstSection(html: string): [string, string] {
  const first = html.indexOf('<h2');
  const second = first === -1 ? -1 : html.indexOf('<h2', first + 3);
  return second === -1 ? [html, ''] : [html.slice(0, second), html.slice(second)];
}

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

  const settings = await getSiteSettingsServer(OFFER_PRICE_FIELDS);

  return (
    <main>
      <StructuredDataScript structuredData={structuredData} />
      <ArticleView article={article} settings={settings} />
    </main>
  );
}

function ArticleView({ article, settings }: { article: Article; settings: PublicSiteSettings }) {
  const [opening, rest] = splitAfterFirstSection(article.html);

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
            {/* Two prose blocks with the box between them, outside the prose rules. */}
            <article>
              <div
                className={cn('prose-article', styles.article)}
                dangerouslySetInnerHTML={{ __html: opening }}
              />
              <GuideOffer kind={GUIDE_OFFER[article.slug] ?? 'website'} settings={settings} />
              {rest && (
                <div
                  className={cn('prose-article', styles.article)}
                  dangerouslySetInnerHTML={{ __html: rest }}
                />
              )}
            </article>
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
