export const BUSINESS = {
  name: 'Wattle & Wrench',
  fullName: 'Wattle & Wrench Plumbing',
  host: 'www.wattleandwrench.example',
  phone: '(08) 5550 0142',
  version: 'r4',
  period: '1 September 2026 to 30 September 2026 (30 days)',
} as const;

/**
 * The cover's clicks reading, against 2 August to 31 August 2026. The cover's other three figures are counts of the
 * recommendations below by impact, as the engine counts them (vocab.owner_cover), so they are not written here.
 */
export const COVER_CLICKS = '+37%';

export type Impact = 'high' | 'medium' | 'low';
export type Cost = 'low' | 'medium' | 'high';

/** The drawn screenshots a few recommendations carry, as a delivered report's do. */
export type ShotKind =
  'phone-header' | 'page-titles' | 'search-results' | 'reviews' | 'profile-details';

export type Recommendation = {
  /** The card's anchor; the contents link to it. */
  id: string;
  /** A line, not a sentence: 60 characters at most, as the engine's schema holds a delivered report's to. */
  title: string;
  impact: Impact;
  cost: Cost;
  /** `data` marks the ask for access to the owner's data: printed last, whatever its impact, and left out of the
   * cover's counts (vocab.in_print_order, vocab.issue_counts). */
  line?: 'data';
  what: string;
  why: string;
  how: readonly string[];
  shot?: ShotKind;
};

