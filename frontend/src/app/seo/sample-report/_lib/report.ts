/**
 * The sample report's content. The business, its address, its site and every
 * figure here are invented: Wattle & Wrench Plumbing does not exist, the
 * domain uses the reserved `.example` suffix, and the phone number is from
 * the range ACMA sets aside for fiction. What is real is the shape: the kinds
 * of recommendation, the experiment, the foundation checks and the way the
 * analysis explains a month, all modelled on delivered reports. No client's
 * figures, names or documents are used.
 *
 * The daily series below were generated once and fixed, so the headline
 * figures on the cover are computed from them rather than typed beside them.
 */

export const BUSINESS = {
  name: 'Wattle & Wrench',
  fullName: 'Wattle & Wrench Plumbing',
  host: 'www.wattleandwrench.example',
  phone: '(08) 5550 0142',
  version: 'r4',
  period: '1 September 2026 to 30 September 2026 (30 days)',
} as const;

export type Direction = 'better' | 'worse';

export type Highlight = { value: string; unit?: string; direction: Direction; label: string };

/** The four cover readings, against 2 August to 31 August 2026. */
export const HIGHLIGHTS: readonly Highlight[] = [
  { value: '+37%', direction: 'better', label: 'Clicks' },
  { value: '+21%', direction: 'better', label: 'Impressions' },
  { value: '+0.34', unit: 'pts', direction: 'better', label: 'Click-through rate' },
  { value: '−3.1', direction: 'better', label: 'Average position' },
];

export type Impact = 'high' | 'medium' | 'low';
export type Cost = 'low' | 'medium' | 'high';

export type Recommendation = {
  title: string;
  impact: Impact;
  cost: Cost;
  what: string;
  why: string;
  how: readonly string[];
};

export const RECOMMENDATIONS: readonly Recommendation[] = [
  {
    title: 'Make the phone number in the header tap to call on every page',
    impact: 'high',
    cost: 'low',
    what: 'On a phone the header shows the logo and a menu button. The number sits inside the menu as plain text, and the only number that dials when tapped is in the footer, below the reviews.',
    why: 'Seven in ten visitors from Google arrive on a phone, and someone with water coming through the ceiling wants to ring, not fill in a form. A caller who has to open a menu and copy a number is a caller who goes back to the results and rings the next plumber.',
    how: [
      `Put a 'Call ${BUSINESS.phone}' button in the phone header, visible without opening the menu.`,
      'Make every printed number dial when tapped, including the contact page and the quote form’s thank-you message.',
      'Use the same number everywhere: the site, the Business Profile and the directory listings.',
    ],
  },
  {
    title: 'Lead the blocked drains page with its price and a same-day promise',
    impact: 'high',
    cost: 'low',
    what: "Google shows the blocked drains page more than any other page on the site, near the top of the first page, but few of the people shown it click. Its description in the results is the year the business started, and the page opens on a stock photo and the company's history.",
    why: "The two plumbers above it both lead with a call-out price and 'same day'. A searcher with a drain backing up is choosing on speed and price, and this result answers neither. The hot water page made the same change in September and drew twice the clicks.",
    how: [
      "Open the page with one line such as 'Blocked drains cleared from $180, call-out included, same day across the northern suburbs', kept to your current price.",
      'Rewrite the page title and description to carry the price and the words same day.',
      'Move the history of the business to the about page.',
    ],
  },
  {
    title: 'Fold the six suburb pages into the service pages they copy',
    impact: 'medium',
    cost: 'medium',
    what: 'Six pages, one for each suburb from Joondalup to Scarborough, carry the same text with the suburb name swapped. Google showed four of them for nothing in September, and the other two compete with the blocked drains page for the same searches.',
    why: 'Pages that differ only by a place name read to Google as one page said six times. They split the standing that one strong page would hold, and the two that are shown take clicks the blocked drains page would earn with a price on it.',
    how: [
      'Redirect each suburb page permanently to the service page it repeats.',
      'Keep one list of the suburbs you cover on the contact page, with any travel charge beside it.',
      'Take the six old addresses out of the sitemap.',
    ],
  },
  {
    title: 'Give the directory listings your current address and number',
    impact: 'medium',
    cost: 'low',
    what: 'Three directory listings still give the old Osborne Park workshop and a mobile number that is no longer answered. They are most of the outside links pointing at the site.',
    why: 'Google matches a business across the web by its name, address and phone. Listings that disagree with the site tell it there may be two businesses, and a customer who rings the old mobile reaches nobody.',
    how: [
      'Update the address and phone on Yellow Pages, True Local and Hotfrog to match the site exactly.',
      'Check the Business Profile carries the same number as the site header.',
    ],
  },
  {
    title: 'Reply to your Google reviews, starting with the three complaints',
    impact: 'medium',
    cost: 'low',
    what: 'The profile holds a 4.6 rating, and nobody from the business has replied to a review this year. Three one- and two-star reviews describe an arrival window that was missed, with no call to say so.',
    why: 'People compare plumbers on the map before they open a website. The praise repeats a fixed quote and a tidy job; the complaints repeat lateness, not the work. A short reply that says what changed is read by every later customer.',
    how: [
      'Reply to the three complaints first: say what happened and what you now do, such as a text when the plumber is on the way.',
      'Thank the most recent five-star reviewers by the job they mention.',
      'Add the profile’s review link to the job-complete text you send customers.',
    ],
  },
  {
    title: 'Count a call and a sent quote form as an enquiry in Google Analytics',
    impact: 'high',
    cost: 'low',
    what: 'Google Analytics records visits, but neither a tapped phone number nor a sent quote form counts as anything, and Google Search Console is not linked to it.',
    why: 'Until an enquiry is counted, a page or a search can only be judged by how many people saw it, not by the jobs it brought. With it, the next report can say which pages bring work.',
    how: [
      'Send an event when the quote form is sent and when a phone number is tapped, and mark both as key events in Google Analytics.',
      'Link the Search Console property to Google Analytics.',
      'If anything else on your site records data and you are happy for us to see it, add our account with view-only access.',
    ],
  },
];

