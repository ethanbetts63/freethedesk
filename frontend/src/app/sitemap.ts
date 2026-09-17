import type { MetadataRoute } from 'next';

import { getAllArticleMeta } from '@/lib/articles';
import { PAGES } from '@/lib/pages';
import { PUBLIC_SITE_URL } from '@/lib/siteConfig';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = Object.entries(PAGES)
    .filter(([, page]) => page.sitemap)
    .map(([path, page]): MetadataRoute.Sitemap[number] => ({
      url: `${PUBLIC_SITE_URL}${path === '/' ? '' : path}`,
      /**
       * The registry's own `updated` date, not the build time.
       *
       * Build time meant every redeploy announced that all thirteen static
       * pages had changed, which is the fastest way to teach Google to ignore
       * every date in the file. `updated` is a required field, so every page
       * carries a real one; keeping it real is a maintenance obligation, not
       * something the code can derive.
       */
      lastModified: new Date(`${page.updated}T00:00:00+08:00`),
      changeFrequency: page.sitemap!.changeFrequency,
      priority: page.sitemap!.priority,
    }));

  const articlePages = getAllArticleMeta().map((article) => ({
    url: `${PUBLIC_SITE_URL}/${article.slug}`,
    lastModified: new Date(`${article.lastModified}T00:00:00+08:00`),
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }));

  return [...staticPages, ...articlePages];
}
