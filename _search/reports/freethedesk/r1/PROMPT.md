# Write the FreeTheDesk search report — r1

You are writing a search performance report against a pre-computed pack. The
data collection is done. Your job is the analysis, the argument and the prose.

| | |
| --- | --- |
| Property | `https://www.freethedesk.com.au/` |
| Reporting period | **2026-08-29 to 2026-09-19** (22 days) |
| Previous report | none — this is the first report for this property |
| Pack (read this first, in full) | `C:\Users\ethan\coding\freethedesk\_search\reports\freethedesk\r1\pack.json` |
| Stored snapshot, for anything the pack does not answer | `C:\Users\ethan\coding\freethedesk\_search\data\freethedesk` |
| Write the report body to | `C:\Users\ethan\coding\freethedesk\_search\reports\freethedesk\r1\content.html` |
| Write the structured record to | `C:\Users\ethan\coding\freethedesk\_search\reports\freethedesk\r1\published.json` |

## Read these before anything else

The pack raised the following. Each one changes what this report may claim.

- **high** · `site_and_google_disagree` — The site and Google's index disagree about 1 URL(s): indexed_but_unavailable; noindex_still_indexed. These are usually concrete bugs and neither source shows them alone. See live.disagreements.
- **high** · `pages_not_serving` — 1 checked page(s) did not return a success status: https://www.freethedesk.com.au/website-development-perth. Any finding about their search performance must say so.
- **high** · `context_applies_to_prominent_page` — A page under standing business guidance is among this period's most prominent: /website-development-perth (/website-development-perth was renamed, not removed). Report its figures as measured, but read business_context before drawing any conclusion or making any recommendation about it.
- **medium** · `unstable_tail` — Data from 2026-09-17 onward is still being revised by Google. It is included and marked, but the last few days of any series should be drawn as provisional and not used as an endpoint for a claim.
- **medium** · `seasonality_unresolvable` — Only 21 days of history exist, so there is no prior year to compare against and seasonality cannot be separated from cause. Any trend explanation must say this rather than imply a clean attribution.

---

## 1. Read the pack before you write anything

`C:\Users\ethan\coding\freethedesk\_search\reports\freethedesk\r1\pack.json` holds every required exhibit already computed: totals and
comparisons per window, the trend series, concentration, query-to-page
mismatch, striking distance, segments, position bands, movers, coverage, the
inherited recommendation ledger, and a `warnings` array.

**Read `warnings` first.** Each one names something that would otherwise make a
claim in this report wrong. A warning marked `blocking` means a comparison you
might naturally reach for is not valid as written.

The pack is tier one. The complete daily history sits beside it and you should
use it whenever the pack raises a question it does not answer:

```
python -m freetheplatform.searchconsole query --property freethedesk \
    --dimset query --start 2026-08-29 --end 2026-09-19 --contains "near me" --limit 50
```

`--dimset` is one of `query_page`, `query`, `page`, `device`. Add `--regex` to
match a pattern, `--by impressions` to rank differently, `--csv` for raw rows.

## 2. What this report is about

Its period is **2026-08-29 to 2026-09-19** — the ground since the last
report. Reach further back whenever it explains something; the pack carries
all-time, 28-day and 90-day windows for exactly that. But the findings this
report is answerable for are the ones inside its own period, and a reader must
never be left unsure which window a number came from.

## 3. Rules that are not negotiable

These exist because each one has already produced a wrong number in a real
report for this family of sites.

1. **Every figure names its window.** In the prose, in the table header, or in
   the exhibit caption. A number without a window is not a finding.
2. **A percentage change requires a matched, non-overlapping, equal-length pair
   of at least 14 days.** The pack tells you which comparisons qualify in
   `comparisons[*].percent_allowed`. Where it is false, write the direction and
   say why it is only a direction. Never compute a percentage the pack has told
   you is not available.
3. **There are three attribution tiers and they must not be mixed.** Search
   Console returns a different total depending on what you group by, and the
   gaps are large — on this family of properties, grouping by page or query
   drops around 60% of clicks.
   - **Site tier** (`exhibits.*.totals`, `trend`) — the `date`-only series.
     Every headline total, every trend, every period comparison comes from here.
   - **Page tier** (`page_totals`, `concentration`, `top_pages`, `movers.pages`,
     `mismatch`) — which page.
   - **Query tier** (`query_totals`, `top_queries`, `segments`,
     `position_bands`, `striking_distance`) — which search.

   Never chart one tier against another, and never chart a daily-derived series
   against a window-aggregate total. **One exception, and it is worth using:**
   the coverage overlay — site total, page-attributed total, and individual page
   lines on one chart. It is permitted only when the attributed total is drawn
   too, so the gap reads as a gap. Put the individual pages in a second panel
   with its own y scale if the homepage dwarfs them. See section 5 of the
   reporting standard.
