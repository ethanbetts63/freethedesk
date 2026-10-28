# Business group partners

How a local chamber of commerce or business association becomes a freethedesk
partner: what its members get, what the group gets, what it will ask for, and
the order to approach them in. Planned in conversation on 28 October 2026;
nothing is built or signed yet. It reuses the podcast affiliate machinery
([`affiliate-program.md`](affiliate-program.md)): a group is an affiliate with
a code, a landing page and a commission statement, plus a written agreement
and a free report for its own site.

## Decision (28 October 2026): start with the local groups

The first plan aimed at the state trade associations (Master Plumbers, HIA,
MTA and the like). Read critically, that is too high for a business with two
customers and no reviews:

- Their digital category is usually sold to a paying sponsor (Thryv, hipages,
  the tradie-website shops), and the partnerships manager's measure is
  sponsorship revenue, so a free supplier is a cost to it.
- An endorsement is their most guarded asset; they want a track record,
  references and insurance, and a committee takes months, not weeks.
- Their members skew to the established firms with an agency already. The
  sole trader who needs freethedesk is not a member of anything.
- 20% of a discounted audit is about $88; it motivates nobody.
- The channel multiplies the free-report-to-paid-audit rate, which is still
  unmeasured (three prospect reports sent, none converted yet).

So the direction is **local chambers of commerce and business associations**:
Joondalup Business Association, Rockingham Kwinana Chamber, Fremantle
Chamber, Wanneroo, Swan, Armadale, Melville Cockburn, Mandurah, and the
community business associations (Indian, Chinese, Vietnamese, Italian), where
a mainstream agency never shows up. Each has 100 to 300 members, a newsletter,
a volunteer committee that knows every member by name and says yes in a week,
and membership of about $200 to $400 a year. Start with the one for the
suburb freethedesk is in; local counts in these rooms.

The aim of this stage is not revenue. It is the first ten reviews, five case
studies and a measured conversion rate, with warm recipients who have met the
owner. If warm recipients do not convert, cold ones never will. **Speaking
slots and breakfast talks are not part of the plan** (owner's call): the
channel is the listing, the newsletter and the free report, not events. The
state associations come later, once there are reviews to show them, and only
the ones with no digital sponsor in the footer and a bad website of their own.

Two rooms, not eight: the relationship pays only if it is kept up, and the
constraint is the owner's hours. Each free report is still about three hours
of pipeline compute; spend the spare credits on this while they are spare.

Reviews, within Google's rules: a report is never conditional on a review.
Every member gets it free; two weeks later the follow-up asks whether it
helped and, if so, for a line on Google. A review of a free report is a
legitimate review. Testimonials for the freethedesk site have no such rule;
ask every recipient. And ask the two existing customers first.

## Why groups at all

One conversation reaches a few hundred owners through a group they already
pay to belong to. The committee needs benefits to show members at renewal; a
free SEO report and a member discount cost the group nothing, so it is an
easy yes. Unions are not the target: they represent employees, not
businesses.

## Who to approach

The local chambers and business associations above, then the council
business programs (Stirling, Joondalup, Swan, Wanneroo, Canning run free
small-business networks and newsletters), then franchise groups. The state
trade associations (Master Plumbers & Gasfitters WA, NECA WA, Master Builders
WA, HIA WA, MTA WA, Master Painters WA, AIRAH/ARC, the Clean Energy Council)
and CCIWA wait until there are reviews, and only where no digital sponsor is
already listed.

Inside a local group it is the **president or secretary**, volunteers who run
the newsletter themselves. In a state association it is the membership or
partnerships manager, whose job is to show the board that membership is worth
the fee; the CEO signs, the manager champions.

## The offer

Three layers, led with the first:

1. **To the group:** a free report on its own site, before anyone has to
   believe anything. Chamber and association sites are usually poor, so it
   lands, and it does the vetting for you.
2. **To members:** a free prospect-style report for any member who asks, and
   20% off a paid audit with the member code (the affiliate discount,
   `affiliate_discount_percent`).
3. **To the group's budget:** 20% of what members pay through the code, for
   the first 12 months of each member, paid quarterly with a statement of who.
   It is not the motivator and should not lead the pitch; it is a quiet line
   in the agreement. See the commission decision below.

What is asked back is ordinary partner treatment: a listing on the
member-benefits or preferred-supplier page, one newsletter feature at launch,
a mention in the new-member pack, and the right to say "endorsed SEO partner
of X". The listing links to freethedesk because listings do. The link is not a
term of the deal, so nothing needs marking as sponsored and there is no link
scheme to explain.

If a group pushes on money, 50% on the first audit only is the concession,
never the opening.

## Commission decision (28 October 2026)

The podcast affiliates get `affiliate_share_percent` = 50. The owner decided
the association share is 20%, and that 50% devalues the product and should go
to 20% for affiliates too. An association will hear from a member if a
podcast host earns more than it does. Still to do (listed in
[`to_do.md`](to_do.md)): change the setting, the "$220 to $560 an audit" copy
in `frontend/src/lib/pages.ts` and the pitch emails together, and decide
whether existing affiliates keep 50% for a fixed period.

## What they will ask for

Have these before the first meeting; it ends at the first one missing.

- **Professional indemnity insurance.** Nearly every association requires it
  of a listed supplier and wants the certificate of currency.
- **A written partner agreement**, one or two pages: 12-month term, renewable;
  what each side provides; the commission and how it is reported; exclusivity
  (offer to be their only SEO partner); 30 days' termination; freethedesk is
  independent, not their agent.
- **A member landing page** on freethedesk: their logo, the offer, the code,
  the sample report, a form to request the free one. The newsletter sends
  people there and they want to see it before listing anything.
- **A sample report in their trade.** Hartley Plumbing for the plumbers,
  Solar 365 for the CEC; match the sample to the association.
- **References.** Two customers is thin, but a line from each.
- **Privacy.** One sentence: public data only, nothing from inside a member's
  accounts unless access is shared, and no lists are sold.

## The approach

Email, then a call a week later. The email is short: who freethedesk is, one
specific thing wrong with *their* site (so it is plainly not a template), the
offer in two sentences, and 20 minutes with whoever runs member benefits.
Attach or offer the report on their own site.

The meeting is them asking the questions above. The job is to make the
membership manager's board paper easy: a benefit with no cost, an insured
supplier with a contract ready, a page they can link today. Expect four to
eight weeks per association; boards meet monthly and a new supplier goes to
one.

## Once it is live

- The launch feature drives a burst of free-report requests. Each is a
  three-hour pipeline run, so the landing page states a weekly cap ("ten a
  week; yours within x days"). Scarcity reads as quality and keeps the Google
  CAPTCHA load sane.
- Every free report carries the member code and gets the same two-week
  follow-up as the prospect flow.
- Quarterly, the association gets a one-page statement: members served,
  reports delivered, commission paid, and two anonymised findings for its
  next newsletter. That keeps freethedesk in the newsletter unasked and is
  what the membership manager takes to the board at renewal.

## Order of attack

1. Reviews from the two existing customers, this week.
2. The agents build the list: every chamber and business association in Perth
   metro, with suburb, membership cost, newsletter cadence, who runs it,
   whether a digital partner already sits in its footer, and how its own site
   fares on the fundamentals. Ranked by closeness to freethedesk and openness.
3. Join the nearest one. Free report on its site, then the offer to the
   committee.
4. One quarter, a number to beat (member requests, reviews, paid audits),
   decided before launch. If it hits, the second group; if not, stop.
5. Once there are ten reviews and a conversion rate, the state associations,
   with "partner of X chamber" in the email.
