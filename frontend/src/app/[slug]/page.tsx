import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { GuideAuthorBio, GuideByline } from '@/app/guides/_components/GuideAuthor';
import { GuideCards } from '@/app/guides/_components/GuideCards';
import { GuideContents } from '@/app/guides/_components/GuideContents';
import { GuideCta, type GuideCtaKind } from '@/app/guides/_components/GuideCta';
import { GuideOffer, type GuideOfferKind } from '@/app/guides/_components/GuideOffer';
import { guideCards, guideView, type GuideView } from '@/app/guides/_lib/guideView';
import { GuideTrail } from '@/components/marketing/GuideHero';
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

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Australia/Perth',
});

const formatDate = (date: string) => dateFormatter.format(new Date(`${date}T00:00:00+08:00`));

/** The hero's picture: the guide's own, or the plain card until it has one. */
function GuidePicture({ image }: { image: string | null }) {
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={1536}
        height={1024}
        preload
        sizes="(min-width: 1024px) 45vw, 100vw"
        className="aspect-[3/2] h-auto w-full rounded-lg border border-border-default object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex aspect-[3/2] w-full items-center justify-center rounded-lg border border-border-default bg-surface-page"
    >
      <BookOpen className="size-[72px] text-text-action" strokeWidth={1.25} />
    </span>
  );
}

/**
 * A guide: the heading, its tag, date, reading time and author beside its picture; then the summary, the sections
 * listed beside the text, the box after the first section, who wrote it, and related guides as cards.
 */
function ArticleView({ article, settings }: { article: Article; settings: PublicSiteSettings }) {
  const guide: GuideView = guideView(article);
  const [opening, rest] = splitAfterFirstSection(guide.html);
  const kind = GUIDE_CTA[article.slug] ?? 'website';
  const updated = guide.lastModified !== guide.publishedDate;

  return (
    <>
      <section className="bg-surface-tint">
        <div className="site-shell grid gap-2xl pt-xl pb-section-half lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:pt-section-half">
          <div>
            <GuideTrail
              trail={[
                { href: '/', label: 'Home' },
                { href: '/guides', label: 'Guides' },
                { label: article.title },
              ]}
            />
            <h1 className="m-0 text-title leading-[1.08] font-heavy tracking-[-0.045em] text-text-primary sm:text-display">
              {guide.heading}
            </h1>
            <p className="m-0 mt-l flex flex-wrap items-center gap-x-s gap-y-xs text-body-sm text-text-muted">
              <span className="rounded-xs border border-border-default bg-surface-page px-xs py-3xs font-strong text-text-action">
                {TOPIC[kind]}
              </span>
              <span>
                {updated ? 'Updated ' : ''}
                <time dateTime={guide.lastModified}>{formatDate(guide.lastModified)}</time>
              </span>
              <span aria-hidden="true">·</span>
              <span>{guide.readMinutes} min read</span>
            </p>
            <GuideByline />
          </div>
          <GuidePicture image={guide.image} />
        </div>
      </section>

      <section className="bg-surface-page py-section-half">
        <div className="site-shell grid gap-xl lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-2xl">
          <aside className="lg:order-none">
            <div className="lg:sticky lg:top-[calc(var(--header-height-lg)+var(--space-l))]">
              <GuideContents sections={guide.sections} />
            </div>
          </aside>
          <div className="min-w-0 max-w-measure-wide">
            <p className="m-0 text-lead leading-relaxed font-strong text-text-primary">
              {article.excerpt}
            </p>
            {guide.takeaways.length > 0 && (
              <div className="mt-xl rounded-md border-2 border-action-primary p-l sm:p-xl">
                <p className="m-0 text-label font-heavy tracking-label text-text-action uppercase">
                  The short answer
                </p>
                <ul className="m-0 mt-s flex list-none flex-col gap-s p-0">
                  {guide.takeaways.map((point) => (
                    <li
                      key={point}
                      className="flex gap-s text-body leading-relaxed text-text-secondary"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-xs size-[8px] shrink-0 rounded-circle bg-action-primary"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Two prose blocks with the box between them, outside the prose rules. */}
            <article className="mt-xl">
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
            <GuideAuthorBio />
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

      <GuideCards path={`/${article.slug}`} guides={guideCards()} />
      <GuideCta kind={kind} discoveryTotal={servicePrices(settings).discoveryTotal} />
    </>
  );
}
