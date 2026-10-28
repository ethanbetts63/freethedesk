# Podcast affiliate pitch

Three email templates that put the same offer to a podcast host. Each goes to a
share of the list and the one with the most positive replies stays. Drafted 24
October 2026; the live offer is in the templates, not here. An earlier third
version, the pitch laid out as a report about the podcast, was dropped the same day.

**Since 2026-10-28 only A and C are sent, and as plain text.** A composed
email in the branded frame landed in Gmail's Promotions tab; the same note as
plain text landed in the inbox. So A and C go out through
`send(template=..., plain=True)`, which renders the `.txt` twin alone with no
HTML part; the `.html` files stay for the previews and for the day the frame is
wanted back. B, the designed announcement, is paused (`PAUSED_VERSIONS` in
`affiliates/utils/pitching.py`): nobody new is assigned to it and the send
command moves its queued prospects onto A or C. Its sent rows keep their version
on the dashboard.

Templates: `core/templates/emails/podcast_pitch/{a,b,c}.html` with a `.txt`
twin each, sent through `freetheplatform.messaging.send(template="emails/podcast_pitch/a", ...)`.
The `.txt` files wrap their output in `{% autoescape off %}`, so an apostrophe
goes out as typed. A and C's `.html` extend the standard `emails/base.html`
frame (wordmark header, Perth footer); B is its own 600px layout and
`_footer.html` is its legal footer. The report image is
`frontend/public/images/affiliates/report-cover.png`, referenced as
`{{ site_url }}/images/affiliates/report-cover.png`, so it has to be deployed
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
- A listener discount, passed as `discount`: the site setting `affiliate_discount_percent` (20% when written), which is what each affiliate's code is made with. See `../affiliate-program.md`.
- One next step: sign up on the affiliate page, /affiliates. No audit is written and no code issued until they have. C has no links at all and tells the host to search "freethedesk affiliates" instead.
- The same footer: the wordmark, Perth, and a one-click unsubscribe line. C's says to reply "no thanks" instead, so those replies have to be added to the suppression list by hand.

## What changes

| Version | Sounds like                                                                                                           | The visual                                                                                 | Subject lines                                                                                     |
| ------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| A       | One person writing to one host; opens with a line about the show                                                      | The report cover, one small image                                                          | A free SEO audit for {business} · Quick one about {podcast} · $700 an audit for {podcast}         |
| C       | A, with no links and no image: "search freethedesk affiliates", and a line about not clicking links in strange emails | None                                                                                       | A's subject lines                                                                                 |
| B       | freethedesk announcing an affiliate program                                                                           | Navy hero with the earnings hook, a one-line figures strip, three steps, the sample report | The freethedesk podcast affiliate program · An invitation for {podcast} · {podcast} × freethedesk |

## Context

| Variable                            | Example                                                                                             | Notes                                                                                                                                                                                                   |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site_url`                          | `https://www.freethedesk.com.au`                                                                    | Added by messaging from `SITE_URL`                                                                                                                                                                      |
| `podcast`                           | The Tradie Show                                                                                     | From the feed                                                                                                                                                                                           |
| `first_name`                        | Sam                                                                                                 | Optional; A says "there" without it                                                                                                                                                                     |
| `opener`                            | I just listened to the quoting episode. Great ep, I'm with you on walking away from the cheap jobs. | A's (and C's) second paragraph, written by hand per host from the show notes to Bloomprint's "I just listened to..." brief (`affiliates/outreach_instructions.md`, owner's call 2026-10-26). B has none |
| `discount`                          | 20%                                                                                                 | The listener discount                                                                                                                                                                                   |
| `commission_low`, `commission_high` | $275, $700                                                                                          | Half of the cheapest and dearest audit                                                                                                                                                                  |
| `free_audit_price`                  | $850                                                                                                | The tier the host gets free                                                                                                                                                                             |
| `unsubscribe_url`                   | per recipient                                                                                       | Must suppress the address in messaging                                                                                                                                                                  |
| `sender_name`                       | Ethan Betts                                                                                         | A only                                                                                                                                                                                                  |

## Testing

Bloomprint's outreach replied at roughly 1–3%. At that rate 100 sends per
version gives a handful of replies each; 150–200 per version is needed before a
gap means anything, and only a large one will show. Count positive replies, not
opens.
