import { PUBLIC_SITE_URL } from '@/lib/siteConfig';

/**
 * robots.txt as a text route rather than Next's typed `robots.ts`.
 *
 * `MetadataRoute.Robots` can only emit directives, and the llms.txt pointer has
 * to be a comment — robots.txt has no directive for it, so every consumer that
 * looks for one reads it out of a comment line. The rules themselves stay in a
 * typed object so they are still checkable; only the serialisation is ours.
 */

interface RobotsGroup {
  userAgents: string[];
  allow: string[];
  disallow: string[];
}

/**
 * The signed-in application and the API proxy.
 *
 * These are the same trees `isApplicationRoute` and the Clarity exclusions in
 * `lib/routePolicy.ts` already treat as private. Every one of them is behind
 * auth, so a crawler gets a login redirect rather than content — but a
 * disallowed URL is one Google will not spend crawl budget on, and one it will
 * not surface as a bare title in results either.
 */
const DISALLOWED_ROUTES = [
  '/api/',
  '/dashboard/',
  '/portal/',
  '/seo-portal/',
  '/login',
  '/licensing/payment',
  '/seo/payment',
];

const GROUPS: RobotsGroup[] = [
  {
    userAgents: ['*'],
    allow: ['/'],
    disallow: DISALLOWED_ROUTES,
  },
  {
    // Answer engines are welcome on the marketing pages, case studies and
    // guides — being cited is most of the point of publishing them — with the
    // same private trees excluded.
    userAgents: ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'anthropic-ai', 'CCBot'],
    allow: ['/'],
    disallow: DISALLOWED_ROUTES,
  },
];

function renderGroup(group: RobotsGroup): string {
  return [
    ...group.userAgents.map((agent) => `User-Agent: ${agent}`),
    ...group.allow.map((path) => `Allow: ${path}`),
    ...group.disallow.map((path) => `Disallow: ${path}`),
  ].join('\n');
}

function renderRobotsTxt(): string {
  return `${[
    ...GROUPS.map(renderGroup),
    [
      `Sitemap: ${PUBLIC_SITE_URL}/sitemap.xml`,
      // Not a directive — no crawler acts on this line. It is a signpost for
      // anyone reading robots.txt to find the site summary at its well-known path.
      `# llms.txt: ${PUBLIC_SITE_URL}/llms.txt`,
    ].join('\n'),
  ].join('\n\n')}\n`;
}

// Nothing here reads the request, so the body is built once at build time.
export const dynamic = 'force-static';

export function GET(): Response {
  return new Response(renderRobotsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
