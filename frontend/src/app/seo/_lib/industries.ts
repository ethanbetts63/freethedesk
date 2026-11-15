import type { FaqItem } from '@/types/FaqItem';

/**
 * The industry SEO pages (owner, 2026-11-15): one page per group of businesses we've written
 * prospect reports for, each built on what those reports found. The audits sold are the /seo
 * page's, titled for the group.
 *
 * Every count is real. It is how many of the group's reports had that fault among the fixes
 * recommended. It was tallied on 2026-11-15 from the `fundamentals` each report's recommendations
 * cite (`ftp_search/_search/projects/<slug>/reports/<latest>/report.json`). The podcast and coaching
 * reports are left out: they were affiliate outreach, not this trade. Re-tally, and bump the
 * pages' `updated` dates, when more reports are in. A group with no reports gets no page, so no
 * page is the same template with another name.
 */

export type IndustryPath =
  '/seo/tradies' | '/seo/builders' | '/seo/health-clinics' | '/seo/professional-services';

type FindingId = keyof typeof FINDINGS;

export interface Industry {
  path: IndustryPath;
  /** As the headings say it: "tradies". */
  audience: string;
  heroLines: readonly string[];
  heroAccent: string;
  /** The kinds of business the reports were for, in plain words. */
  kinds: string;
  /** How many reports the counts are out of. */
  reports: number;
  /** The most common faults, most common first: how many of `reports` had each. */
  findings: readonly { id: FindingId; count: number }[];
  /** Questions this group asks, answered for it. */
  faqs: readonly FaqItem[];
}

/** Each fault in plain words: what we found, and why it costs work. */
export const FINDINGS = {
  'profile-link-tagged': {
    title: 'No way to tell which work came from Google',
    body: "The Business Profile's website link had no tracking tags, so the site's analytics couldn't separate the visits it sent from everything else.",
  },
  'profile-services-attributes': {
    title: 'Google listing services left blank',
    body: "The Business Profile's services and attributes were empty or thin, so Google had less to match a search to the listing.",
  },
  'service-area-set': {
    title: 'Service area not set to the suburbs served',
    body: "The listing's service area was missing, or set too wide or too narrow, instead of suburb by suburb.",
  },
  'question-headings': {
    title: "Customers' questions not answered on the page",
    body: 'The questions people type into Google weren’t headings with a straight answer underneath.',
  },
  'facts-visible-on-load': {
    title: 'Key facts hidden in tabs, sliders or pictures',
    body: 'Prices, areas or services only showed after a click, or sat inside images Google can’t read.',
  },
  'h1-matches-title': {
    title: 'Page heading and Google title saying different things',
    body: 'The main heading on the page and the title Google shows described different things, which muddies what the page is about.',
  },
  'headings-real-sections': {
    title: 'Headings used for looks, not structure',
    body: 'Headings made text bigger instead of marking the page’s sections, so the page was harder for Google to read.',
  },
  'profile-hours': {
    title: 'Wrong or missing hours on Google',
    body: "The listing's opening or holiday hours were missing, or didn't match the website.",
  },
  'titles-unique': {
    title: 'Pages sharing the same title',
    body: 'Several pages had the same title, so Google couldn’t tell them apart.',
  },
  'phone-tap-to-call': {
    title: 'A phone number you can’t tap',
    body: 'On a phone, the number couldn’t be tapped to call, or wasn’t written the local way.',
  },
  'page-per-service': {
    title: 'Several services squeezed onto one page',
    body: 'Main services shared one page instead of each having its own, so none could rank for its own search.',
  },
  'first-phone-screen': {
    title: 'The first phone screen doesn’t say what, where and how',
    body: 'On a phone, the first screen didn’t say what the business does, where, and how to get in touch.',
  },
  'first-hand-detail': {
    title: 'Pages that could belong to anyone',
    body: 'Pages gave the common answer without the first-hand detail that shows real experience.',
  },
  'profile-photos-own': {
    title: 'A logo instead of real photos',
    body: 'The Business Profile showed a logo or stock images, not the business’s own recent photos.',
  },
} as const;

