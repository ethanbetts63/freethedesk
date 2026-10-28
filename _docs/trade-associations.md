# Trade association partners

How a trade or employer association becomes a freethedesk partner: what its
members get, what the association earns, what it will ask for, and the order
to approach them in. Planned in conversation on 28 October 2026; nothing is
built or signed yet. It reuses the podcast affiliate machinery
([`affiliate-program.md`](affiliate-program.md)): an association is an
affiliate with a code, a landing page and a commission statement, plus a
written agreement and a free report for its own site.

## Why associations

One conversation reaches hundreds of owners through someone they already pay
to be told things. The membership manager needs benefits to show the board;
a free SEO report and a member discount cost the association nothing, so it
is an easy win for them. Unions are not the target: they represent employees,
not businesses. The targets are employer and trade associations, franchise
groups, and the business networks.

## Who to approach

WA trade and employer associations first: Master Plumbers & Gasfitters WA,
NECA WA (electricians), Master Builders WA, HIA WA, MTA WA, Master Painters
WA, AIRAH or ARC (HVAC), the Clean Energy Council (national). Then CCIWA and
the Small Business Development Corporation's network, then the smaller and
faster ones: BNI chapters, the local chambers (Joondalup, Rockingham,
Fremantle) and council business associations.

Inside each, the **membership manager** or partnerships manager is the
person. Their job is to show the board that membership is worth the fee. The
CEO signs; the membership manager champions.

## The offer

Three layers, led with the first:

1. **To the association:** a free report on its own site, before anyone has
   to believe anything. Association sites are usually poor, so it lands.
2. **To members:** a free prospect-style report for any member who asks, and
   20% off a paid audit with the member code (the affiliate discount,
   `affiliate_discount_percent`).
3. **To the association's budget:** 20% of what members pay through the code,
   for the first 12 months of each member, paid quarterly with a statement of
   who. See the commission decision below.

What is asked back is ordinary partner treatment: a listing on the
member-benefits or preferred-supplier page, one newsletter feature at launch,
a mention in the new-member pack, and the right to say "endorsed SEO partner
of X". The listing links to freethedesk because listings do. The link is not a
term of the deal, so nothing needs marking as sponsored and there is no link
scheme to explain.

If an association pushes on money, 50% on the first audit only is the
concession, never the opening.

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

One mid-sized association with a matching sample first: Master Plumbers WA
with the Hartley report, or the CEC with Solar 365 to go national. Get one
signed, then "endorsed partner of X" goes in the email to the next five. The
first is the slow one; the rest see a precedent.