4. **Say which tier a share is of.** `coverage` gives `page_coverage` and
   `query_coverage`; state both once, early, as facts about the dataset. A
   homepage share from `concentration` is a share of page-attributed clicks, not
   of all clicks — write it that way. Do not re-caveat it in every section.
5. **A dimension the data does not have is stated, never substituted.** The
   finest geography Search Console reports is the country; there is no state,
   city or suburb. Do not reach for a stand-in — the words in a query are not a
   location, because proximity is itself a ranking factor and a nearby site
   surfaces for the unqualified term too. The same holds for any missing
   dimension: conversions, sessions, revenue. Say the measurement does not
   exist and say what would provide it.
6. **Never compare "number of queries ranking" across windows of different
   lengths.** It is a function of window length. Pages are safe; queries are not.
7. **Only publish facts.** Every number traces to the pack or to a query you ran
   against the store. If you believe something the data cannot show, say that it
   is your read and say what would settle it. An invented figure in a report is
   worse than a gap.
8. **Nothing is live because it is committed.** `live` is how you check. If you claim a change is in
   production, you checked production. Otherwise say it is committed and
   unverified.
9. **Resolve the inherited ledger.** Every recommendation in
   `carry_forward.recommendations` gets an outcome in this report: shipped and
   what happened, still open and why, or withdrawn and on what grounds.
   Experiments marked running are read on their declared date and not before —
   an interim is direction, not outcome, and must say so.
10. **Draw the shape, do not tabulate it.** A change over time, a
    distribution across bands, a cliff on a date — those are charts, and the
    `chart` command builds one from the store. Reserve a table for figures a
    reader will read individually or check against a source. A ten-row table of
    a collapse makes the reader do arithmetic to see what a line would have
    shown at a glance.
11. **Say what the report cannot tell you.** A closing section covering at
   minimum: seasonality, the query/page reconciliation gap, anything the
   `sources` array marks absent, and any warning you could not design around.
12. **Read `business_context` before you recommend anything.** It holds facts
    about the business that the data cannot show — a dormant page, a line that
    trades nationally while the rest is local, a figure not to quote forward.
    Each entry carries a **guidance** line saying what it means for the report.
    Report the numbers for a page under standing guidance exactly as measured;
    suppressing them is its own distortion. But do not recommend, propose an
    experiment on, or describe as an opportunity anything the guidance rules
    out.
13. **Check the site before describing a page.** `live` holds a rendered fetch
    of every page this report is about, plus Google's own index view of it.
    `live.disagreements` is where the two tell different stories, and those are
    usually the concrete bugs. If `live.status` is `not run`, say so and make no
    claim about what is deployed. A page is not underperforming if it is
    redirecting, noindexed or empty — find out which before writing either.
14. **Cost is `low`, `medium` or `high`.** Never a number of hours or days. You
    do not know the team, the codebase or what else is in flight, and an invented
    estimate reads as precision that was never there.
15. **Do not describe the reporting apparatus to the reader.** No explaining why
    a section exists, no addressing a future report version as though it were a
    person, no narrating the method in the prose. State the finding. The method
    belongs in the closing section, written as what was and was not measured.

### Voice

Write as the analyst reporting to the business that owns the site. Confident,
plain, specific. The reader wants to know what happened and what to do; they do
not want a tour of how the report was assembled, and phrases like "declared here
so that the next version can read them" put the machinery in front of the
finding. First person is fine where a judgement is genuinely yours.

## 4. Required structure

The floor, in this order. Everything else is yours.

1. **Title, one-sentence answer, and the stat row.** The first sentence states
   what happened this period. Not "this report examines".
2. **Provenance** — render `provenance` and `sources` from the pack. Property,
   country, windows, versions, data as-of, what was and was not available.
3. **The analysis.** Numbered sections, each with a heading that states its
   point. Use the exhibits that carry your argument; skip the ones that do not.
   Nobody wants a tour of the pack.
