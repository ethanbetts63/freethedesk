import { SITE_URL } from '@/lib/siteConfig';

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
  '/api',
  // Every entry is the BARE prefix, never the trailing-slash form. Robots
  // rules are prefixes, so '/dashboard' already covers '/dashboard/' and
  // everything under it, while '/dashboard/' does NOT cover the exact path
  // '/dashboard' - the gap allbikes shipped with. See seo-standard.md
  // section 4.
  '/dashboard',
  '/portal',
  '/seo-portal',
  // Customer sale pages. Not private in the sign-in sense - access is a
  // capability carried in a link - which is exactly why a crawler has to be
  // told to stay away rather than left to find one in a forwarded email.
  '/sale',
  '/login',
  // Session plumbing, not pages. A reset link is single use and account
  // specific, so a crawler following one would only spend it.
  '/change-password',
  '/reset-password',
  '/licensing/payment',
  '/seo/payment',
];

const AI_USER_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'CCBot',
];

/**
 * Answer engines roam the whole site. They are not spending Google's crawl
 * budget, and a portal login costs them one wasted fetch and nothing else - so
 * the `*` list's reasons do not transfer, and being cited on the marketing
 * pages, case studies and guides is most of the point of publishing them.
 *
 * Only capability URLs survive that argument. Access to a /sale link or a
 * password reset IS the secrecy of the link: fetching one can spend a
 * single-use token, and what is behind it is a named customer's transaction.
 * That belongs in no training corpus and no answer engine's cache, and unlike
 * crawl budget the harm does not undo itself.
 *
 * `DISALLOWED_ROUTES` above stays the authoritative list for everything that
 * is not robots.txt - check-indexation-ledger.mjs resolves state 4 from it
 * alone.
 */
const AI_DISALLOWED_ROUTES = ['/api', '/sale', '/reset-password'];

const GROUPS: RobotsGroup[] = [
  {
    userAgents: ['*'],
    allow: ['/'],
    disallow: DISALLOWED_ROUTES,
  },
  {
    userAgents: AI_USER_AGENTS,
    allow: ['/'],
    disallow: AI_DISALLOWED_ROUTES,
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
      `Sitemap: ${SITE_URL}/sitemap.xml`,
      // Not a directive — no crawler acts on this line. It is a signpost for
      // anyone reading robots.txt to find the site summary at its well-known path.
      `# llms.txt: ${SITE_URL}/llms.txt`,
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
