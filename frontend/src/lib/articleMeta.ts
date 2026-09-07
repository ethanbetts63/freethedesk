export interface ArticlePageMeta {
  title: string;
  description: string;
  publishedDate: string;
}

/**
 * Search and listing copy for each guide. The key must match the markdown
 * filename in content/articles (without the .md extension).
 */
const metaBySlug: Record<string, ArticlePageMeta> = {};

export function getArticlePageMeta(slug: string): ArticlePageMeta | null {
  return metaBySlug[slug] ?? null;
}
