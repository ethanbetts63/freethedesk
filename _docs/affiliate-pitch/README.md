# Podcast partner pitch

Three email templates that put the same offer to a podcast host. Each goes to an
even share of the list and the one with the most positive replies stays. Drafted
24 October 2026; the live offer is in the templates, not here.

Templates: `core/templates/emails/podcast_pitch/{a,b,c}.html` with a `.txt`
twin each, sent through `freetheplatform.messaging.send(template="emails/podcast_pitch/a", ...)`.
`_footer.html` is the legal footer B and C share. The report image is
`frontend/public/images/partners/report-cover.png`, referenced as
`{{ site_url }}/images/partners/report-cover.png`, so it has to be deployed
before the first send.

`preview/` holds each template rendered with sample data (open the `.html` in a
browser). Regenerate after editing a template with the Django template engine
pointed at `core/templates` and the context below; images resolve against
`frontend/public` when `site_url` is `../../../frontend/public`.

## The offer, the same in all three

- A free audit of the host's own business, the Plus audit customers pay $850 for.
- Half of every audit a listener buys with the host's code: 50%, so $275 to
  $700 an audit across the three tiers, paid out through Stripe. Audits are
  bought once, so there is nothing to repeat.
- A listener discount, `discount`, still to decide ($50 suggested).
- One next step: reply with your website.
- A footer with the postal address, where the address came from (their podcast
  feed), a one-click unsubscribe, and a promise of at most one more email.

## What changes

| Version | Sounds like | The visual | Subject lines |
| --- | --- | --- | --- |
| A | One person writing to one host; opens with a line about the show | The report cover, one small image | A free SEO audit for {business} · Quick one about {podcast} · $700 an audit for {podcast} |
| B | Free the Desk announcing a partner program | Navy hero, three figures, three steps, report preview | The Free the Desk podcast partner program · An invitation for {podcast} · {podcast} × Free the Desk |
| C | A report written about their podcast, in our report's layout | The email is the sample: findings, recommendations, pills | We wrote a report on {podcast} · {podcast}: partnership report · 3 findings for {podcast} |

C also pitches an episode: pick a listener's business, we audit it free, the
host goes through it on air.

## Context

| Variable | Example | Notes |
| --- | --- | --- |
| `site_url` | `https://www.freethedesk.com.au` | Added by messaging from `SITE_URL` |
| `podcast` | The Tradie Show | From the feed |
| `podcast_url` | thetradieshow.com | C only, top right |
| `first_name` | Sam | Optional; A says "there", C uses the podcast name |
| `opener` | Came across your episode on pricing jobs… | Optional one true line about the show; A's second paragraph, C's first finding. Never claim to have listened when nobody has |
| `discount` | $50 | The listener discount |
| `commission_low`, `commission_high` | $275, $700 | Half of the cheapest and dearest audit |
| `free_audit_price` | $850 | The tier the host gets free |
| `partner_url` | …/partners | The affiliate page, not built yet |
| `sample_url` | …/seo/sample-report | |
| `unsubscribe_url` | per recipient | Must suppress the address in messaging |
| `postal_address` | | Required by US CAN-SPAM |
| `sender_name` | Ethan Betts | A only |
| `sent_date` | 24 October 2026 | C only |

## Testing

Bloomprint's outreach replied at roughly 1–3%. At that rate 100 sends per
version gives a handful of replies each; 150–200 per version is needed before a
gap means anything, and only a large one will show. Count positive replies, not
opens.
