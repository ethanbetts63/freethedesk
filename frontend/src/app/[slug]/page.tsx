import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { GuideCta, type GuideCtaKind } from '@/app/guides/_components/GuideCta';
import { GUIDE_PLACEHOLDER } from '@/app/guides/_components/guideIcons';
import { GuideOffer, type GuideOfferKind } from '@/app/guides/_components/GuideOffer';
import { GuideArticle } from '@/components/guides/GuideArticle';
import { RelatedPages } from '@/components/marketing/RelatedPages';
import StructuredDataScript from '@/components/seo/StructuredDataScript';
import type { PublicSiteSettings } from '@/lib/api';
import { getAllArticleSlugs, getArticleBySlug, type Article } from '@/lib/articles';
import { guideView } from '@/lib/guideView';
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  buildMetadata,
} from '@/lib/seo';
import { getSiteSettingsServer, SERVICE_PRICE_FIELDS } from '@/lib/serverApi';
import { servicePrices } from '@/lib/servicePricing';

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
  'seo-cost-perth': 'seo',
  'website-cost-perth': 'website',
  'what-to-automate-in-a-small-business': 'automation',
};

/** The tag in a guide's hero: the line of the business it ends on. */
const TOPIC: Record<GuideCtaKind, string> = {
  seo: 'SEO',
  website: 'Websites',
  licensing: 'Licensing',
  automation: 'Automation',
};

/**
 * Which service a guide's opening box offers. Anything not listed offers websites.
 * The cost guides put their price table in the first section, so the box is the button under it.
 */
const GUIDE_OFFER: Record<string, GuideOfferKind> = {
  'business-not-showing-up-on-google': 'seo',
  'dealer-online-wa': 'licensing',
  'how-to-show-up-in-ai-search': 'seo',
  'seo-cost-perth': 'seoAudits',
  'website-cost-perth': 'website',
  'what-to-automate-in-a-small-business': 'automation',
  'wordpress-website-cost-perth': 'redesign',
};

const OFFER_PRICE_FIELDS = [
  ...SERVICE_PRICE_FIELDS,
  'seo_essentials_price',
  'seo_plus_price',
  'seo_complete_price',
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

/**
 * A guide, in the shared layout (`components/guides`): the box after the first section, then the related pages as
 * cards and the CTA for the line of business the guide ends on.
 */
function ArticleView({ article, settings }: { article: Article; settings: PublicSiteSettings }) {
  const guide = guideView(article);
  const [opening, rest] = splitAfterFirstSection(guide.html);
  const kind = GUIDE_CTA[article.slug] ?? 'website';

  return (
    <>
      <GuideArticle
        guide={guide}
        trail={[
          { href: '/', label: 'Home' },
          { href: '/guides', label: 'Guides' },
          { label: article.title },
        ]}
        tag={TOPIC[kind]}
        placeholder={GUIDE_PLACEHOLDER}
        backLink={{ href: '/guides', label: '← All guides' }}
      >
        {/* Two prose blocks with the box between them, outside the prose rules. */}
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
      </GuideArticle>

      <RelatedPages path={`/${article.slug}`} />
      <GuideCta kind={kind} discoveryTotal={servicePrices(settings).discoveryTotal} />
    </>
  );
}