/** Weeks ending Sunday; the change went live on Wednesday 9 September. */
export const EXPERIMENT = {
  title: 'The hot water page leads with its prices',
  what: "On 9 September the hot water page's title, description and opening line were rewritten to lead with 'Hot water repairs and replacements, from $1,490 installed', and the price table moved from the foot of the page to the top.",
  hypothesis:
    'If the hot water page shows a price in Google’s results and at the top of the page, more of the people shown it will click, because a searcher comparing plumbers is choosing on price before anything else.',
  label: 'Clicks a week from hot water searches',
  window:
    'Weekly, to 27 September 2026. The grey line is where this would be had it only followed the site-wide trend; the gap between the lines is what the change added.',
  weeks: ['16 Aug', '23 Aug', '30 Aug', '6 Sep', '13 Sep', '20 Sep', '27 Sep'],
  experiment: [6, 5, 7, 6, 9, 14, 17],
  adjusted: [6, 5, 7, 6, 7, 8, 8],
  /** 9 September, three-sevenths of the way from 6 September to 13 September. */
  shippedAt: 3 + 3 / 7,
  goal: 15,
  soFar:
    'In the two full weeks since the change, the page drew more than twice as many clicks a week from hot water searches as before it, and about twice what the site-wide rise alone would have given it. Its place in the results moved by less than one, so the gain is more of the people shown it choosing it. It passed the goal for the first time in the week to 27 September.',
  alongside:
    'The new reviews block on the homepage, which links the hot water page, may also be affecting progress towards the goal.',
} as const;

export type CheckState = 'pass' | 'warn' | 'fail';

export type Check = { id: string; state: CheckState; name: string; what?: string; why?: string };

export type CheckGroup = {
  id: string;
  question: string;
  meaning: string;
  checks: readonly Check[];
};

export const FOUNDATIONS: readonly CheckGroup[] = [
  {
    id: 'A',
    question: 'Is this one business?',
    meaning:
      'Whether a search engine can tell that the business, the map listing and the directories are all the same place.',
    checks: [
      { id: 'A1', state: 'pass', name: 'A name, address and phone can be read from the site' },
      { id: 'A2', state: 'pass', name: 'Exactly one Business Profile for the business' },
      {
        id: 'A3',
        state: 'warn',
        name: 'One phone number across the site, the profile and the listings',
        what: 'The site gives the landline; two listings give an old mobile.',
        why: 'Calls split across a number the business answers and one it does not.',
      },
      {
        id: 'A4',
        state: 'fail',
        name: 'The sites that link here carry the same name, address and phone',
        what: 'Three directory listings still give the old Osborne Park workshop.',
        why: 'They are most of the links pointing at the site, and they tell Google the business is somewhere it no longer is.',
      },
    ],
  },
  {
    id: 'D',
    question: 'Does the click survive?',
    meaning: 'Whether a visitor who arrives gets a page that loads, fits their screen and is safe.',
    checks: [
      {
        id: 'D1',
        state: 'warn',
        name: 'Pages load quickly on a phone',
        what: 'The homepage photo takes about four seconds to appear on a mid-range phone.',
        why: 'Someone with a burst pipe who waits on a blank screen goes back to the results.',
      },
      { id: 'D2', state: 'pass', name: 'Every page fits a phone screen, with no sideways scroll' },
      { id: 'D3', state: 'pass', name: 'A secure connection on every page' },
      { id: 'D4', state: 'pass', name: 'An address that does not exist says so' },
    ],
  },
  {
    id: 'E',
    question: 'Can any of this be judged by value?',
    meaning:
      'Whether anything on the site measures what a visit was worth, rather than only that it happened.',
    checks: [
      { id: 'E1', state: 'pass', name: 'Search Console and Google Analytics are both recording' },
      {
        id: 'E2',
        state: 'fail',
        name: 'At least one enquiry counts as a conversion',
        what: 'Neither a tapped phone number nor a sent quote form is counted.',
        why: 'No page or search can be judged by the jobs it brought, only by its visits.',
      },
    ],
  },
];