export const INDUSTRIES: Record<IndustryPath, Industry> = {
  '/seo/tradies': {
    path: '/seo/tradies',
    audience: 'tradies',
    heroLines: ['SEO for tradies in Perth:'],
    heroAccent: 'what we keep finding.',
    kinds:
      'plumbers, electricians, locksmiths, roofers, pest controllers, air conditioning installers, landscapers, tree services, cleaners and solar and insulation installers',
    reports: 22,
    findings: [
      { id: 'profile-link-tagged', count: 13 },
      { id: 'profile-services-attributes', count: 12 },
      { id: 'service-area-set', count: 9 },
      { id: 'question-headings', count: 9 },
      { id: 'facts-visible-on-load', count: 9 },
      { id: 'h1-matches-title', count: 9 },
    ],
    faqs: [
      {
        question: 'Do you do SEO for plumbers, electricians and other trades?',
        answer:
          'Yes. Most of the reports we write are for Perth trades: plumbers, electricians, locksmiths, roofers, pest control, air conditioning and more. A trade lives or dies on Google Maps and on searches like "plumber near me", and every audit reads both.',
      },
      {
        question: 'Why does my trade business not show up on Google Maps?',
        answer:
          "Usually the Business Profile. In more than half the trade reports we've written, the listing's services were left blank, and in nine of twenty-two its service area wasn't set to the suburbs served. Both are quick to fix, and the Plus audit checks the profile line by line.",
      },
    ],
  },
  '/seo/builders': {
    path: '/seo/builders',
    audience: 'builders and renovators',
    heroLines: ['SEO for builders and', 'renovators in Perth:'],
    heroAccent: 'what we keep finding.',
    kinds: 'patio builders, cabinet makers, builders, flooring stores and window furnishers',
    reports: 8,
    findings: [
      { id: 'h1-matches-title', count: 8 },
      { id: 'profile-link-tagged', count: 7 },
      { id: 'headings-real-sections', count: 7 },
      { id: 'profile-services-attributes', count: 6 },
      { id: 'service-area-set', count: 6 },
      { id: 'profile-hours', count: 6 },
    ],
    faqs: [
      {
        question: 'Do you do SEO for builders, cabinet makers and renovators?',
        answer:
          'Yes. We have written reports for Perth patio builders, cabinet makers, builders, flooring stores and window furnishers. A job in this line is worth a lot, so ranking for a handful of searches like "patio builder Perth" can pay for an audit many times over.',
      },
      {
        question: 'What holds most building and renovation websites back?',
        answer:
          'In every one of the eight reports we wrote for this line of work, the page heading and the title Google shows described different things. In seven, headings were used for looks instead of marking the sections. Both are cheap to fix and every audit checks them.',
      },
    ],
  },
  '/seo/health-clinics': {
    path: '/seo/health-clinics',
    audience: 'health clinics',
    heroLines: ['SEO for health clinics', 'in Perth:'],
    heroAccent: 'what we keep finding.',
    kinds: 'physiotherapists, podiatrists, chiropractors and skin and laser clinics',
    reports: 6,
    findings: [
      { id: 'profile-services-attributes', count: 4 },
      { id: 'h1-matches-title', count: 3 },
      { id: 'titles-unique', count: 2 },
      { id: 'facts-visible-on-load', count: 2 },
      { id: 'phone-tap-to-call', count: 2 },
      { id: 'page-per-service', count: 2 },
    ],
    faqs: [
      {
        question: 'Do you do SEO for physios, podiatrists and other clinics?',
        answer:
          'Yes. We have written reports for Perth physiotherapists, podiatrists, chiropractors and skin and laser clinics. Most new patients search with a suburb or "near me", so the Business Profile and a page for each treatment matter most.',
      },
      {
        question: 'What holds most clinic websites back?',
        answer:
          "The Business Profile, most often: in four of the six clinic reports we've written, its services and attributes were left blank. Next came pages whose heading and Google title disagreed, and treatments sharing one page instead of each having its own.",
      },
    ],
  },
  '/seo/professional-services': {
    path: '/seo/professional-services',
    audience: 'professional services',
    heroLines: ['SEO for professional', 'services in Perth:'],
    heroAccent: 'what we keep finding.',
    kinds: 'family lawyers, law firms and an insurance broker',
    reports: 6,
    findings: [
      { id: 'h1-matches-title', count: 5 },
      { id: 'profile-link-tagged', count: 4 },
      { id: 'first-phone-screen', count: 4 },
      { id: 'first-hand-detail', count: 3 },
      { id: 'profile-hours', count: 3 },
      { id: 'profile-photos-own', count: 3 },
    ],
    faqs: [
      {
        question: 'Do you do SEO for lawyers and other professional firms?',
        answer:
          'Yes. We have written reports for Perth family lawyers, law firms and an insurance broker. A client choosing a firm reads more before they call, so pages that show first-hand experience and a phone screen that says how to get in touch count for more than in most trades.',
      },
      {
        question: 'What holds most professional firm websites back?',
        answer:
          "In five of the six reports we've written for professional firms, the page heading and the title Google shows described different things. In four, the first screen on a phone didn't say what the firm does, where, and how to contact it.",
      },
    ],
  },
};

export const INDUSTRY_PATHS = Object.keys(INDUSTRIES) as IndustryPath[];