export const RECOMMENDATIONS: readonly Recommendation[] = [
  {
    id: 'page-titles',
    title: 'Title every page for its search and Perth, with one heading',
    impact: 'high',
    cost: 'low',
    shot: 'page-titles',
    what: `Twelve of the site's fourteen pages are titled with their menu name and the business name: 'Blocked Drains | ${BUSINESS.fullName}', 'Contact | ${BUSINESS.fullName}', and the home page 'Home | ${BUSINESS.fullName}'. None says Perth, and on every page the heading Google reads as the main one is the logo, not the big words under it.`,
    why: "Google builds a result's headline from the title and the main heading, and asks for a title that describes the page. On 'plumber perth' the home page sits 14th under eleven titles that say plumber and Perth. The two pages retitled in September, hot water and gas fitting, are the two that moved.",
    how: [
      `Retitle each page for its search, the business after a dash: the home page 'Plumber Perth, Northern Suburbs - ${BUSINESS.name}', blocked drains 'Blocked Drains Perth, Cleared From $150 - ${BUSINESS.name}', and the service pages the same way.`,
      "Make the heading at the top of each page its one main heading, in the title's words, and change the header logo from a heading to plain text on every page.",
      'Write each page a description of its own: the job, the suburbs you cover and one reason to choose you, such as the fixed quote.',
    ],
  },
  {
    id: 'service-pages',
    title: 'A page each for emergency call-outs, leaks and bathrooms',
    impact: 'high',
    cost: 'medium',
    what: "Emergency call-outs, leak detection and bathroom plumbing are three paragraphs on one Services page. Google showed that page 1,900 times in September for emergency plumber searches, at about 14th, for one click; seven of the nine free results on 'emergency plumber perth' are a page about emergencies alone.",
    why: 'A page per job gives Google one page to match to each search, and the urgent jobs are the best paid of the week. The hot water page has had a page and a price of its own since September, and it is the page whose clicks doubled.',
    how: [
      "Write three pages, each titled for its search: 'Emergency Plumber Perth, 24/7 Northern Suburbs', 'Leak Detection Perth' and 'Bathroom Plumbing Perth'.",
      'Open each with who comes, how soon and what the call-out costs, then the call button; put the detail from the Services page under it.',
      'Keep the Services page as a short list linking the pages, link each from the menu and the home page tiles, and end each with links to the other service pages.',
    ],
  },
  {
    id: 'business-profile',
    title: 'Make the Business Profile a plumber, open when you are',
    impact: 'high',
    cost: 'low',
    shot: 'profile-details',
    what: "The profile's category is 'Contractor', it is pinned to the house in Kingsley with no service area, its hours say closed from 5pm and all weekend, and it lists three services. Three directory listings still give the old Osborne Park workshop and the old mobile.",
    why: "Google ranks the map box on how well a listing matches the search and how near it is. Every map-box card on 'emergency plumber perth' reads Plumber or Emergency plumber, and yours, with more reviews than two of them, holds none of those places. A searcher at 9pm is told you are closed, though two in five urgent jobs are booked after 5pm.",
    how: [
      'Change the main category to Plumber, and add Emergency plumber and Hot water system supplier.',
      'Clear the street address, as Google asks of a business that goes to its customers, and set a service area of the northern suburbs you reach fastest.',
      'Set the hours to the hours the phone is answered, including the nights and weekends you take urgent jobs.',
      'Add hot water, blocked drains, gas fitting, leak detection and emergency call-outs as services, each with a line saying what it covers.',
      'Update Yellow Pages, True Local and Hotfrog to the address and number on the site, so every listing agrees with the profile.',
    ],
  },
  {
    id: 'drains-price',
    title: 'Lead the blocked drains page with its price and same day',
    impact: 'high',
    cost: 'low',
    shot: 'search-results',
    what: "Google shows the blocked drains page more than any other page on the site, near the top of the first page, but few of the people shown it click. Its description in the results is the year the business started, and the page opens on a stock photo and the company's history.",
    why: "The two plumbers above it both lead with a call-out price and 'same day'. A searcher with a drain backing up is choosing on speed and price, and this result answers neither. Your $150 call-out, included, is a dollar from the cheaper of the two, so saying it costs you nothing. The hot water page made the same change in September and drew twice the clicks.",
    how: [
      "Open the page with one line such as 'Blocked drains cleared from $150, call-out included, same day across the northern suburbs', kept to your current price.",
      'Rewrite the page title and description to carry the price and the words same day.',
      'Print a price only where it is as good as the rivals’ beside you in the results. Where it is not, lead with same day and the fixed quote instead.',
      'Move the history of the business to the about page.',
    ],
  },
  {
    id: 'tap-to-call',
    title: 'Make the header number tap to call, and ring the right phone',
    impact: 'high',
    cost: 'low',
    shot: 'phone-header',
    what: "On a phone the header shows the logo and a menu button. The number sits inside the menu as plain text, and the only number that dials when tapped is in the footer, below the reviews. The contact page's 'Call now' button still dials the old mobile: we tapped it on 3 October and it rang out.",
    why: 'Seven in ten visitors from Google arrive on a phone, and someone with water coming through the ceiling wants to ring, not fill in a form. A caller who has to open a menu and copy a number is a caller who goes back to the results and rings the next plumber, and the one who taps the contact page reaches nobody.',
    how: [
      `Put a 'Call ${BUSINESS.phone}' button in the phone header, visible without opening the menu.`,
      'Make every printed number dial when tapped, including the contact page and the quote form’s thank-you message, and delete the old mobile wherever it appears.',
      'Use the same number everywhere: the site, the Business Profile and the directory listings.',
    ],
  },
  {
    id: 'suburb-pages',
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
    id: 'name-the-plumber',
    title: 'Name Marcus and the licences on every service page',
    impact: 'medium',
    cost: 'low',
    what: "Marcus is thanked by name in 38 of the 64 Google reviews and appears on no page. The pages say 'our team of licensed plumbers', none gives a plumbing or gas licence number or says the work is insured, and the three plumbers most often ranked beside the site print all three.",
    why: 'A customer letting a stranger into the house to work on gas or hot water looks for proof before price. The proof already exists, in the licences behind the work and in what customers wrote on Google; the site is the one place it is missing.',
    how: [
      'Put Marcus, his photo, the plumbing and gas fitting licence numbers and that the work is insured under the heading of the hot water, gas fitting and blocked drains pages.',
      'Quote two reviews that name him beside it, each with the suburb and the job.',
      'Add two or three recent jobs to each of those pages: a photo, the suburb, what was wrong and what was done.',
    ],
  },
  {
    id: 'reply-to-reviews',
    title: 'Ask for a review after every job, and reply to each one',
    impact: 'medium',
    cost: 'low',
    shot: 'reviews',
    what: 'The profile holds a 4.6 rating from 64 reviews, eleven of them this year, and nobody from the business has replied to one. Three one- and two-star reviews describe an arrival window that was missed, with no call to say so.',
    why: 'People compare plumbers on the map before they open a website, and the map-box plumbers on your searches hold 140 to 400 reviews. The praise repeats a fixed quote and a tidy job; the complaints repeat lateness, not the work. A short reply that says what changed is read by every later customer.',
    how: [
      'Add the profile’s review link to the job-complete text you send customers, so every job is asked.',
      'Reply to the three complaints first: say what happened and what you now do, such as a text when the plumber is on the way.',
      'Thank the most recent five-star reviewers by the job they mention.',
    ],
  },
  {
    id: 'homepage-photo',
    title: 'Make the homepage photo small, so it loads fast on a phone',
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
    id: 'count-enquiries',
    title: 'Count calls and sent quote forms as enquiries in Analytics',
    line: 'data',
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

/** How much an experiment moved what it measures so far: the pill beside its title. */
export type ExperimentImpact = 'high' | 'low' | 'none' | 'negative' | 'unclear';

export type Experiment = {
  id: string;
  title: string;
  impact: ExperimentImpact;
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

/** The engine's line under an experiment's chart (compose.experiment_chart). */
const TREND_NOTE = 'The grey line is where this would be had it only followed the site-wide trend.';

export const EXPERIMENTS: readonly Experiment[] = [
  {
    id: 'hot-water-prices',
    title: 'The hot water page leads with its prices',
    impact: 'high',
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
    id: 'gas-fitting-jobs',
    title: 'The gas fitting page names the jobs people search for',
    impact: 'unclear',
    what: "On 16 September the gas fitting page's title changed from 'Gas Services | Wattle & Wrench Plumbing' to 'Gas Fitter Perth: Leaks, Cooktops and Heater Installs', its description was rewritten to name the same three jobs, and each job got a heading of its own on the page.",
    hypothesis:
      'If the title and headings use the words people search with, Google will rank the page higher for gas fitter searches, because today nothing on it says which jobs it covers.',
    label: 'Where the gas fitting page ranks on gas searches',
    window: `Weekly, to 27 September 2026. ${TREND_NOTE}`,
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

export type PairedRow = { label: string; now: number; before: number };

/** "What the data shows" opens on the month, as the overview a delivered report carries. */
export const OVERVIEW: readonly string[] = [
  'Google sent the site 276 clicks from 1 to 30 September, against 202 in August, and showed it a fifth more often. It was not showing for new searches: on the searches it was shown for in both months, it moved up about three places. The hot water page did the most of it. After it began leading with its prices on 9 September, its clicks from hot water searches more than doubled.',
  'The work followed. The job book has 74 jobs booked in September against 61 in August, and 31 of them from people who said they found the business on Google. Calls from the Business Profile rose to 61, its busiest month this year.',
  'Blocked drains is where the most is left. Google shows that page more than any other, near the top of the first page, yet about one showing in eighty becomes a click, against one in twenty-five across the rest of the site. The two plumbers above it say how much and how soon; it says neither.',
];

export type BarRow = { label: string; value: number };

export type Chart =
  | {
      kind: 'paired';
      rows: readonly PairedRow[];
      nowLabel: string;
      beforeLabel: string;
      valueTitle: string;
    }
  | { kind: 'bars'; rows: readonly BarRow[]; highlight: string; valueTitle: string };

/**
 * A question the data answers, as a delivered report asks it: one chart, then
 * what it shows, then the likeliest reading of why. Each joins two or more
 * sources over all the history there is, not one month.
 */
export type Question = {
  id: string;
  /** A line, not a sentence: 60 characters at most, as a delivered report's. */
  title: string;
  /** Its line on the contents page, where the question itself is too long. */
  contents: string;
  caption: string;
  window: string;
  chart: Chart;
  paragraphs: readonly string[];
};

export const QUESTIONS: readonly Question[] = [
  {
    id: 'after-five',
    title: 'When do the urgent jobs come in?',
    contents: 'When the urgent jobs come in',
    caption: 'Share of burst-pipe, leak and blocked-drain jobs, by the hour they were booked',
    window: '2 January to 30 September 2026, 212 jobs; the business’s own job book',
    chart: {
      kind: 'bars',
      rows: [
        { label: 'Before 7am', value: 6 },
        { label: '7am to 9am', value: 14 },
        { label: '9am to noon', value: 19 },
        { label: 'Noon to 3pm', value: 15 },
        { label: '3pm to 5pm', value: 12 },
        { label: 'After 5pm', value: 34 },
      ],
      highlight: 'After 5pm',
      valueTitle: 'Share of urgent jobs (%)',
    },
    paragraphs: [
      'After five. Two in five of the urgent jobs since January were booked after 5pm or before 7am, and on weekends the share is higher still. The planned work, a new hot water system or a bathroom, is booked almost entirely in working hours.',
      'The Business Profile tells a searcher the business is closed from 5pm and all weekend, and the site gives no after-hours number. The jobs that came in anyway came from customers who rang the landline regardless, which diverts to whoever is on call.',
      'The likeliest reading is that an urgent customer rings whoever answers, and does it when the water is on the floor, which is often at night. Those jobs carry a call-out fee and are the best paid of the week. The business already takes them; its listing tells most of the people who would ring that it will not.',
    ],
  },
  {
    id: 'what-reviews-praise',
    title: 'What do customers praise, and what do they hold against you?',
    contents: 'What customers praise',
    caption:
      'Share of Google reviews that mention each thing, this business against its two nearest rivals',
    window:
      'Every review on the three listings, read 3 October 2026; 64 for this business and 151 for the two rivals together',
    chart: {
      kind: 'paired',
      rows: [
        { label: 'A fixed quote before work', now: 41, before: 18 },
        { label: 'Tidy afterwards', now: 33, before: 29 },
        { label: 'Explained the problem', now: 27, before: 22 },
        { label: 'Arrived when they said', now: 9, before: 24 },
      ],
      nowLabel: 'Wattle & Wrench',
      beforeLabel: 'The two nearest rivals',
      valueTitle: 'Share of reviews (%)',
    },
    paragraphs: [
      'The price. Two in five of this business’s reviews mention being told a fixed price before any work began, more than twice the rivals’ share. Punctuality runs the other way: the rivals are praised for arriving when they said far more often, and the three complaints here are all about a plumber who was late without a call.',
      'None of this reaches the site. The service pages say ‘competitive rates’ and give no price, and nothing mentions a fixed quote. The hot water page is the exception since September, and it is the page whose clicks doubled.',
      'The likeliest reading is that customers choose this business for certainty about the bill, and say so when they review it, while the site asks them to trust it before telling them anything. What reviewers praise most is the one thing the pages leave out.',
    ],
  },
  {
    id: 'ai-answers',
    title: 'What do AI answers use the site for?',
    contents: 'What AI answers use the site for',
    caption: 'Times a page of the site was shown in Google’s AI answers',
    window: '1 July to 30 September 2026; Google Search Console, AI answers only',
    chart: {
      kind: 'bars',
      rows: [
        { label: 'Hot water', value: 46 },
        { label: 'Blocked drains', value: 9 },
        { label: 'Gas fitting', value: 7 },
        { label: 'Homepage', value: 5 },
        { label: 'Suburb pages', value: 0 },
      ],
      highlight: 'Hot water',
      valueTitle: 'Times shown in AI answers',
    },
    paragraphs: [
      'For a price. Since its price table moved to the top of the page, the hot water page has been shown in AI answers more than twice as often as every other page together, for questions such as ‘how much does a hot water system cost in Perth’. The suburb pages have never been shown.',
      'The answers quote the page’s prices and link it as the source. Questions about blocked drains and gas work bring the site up rarely, and when they do, the answer cites a rival that states its call-out fee.',
      'The likeliest reading is that an AI answer lifts a plain fact it can repeat: a price, a licence number, a suburb list. A page that states one gets cited; a page that tells the business’s history does not. The same change that lifts a page in the results, a price at the top, is what puts it in the answers.',
    ],
  },
];

export type SourceStatus = 'present' | 'partial' | 'absent' | 'not configured';

export type Source = { source: string; status: SourceStatus; detail: string };

/** What the sample's Complete audit read, as "Where the data came from" lists it. */
export const SOURCES: readonly Source[] = [
  {
    source: 'Google Search Console',
    status: 'present',
    detail: '1 September 2026 to 30 September 2026',
  },
  {
    source: 'Google’s AI answers',
    status: 'present',
    detail: '1 September 2026 to 30 September 2026',
  },
  {
    source: 'Google Analytics',
    status: 'partial',
    detail: 'Visits are recorded; no call or quote form counts as an enquiry.',
  },
  {
    source: 'Microsoft Clarity',
    status: 'not configured',
    detail: 'The site does not run Clarity.',
  },
  {
    source: 'Google Ads',
    status: 'not configured',
    detail: 'The business does not advertise on Google.',
  },
  {
    source: 'Google Business Profile',
    status: 'present',
    detail: 'Whole calendar months, January to September 2026',
  },
  {
    source: 'The sitemap and Google’s index view',
    status: 'present',
    detail: 'Read 2 October 2026',
  },
  { source: 'SEO fundamentals checks', status: 'present', detail: 'Read 3 October 2026' },
  { source: 'Live site checks', status: 'present', detail: 'Read 3 October 2026' },
  {
    source: 'The site’s own change log',
    status: 'present',
    detail: '1 September 2026 to 30 September 2026',
  },
  { source: 'A walk of the public site', status: 'present', detail: 'Read 3 October 2026' },
  {
    source: 'A walk of the public site on a phone',
    status: 'present',
    detail: 'Read 3 October 2026',
  },
  {
    source: 'Live search results',
    status: 'present',
    detail: 'Desktop and phone results for 24 searches, read 3 October 2026',
  },
  { source: 'Competitors’ sites', status: 'present', detail: 'Read 3 October 2026' },
  {
    source: 'Real-visitor speed (Chrome)',
    status: 'partial',
    detail: 'Too few visits on a computer for Google’s real-visitor figures; phones are measured.',
  },
  { source: 'PageSpeed Insights', status: 'present', detail: 'Read 3 October 2026' },
  {
    source: 'The business’s own records',
    status: 'present',
    detail: 'The job book, January to September 2026',
  },
  {
    source: 'Google reviews, the business’s and its two main rivals’',
    status: 'present',
    detail: 'Read 3 October 2026',
  },
  { source: 'The law that applies to the site', status: 'present', detail: 'Read 3 October 2026' },
];

/** How a delivered report orders its cards (vocab.in_print_order): impact first, the access ask last. */
const IMPACT_ORDER: Record<Impact, number> = { high: 0, medium: 1, low: 2 };

export function printOrder(items: readonly Recommendation[]): Recommendation[] {
  return [...items].sort(
    (a, b) =>
      Number(a.line === 'data') - Number(b.line === 'data') ||
      IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact],
  );
}

/** The cover's counts (vocab.issue_counts): the recommendations by impact, the access ask left out. */
export function issueCounts(items: readonly Recommendation[]): Record<Impact, number> {
  const counts: Record<Impact, number> = { high: 0, medium: 0, low: 0 };
  for (const item of items) if (item.line !== 'data') counts[item.impact] += 1;
  return counts;
}
