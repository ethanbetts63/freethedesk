import type { MetadataRoute } from 'next';

import { getAllArticleMeta } from '@/lib/articles';
import { STATIC_PAGES } from '@/lib/pages';
import { absoluteUrl } from '@/lib/seo';

/**
 * Every registry route, plus every article.
 *
 * There is no filter here any more. Inclusion used to depend on a page
 * carrying an optional `sitemap` field, which made forgetting that field the
 * way a page left the sitemap — indistinguishable from a deliberate decision,
 * and the one mechanism seo-standard.md section 2 forbids. Being in STATIC_PAGES is
 * now what "listed" means; anything deliberately unlisted goes in an explicit
 * bucket instead.
 *
 * No `changeFrequency` and no `priority`: Google has ignored both for years,
 * and they were the reason that optional object existed.
 *
 * URLs come from `absoluteUrl`, the same helper the canonical tag uses, so
 * the homepage cannot be `{SITE_URL}` here and `{SITE_URL}/` in the <head>.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = Object.entries(STATIC_PAGES).map(
    ([path, page]): MetadataRoute.Sitemap[number] => ({
      url: absoluteUrl(path),
      /**
       * The registry's own `updated` date, not the build time.
       *
       * Build time meant every redeploy announced that all the static pages
       * had changed, which is the fastest way to teach Google to ignore every
       * date in the file. `updated` is a required field, so every page carries
       * a real one; keeping it real is a maintenance obligation, not something
       * the code can derive.
       */
      lastModified: new Date(`${page.updated}T00:00:00+08:00`),
    }),
  );

  const articlePages = getAllArticleMeta().map((article): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(`/${article.slug}`),
    lastModified: new Date(`${article.lastModified}T00:00:00+08:00`),
  }));

  return [...staticPages, ...articlePages];
}
