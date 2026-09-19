# FreeTheDesk — business context

Facts about the business that Search Console cannot show, recorded so every
report inherits them instead of rediscovering them or, worse, recommending
against them.

Each entry is a heading, a short metadata block, the fact, and a **So:** line
saying what it means for a report. `scope` is `site`, `page <path>`,
`query <text>` or `line <name>`. Set `status: retired` (or an `until:` date)
when something stops being true rather than deleting it — a later report needs
to be able to explain why an earlier one said what it did.

Nothing here changes `config_hash`. These change what a report may *conclude*,
never what a number *means*.

Entries carrying `source: repository` were established by reading this
repository, not stated by the business. They are structural facts about what
exists, not commercial judgements, and anything commercial should be confirmed
before a report leans on it.

## The property is new to Search Console

- scope: site
- since: 2026-09-19

The first day of data is 29 August 2026. There is no history before it and no
previous report.

**So:** r1 is a baseline, not a performance review. No percentage change, no
matched-window comparison, and no claim about a trend. What the report is for is
recording the starting state precisely enough that r2 can measure against it.

## Four products are sold from one site

- scope: site
- since: 2026-09-19
- source: repository

The site sells web development, an SEO retainer, a dealership website builder,
and dealer licensing support, with an automation offer alongside. Each has its
own landing page, and licensing and SEO each have their own checkout and
customer portal.

**So:** these are separate demand pools that happen to share a domain. A
site-level figure at this volume is the sum of four near-empty ones and says
nothing about any of them. Report by page, and say when a page has too little
data to read.

## The portfolio pages carry clients' own brands

- scope: page /portfolio
- since: 2026-09-19
- source: repository

`/portfolio/scooter-shop` and `/portfolio/bloomprint` describe work done for
Scootershop and Bloomprint, both of which are separate properties in this same
reporting series.

**So:** impressions these pages earn for a client's brand terms are a fact about
FreeTheDesk's own index footprint, not demand for FreeTheDesk. Never count them
as an opportunity, and flag them if they start competing with the client's own
site on the client's own name.

## Web development is sold in Perth; the dealer product is not

- scope: site
- since: 2026-09-19
- source: repository

Web development and SEO are sold to local Perth businesses. The dealership
website builder and licensing support are aimed at vehicle dealers and are not
geographically limited to Perth in the way a services engagement is.

**So:** judge `/website-development-perth` and `/seo` against Perth-qualified
demand as a matter of commercial judgement, not by any measure derived from
whether a query happened to contain the word Perth. Search Console has no
geography finer than the country; where that limit bites, state it.