/** 3 July to 30 September 2026, one value a day; the reporting period is the last 30. */
export const DAILY_CLICKS = [
  6, 6, 5, 5, 4, 5, 7, 5, 6, 6, 9, 9, 5, 6, 5, 6, 5, 5, 8, 6, 7, 8, 4, 5, 8, 9, 6, 5, 5, 6, 7, 8, 7,
  9, 7, 5, 6, 7, 6, 4, 5, 5, 5, 5, 4, 7, 9, 6, 6, 10, 4, 5, 8, 5, 7, 11, 8, 7, 8, 11, 8, 6, 6, 7, 6,
  4, 6, 6, 11, 8, 9, 10, 8, 7, 10, 14, 7, 11, 9, 9, 15, 9, 9, 12, 10, 11, 12, 15, 10, 11,
] as const;

export const DAILY_IMPRESSIONS = [
  232, 182, 200, 260, 255, 228, 285, 238, 236, 202, 224, 243, 230, 284, 266, 200, 181, 237, 254,
  266, 244, 275, 213, 232, 243, 230, 280, 259, 273, 213, 197, 267, 256, 294, 272, 275, 239, 195,
  273, 257, 230, 282, 243, 236, 210, 299, 299, 264, 304, 246, 204, 222, 260, 274, 288, 301, 296,
  200, 251, 317, 301, 324, 272, 283, 220, 229, 307, 358, 289, 311, 290, 303, 264, 293, 311, 302,
  384, 304, 235, 315, 366, 333, 377, 379, 322, 324, 312, 383, 360, 310,
] as const;

/** Day indexes into the daily series: 1 August, 1 September and the first day of the period. */
export const DAILY_MONTHS = [
  { index: 29, label: 'Aug' },
  { index: 60, label: 'Sep' },
] as const;
export const PERIOD_START_INDEX = 60;

export type PairedRow = { label: string; now: number; before: number };

export const VISITORS_BY_LINE: readonly PairedRow[] = [
  { label: 'Homepage', now: 104, before: 82 },
  { label: 'Hot water', now: 58, before: 27 },
  { label: 'Blocked drains', now: 39, before: 40 },
  { label: 'Contact and quotes', now: 24, before: 20 },
  { label: 'Gas fitting', now: 21, before: 18 },
  { label: 'Suburb pages', now: 8, before: 12 },
];

export const PROFILE_MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep'] as const;
export const PROFILE_ACTIONS = {
  website: [72, 70, 81, 88, 104],
  calls: [38, 41, 44, 52, 61],
  directions: [12, 10, 14, 13, 15],
} as const;

export type Source = { source: string; status: 'present' | 'partial'; detail: string };

export const SOURCES: readonly Source[] = [
  {
    source: 'Google Search Console',
    status: 'present',
    detail: '1 September 2026 to 30 September 2026',
  },
  {
    source: 'Google Analytics',
    status: 'partial',
    detail: 'Visits recorded; no enquiry counts as a conversion.',
  },
  {
    source: 'Google Business Profile',
    status: 'partial',
    detail: 'Whole calendar months, May to September 2026.',
  },
  { source: 'PageSpeed Insights', status: 'present', detail: 'Read 3 October 2026' },
  { source: 'Foundations checks', status: 'present', detail: 'Read 3 October 2026' },
  {
    source: 'Live search results',
    status: 'present',
    detail: 'Desktop and phone results for 24 searches, read 3 October 2026',
  },
  {
    source: 'Google reviews, the business’s and its two nearest rivals’',
    status: 'present',
    detail: 'Read 3 October 2026',
  },
  {
    source: 'A walk of the public site on a phone',
    status: 'present',
    detail: 'Read 3 October 2026',
  },
  { source: 'Competitors’ sites', status: 'present', detail: 'Read 3 October 2026' },
];
