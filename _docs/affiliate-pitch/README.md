# Podcast partner pitch

Two email templates that put the same offer to a podcast host. Each goes to half
the list and the one with the most positive replies stays. Drafted 24 October
2026; the live offer is in the templates, not here. A third version, the pitch
laid out as a report about the podcast, was dropped the same day.

Templates: `core/templates/emails/podcast_pitch/{a,b}.html` with a `.txt`
twin each, sent through `freetheplatform.messaging.send(template="emails/podcast_pitch/a", ...)`.
A extends the standard `emails/base.html` frame (wordmark header, Perth
footer); B is its own 600px layout and `_footer.html` is its legal footer. The report image is
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
- A 20% listener discount, passed as `discount`.
- One next step: sign up on the partner page, /partners. No audit is written and no code issued until they have.
- A footer with a one-click unsubscribe. A's also gives the postal address and
  says where the email address came from (their podcast feed); B's is just the
  unsubscribe line.

## What changes

| Version | Sounds like | The visual | Subject lines |
| --- | --- | --- | --- |
| A | One person writing to one host; opens with a line about the show | The report cover, one small image | A free SEO audit for {business} · Quick one about {podcast} · $700 an audit for {podcast} |
| B | Free the Desk announcing a partner program | Navy hero with the earnings hook, a one-line figures strip, three steps, the sample report | The Free the Desk podcast partner program · An invitation for {podcast} · {podcast} × Free the Desk |

## Context

| Variable | Example | Notes |
| --- | --- | --- |
| `site_url` | `https://www.freethedesk.com.au` | Added by messaging from `SITE_URL` |
| `podcast` | The Tradie Show | From the feed |
| `first_name` | Sam | Optional; A says "there" without it |
| `opener` | Came across your episode on pricing jobs… | Optional one true line about the show; A's second paragraph. Never claim to have listened when nobody has |
| `discount` | 20% | The listener discount |
| `commission_low`, `commission_high` | $275, $700 | Half of the cheapest and dearest audit |
| `free_audit_price` | $850 | The tier the host gets free |
| `unsubscribe_url` | per recipient | Must suppress the address in messaging |
| `postal_address` | | Required by US CAN-SPAM |
| `sender_name` | Ethan Betts | A only |

## Testing

Bloomprint's outreach replied at roughly 1–3%. At that rate 100 sends per
version gives a handful of replies each; 150–200 per version is needed before a
gap means anything, and only a large one will show. Count positive replies, not
opens.