4. **What changed since the last report**, and for each figure that moved,
   which of the four causes it was: the window moved, Google revised the data,
   the ruleset or config changed, or the site changed.
5. **Recommendations**, each with a stable `id`, ranked by what you would do
   first, with the evidence and the cost of doing it.
6. **Experiments** in flight or proposed, each with a hypothesis, a baseline and
   a declared remeasure date.
7. **Method and limits.**

## 5. Write it as HTML into `C:\Users\ethan\coding\freethedesk\_search\reports\freethedesk\r1\content.html`

Write the body only — no `<html>`, `<head>` or `<body>`. The chrome, typography,
print layout and PDF rendering are supplied. Use these classes and you inherit
the house style; invent your own and the report stops matching its predecessors.

```html
<p class="lede">The one-sentence answer.</p>

<div class="stat-row">
  <div class="stat"><span class="stat__value">2,632</span>
    <span class="stat__label">Clicks, last 90d</span>
    <span class="stat__note">95,310 impressions</span></div>
</div>

<section class="section" data-num="01" data-kicker="What happened">
  <h2>A heading that states the finding</h2>
  <p>...</p>

  <figure class="exhibit">
    <figcaption class="exhibit__caption">Weekly organic clicks</figcaption>
    <p class="exhibit__window">Whole weeks only, 16 Mar - 6 Sep 2026</p>
    <table> ... </table>
    <p class="exhibit__source">Search Console, page level, country=aus</p>
  </figure>

  <aside class="callout"><h3>How to hold this</h3><p>...</p></aside>
  <aside class="callout callout--change"><h3>Changed since r1</h3><p>...</p></aside>
  <aside class="callout callout--limit"><h3>What this cannot tell you</h3><p>...</p></aside>
</section>
```

Also available: `<span class="tag">Unlisted</span>`, `<td class="num">` for
figures, `<tr class="is-negative">`, `class="annex-only"` on a long table to
keep it out of the PDF body, and `<div class="bars">` with
`<div class="bar" style="--v:0.62"><span>Label</span><b>485</b></div>` for a
simple bar chart that needs no script. Charts beyond that: write inline SVG, and
give it `class="chart"` so it scales and prints.

## 6. Then write `C:\Users\ethan\coding\freethedesk\_search\reports\freethedesk\r1\published.json`

This is what the next report inherits. Without it, `r1` is
invisible to its successor and the ledger restarts.

```jsonc
{
  "report_version": "r1",
  "period": { "start": "2026-08-29", "end": "2026-09-19" },
  "headline": [
    { "label": "Clicks", "value": 2632, "basis": "d90", "note": "95,310 impressions" }
  ],
  "recommendations": [
    { "id": "hire-page-cannibalised", "title": "...", "status": "open",
      "opened_in": "r1", "priority": 1, "evidence": "section 02",
      "note": "..." }
  ],
  "experiments": [
    { "id": "homepage-link-block", "hypothesis": "...", "shipped": "2026-08-30",
      "baseline_window": { "start": "2026-08-01", "end": "2026-08-29" },
      "remeasure_on": "2026-10-11", "status": "running", "note": "..." },
    { "id": "adelaide-consolidation", "hypothesis": "...", "status": "proposed",
      "note": "what it would change, and what would read as it having worked" }
  ]
}
```

An experiment you are recommending but nobody has shipped is `proposed`: no
`shipped` date, no `remeasure_on`, and it is carried to the next report as
something to resolve. Put it in the ledger, not only in the prose — a proposal
that lives in a paragraph is one nobody will be asked about again.

Every `headline` figure needs a `basis` naming its window. Every recommendation
needs a stable `id` that will survive into later reports — if you are resolving
an inherited one, reuse its id and change its `status`.

## 7. Finally

```
python -m freetheplatform.searchconsole render --property freethedesk --version r1 --pdf
```

This validates `published.json`, wraps the body in the house chrome, and writes
`report.html` and `report.pdf`. If validation fails it tells you what is
structurally missing.

---

**One last thing.** The floor above is a floor. The reason the previous reports
in this series were worth reading was not that they contained the standard
exhibits — it was the sections nobody asked for: noticing that a baseline month
was not a baseline, that a recovery figure was measuring a site that no longer
existed, that a recommendation made earlier should be withdrawn. Look for that.
If the most interesting thing in this period is not in the pack, go and get it
from the store, and lead with it.
