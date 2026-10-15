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
    title: 'Say on the quote form how soon you reply, and confirm every request',
    impact: 'medium',
    cost: 'low',
    what: "The quote form ends on 'Thanks, we'll be in touch' and sends the customer nothing. The contact page promises a call back 'within the hour', the footer says 'same business day', and the form says neither.",
    why: 'Someone who asked two plumbers for a quote rings the one who answers first. A customer told nothing waits, then asks someone else; one promise, kept, sets the wait they expect.',
    how: [
      "Choose one promise, such as 'We call back within two working hours', and use it on the form, the contact page and the footer.",
      'Send the customer an email or a text when the form is sent, repeating that promise and the number to ring if it is urgent.',
      'Send a test request from a phone and check the alert reaches whoever answers quotes.',
    ],
  },
  {
    title: 'Name your licence numbers and show recent jobs on each service page',
    impact: 'medium',
    cost: 'high',
    what: 'No page gives a plumbing or gas licence number, says the work is insured, or shows a job the business has done. The three plumbers most often ranked beside the site each show all three.',
    why: 'A customer letting a stranger into the house to work on gas or hot water looks for proof before price. A page with none reads as the riskier choice, however good the reviews are.',
    how: [
      'Put your plumbing and gas fitting licence numbers, and that the work is insured, under the heading of the hot water, gas fitting and blocked drains pages.',
      'Add two or three recent jobs to each of those pages: a photo, the suburb, what was wrong and what was done.',
      'Ask the customers behind your best reviews whether you may quote them beside their job.',
    ],
  },
  {
    title: 'Make the homepage photo smaller, so the page appears quickly on a phone',
    impact: 'low',
    cost: 'low',
    what: 'The photo at the top of the homepage is a large camera original, sent whole to every phone. On a mid-range phone it takes about four seconds to appear, and the heading waits for it.',
    why: 'Most visitors arrive on a phone, often in a hurry. A blank screen for four seconds is long enough for some of them to go back and ring the next result.',
    how: [
      'Save the photo at the width it is shown, in a modern format such as WebP, so it is a fraction of its size.',
      'Let the heading and the call button show before the photo, not after it.',
    ],
  },
  {
    title: 'List every service on the Business Profile, and post a recent job each month',
    impact: 'low',
    cost: 'low',
    what: "The profile lists three services, all under 'Plumber', and has never had a post. Its photos are all of the vans.",
    why: 'The searches that show the profile most are for hot water and blocked drains, ahead of the business name. A searcher who opens it finds nothing about either job, and no sign the business is busy.',
    how: [
      'Add hot water repairs and installs, blocked drains, gas fitting, leak detection and emergency call-outs as services, each with a one-line description.',
      'Post one recent job a month with a photo and the suburb, linking the page that sells that job.',
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

export type Experiment = {
  title: string;
  what: string;
  hypothesis: string;
  label: string;
  window: string;
  /** The day it went live, as the chart's description says it. */
  shipped: string;
  /** Where the change went live, as an index into the weeks (a fraction falls between two). */
  shippedAt: number;
  experiment: readonly number[];
  adjusted: readonly number[];
  goal: number;
  axis: { title: string; min: number; max: number; ticks: readonly number[]; invert?: boolean };
  soFar: string;
  alongside: string;
};

/** Weeks ending Sunday, 16 August to 27 September 2026. */
export const EXPERIMENT_WEEKS = [
  '16 Aug',
  '23 Aug',
  '30 Aug',
  '6 Sep',
  '13 Sep',
  '20 Sep',
  '27 Sep',
] as const;

const TREND_NOTE =
  'The grey line is where this would be had it only followed the site-wide trend; the gap between the lines is what the change added.';

export const EXPERIMENTS: readonly Experiment[] = [
  {
    title: 'The hot water page leads with its prices',
    what: "On 9 September the hot water page's title, description and opening line were rewritten to lead with 'Hot water repairs and replacements, from $1,490 installed', and the price table moved from the foot of the page to the top.",
    hypothesis:
      'If the hot water page shows a price in Google’s results and at the top of the page, more of the people shown it will click, because a searcher comparing plumbers is choosing on price before anything else.',
    label: 'Clicks a week from hot water searches',
    window: `Weekly, to 27 September 2026. ${TREND_NOTE}`,
    shipped: '9 September',
    // Wednesday 9 September, three-sevenths of the way from 6 to 13 September.
    shippedAt: 3 + 3 / 7,
    experiment: [6, 5, 7, 6, 9, 14, 17],
    adjusted: [6, 5, 7, 6, 7, 8, 8],
    goal: 15,
    axis: { title: 'Clicks a week', min: 0, max: 20, ticks: [0, 5, 10, 15, 20] },
    soFar:
      'In the two full weeks since the change, the page drew more than twice as many clicks a week from hot water searches as before it, and about twice what the site-wide rise alone would have given it. Its place in the results moved by less than one, so the gain is more of the people shown it choosing it. It passed the goal for the first time in the week to 27 September.',
    alongside:
      'The new reviews block on the homepage, which links the hot water page, may also be affecting progress towards the goal.',
  },
  {
    title: 'The gas fitting page names the jobs people search for',
    what: "On 16 September the gas fitting page's title changed from 'Gas Services' to 'Gas Fitter Perth: Leaks, Cooktops and Heater Installs', its description was rewritten to name the same three jobs, and each job got a heading of its own on the page.",
    hypothesis:
      'If the title and headings use the words people search with, Google will rank the page higher for gas fitter searches, because today nothing on it says which jobs it covers.',
    label: 'Where the gas fitting page ranks on gas searches',
    window: `Weekly, to 27 September 2026; first place is at the top. ${TREND_NOTE}`,
    shipped: '16 September',
    // Wednesday 16 September, three-sevenths of the way from 13 to 20 September.
    shippedAt: 4 + 3 / 7,
    experiment: [24, 25, 23, 24, 22, 17, 13],
    adjusted: [24, 25, 23, 24, 22, 21, 21],
    goal: 10,
    axis: { title: 'Average position', min: 1, max: 30, ticks: [1, 10, 20, 30], invert: true },
    soFar:
      'In the week and a half since the change, the page climbed from about 23rd on gas searches to about 13th in the week to 27 September, against about 21st had it only followed the rest of the site. Thirteenth is near the top of the second page, where few people look, so it has not yet brought more clicks; the goal is the first page.',
    alongside:
      'The hot water page’s rewrite a week earlier, which also changed the links between the two pages, may also be affecting progress towards the goal.',
  },
];

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
      {
        id: 'A1',
        state: 'pass',
        name: 'A canonical name, address and phone are derivable from the site',
      },
      { id: 'A2', state: 'pass', name: 'Site NAP matches the Business Profile exactly' },
      { id: 'A3', state: 'pass', name: 'Exactly one Business Profile for the premises' },
      {
        id: 'A4',
        state: 'fail',
        name: 'Referring domains carry the same name, address and phone',
        what: 'Three directory listings still give the old Osborne Park workshop.',
        why: 'They are most of the links pointing at the site, and they tell Google the business is somewhere it no longer is.',
      },
      {
        id: 'A5',
        state: 'warn',
        name: 'One phone number across site, profile and citations',
        what: 'The site and the profile give the landline; two listings give an old mobile.',
        why: 'Calls split across a number the business answers and one it does not.',
      },
    ],
  },
  {
    id: 'B',
    question: 'Can Google reach it and agree with it?',
    meaning:
      'Whether every page can be crawled, indexed, and reached at one address the site and Google both agree on.',
    checks: [
      { id: 'B1', state: 'pass', name: 'One canonical host, resolved permanently' },
      {
        id: 'B2',
        state: 'pass',
        name: 'Permanent redirects are permanent; chains at most one hop',
      },
      { id: 'B3', state: 'pass', name: 'robots.txt disallows nothing commercial' },
      {
        id: 'B4',
        state: 'pass',
        name: 'A sitemap exists, is linked from robots.txt, parses, and its URLs serve',
      },
      { id: 'B5', state: 'pass', name: 'Sampled URLs are indexed under their own canonical' },
      {
        id: 'B6',
        state: 'warn',
        name: 'Canonical tags are self-consistent; no indexable duplicates',
        what: 'The six suburb pages carry the same text with only the suburb changed.',
        why: 'Google treats them as one page said six times, and two of them compete with the blocked drains page.',
      },
    ],
  },
  {
    id: 'C',
    question: 'Can a machine read it?',
    meaning:
      'Whether the titles, descriptions and structured data tell a search engine what each page is.',
    checks: [
      {
        id: 'C1',
        state: 'warn',
        name: 'Unique, present, untruncated titles and descriptions',
        what: 'The blocked drains page’s description is the year the business started, and the six suburb pages share one title.',
        why: 'The result a searcher reads says nothing about price or speed, which is what they are choosing on.',
      },
      { id: 'C2', state: 'pass', name: 'Valid LocalBusiness or Organization markup' },
      { id: 'C3', state: 'pass', name: 'Sellable things carry Product with a complete Offer' },
      { id: 'C4', state: 'pass', name: 'No contradictory duplicate entity blocks' },
      { id: 'C5', state: 'pass', name: 'AI crawlers are not disallowed' },
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
        name: 'Core Web Vitals on each customer-facing template',
        what: 'The homepage photo takes about four seconds to appear on a mid-range phone.',
        why: 'Someone with a burst pipe who waits on a blank screen goes back to the results.',
      },
      { id: 'D2', state: 'pass', name: 'Mobile viewport declared, no horizontal scroll' },
      { id: 'D3', state: 'pass', name: 'Valid certificate, no mixed content' },
      { id: 'D4', state: 'pass', name: 'A URL that does not exist returns 404' },
    ],
  },
  {
    id: 'E',
    question: 'Can any of this be judged by value?',
    meaning:
      'Whether anything on the site measures what a visit was worth, rather than only that it happened.',
    checks: [
      { id: 'E1', state: 'pass', name: 'All four measurement sources are recording' },
      {
        id: 'E2',
        state: 'fail',
        name: 'At least one conversion action defined and firing',
        what: 'Neither a tapped phone number nor a sent quote form is counted.',
        why: 'No page or search can be judged by the jobs it brought, only by its visits.',
      },
      {
        id: 'E3',
        state: 'pass',
        name: 'Search Console verified on the canonical property, sitemap submitted',
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
  { label: 'Blocked drains', now: 46, before: 40 },
  { label: 'Contact and quotes', now: 24, before: 20 },
  { label: 'Gas fitting', now: 21, before: 18 },
  { label: 'Suburb pages', now: 13, before: 12 },
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
