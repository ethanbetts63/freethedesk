# Website sample outreach

Built 2026-11-19. A website sample (a prospect's whole site rebuilt as a demo, `../ftp_search/_samples/`) has a
companion report at `freethedesk.com.au/reports/<business>-<token>` ([`seo-prospect-outreach.md`](seo-prospect-outreach.md),
"Sample reports at the same address"). This is the email that sends that link: held, approved on the owner's word,
sent once by the hourly run, the way the prospect reports go. Only freethedesk's own samples are emailed from here;
Support Perth's are never held, so never sent.

## Decisions (owner, 2026-11-19)

- **One subject, one body, the owner's words.** Subject `A redesign of {domain}`; the body below. Plain text only: no
  HTML part, no picture, no attachment. The source copy is `../ftp_search/_prospect/outreach/call_script.md`, "The
  sample email"; the server holds the same text in `seo/utils/sample_sending.py` (`SUBJECT`, `BODY`). Change both
  together.
- **The four titles** are the report's first four change cards in the order the report shows them (`companion.py`
  sorts by each card's first kind, UX first), sent by the pipeline at hold time and kept on the row.
- **Held, then approved.** Nothing is sent unless the owner says so in chat. Approval names the page's SHA-256, so
  what goes out is the page the owner read; a publish that changes the page, business or domain of an approved, unsent
  sample holds it again.
- **One first email per business.** A hold is refused for an address or domain another held sample has, or any
  prospect report row has; a prospect report upload is refused for a business with a held sample. The suppression
  list applies at hold and at send.
- **Follow-ups on the owner's word only.** No wait, no rotation: the same subject and email, its first paragraph
  opening "Just following up on my previous email, in case it got buried." Once; `again` for another after it went.

## The body

```
Hi {first_name},

My name's Ethan. I've rebuilt your website as a sample: the same pages, with your own words and photos, laid out to make it easier for customers to get in touch. There's no obligation. If you like it, I can put it live on your own domain.

The report goes through every change: what your site does now, what the redesign does instead, and why it matters to your customers or to Google. A few of them:

1. {title}
2. {title}
3. {title}
4. {title}

You can read the report and click through to the redesign here: {link}

If you want to go through it first, my number is below. I can explain any part of it. Reply 'no thanks' and I won't email again.

Ethan Betts
Director, freethedesk
0423 853 830
www.freethedesk.com.au
```

## Design: the outreach fields on `SeoSampleReport`

The email's state lives on the sample's own row (migration `seo` 0035), not on a `SeoProspect`. The sample row already
owns the link, the page and its opens, and the link was sent out before any email existed; a prospect row would mean
a second link and a second page for one report, and would carry fields a sample has no use for (report version,
subjects and bodies in rotation, the recommendation count, purpose, metric). The one rule the two share, one first
email per business, is a check across both tables at upload and hold. The prospect calls list, its `called` and reply
fields, and the dashboard pages are not mirrored: a sample's call is the owner's, from the brief.

| Field                                          | Notes                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| `contact_name`, `first_name`, `email`, `phone` | from the hold; never made up: the pipeline refuses a sample without them |
| `email_source`                                 | where the address and name came from                                     |
| `domain`                                       | the subject's; the hold sets it, `publish.py` sends the same             |
| `titles`                                       | the first four change titles                                             |
| `page_sha256`                                  | the page as last uploaded; approval must name it                         |
| `held_at`, `approved_at`, `sent_at`            | null `held_at`: not for email                                            |
| `follow_up_queued_at`, `followed_up_at`        | the owner-triggered follow-up                                            |
| `excluded_reason`                              | blank means eligible; set by hand (admin) to hold one back               |

## Endpoints (shared secret, `X-Internal-API-Key`)

- `POST /api/seo/samples/hold/`: `project`, `email`, `first_name`, `contact_name`, `phone`, `email_source`, `domain`,
  `titles` (at least four). Answers the subject and body as they would go. 404 for a project not published; 409 for
  `already_sent`, `already_known` (with `field`) or `suppressed`. Holding again replaces the details and takes back
  any approval.
- `POST /api/seo/samples/approve/`: `project`, `page_sha256`; `approved` 0 takes the word back. 409 for `not_held`,
  `already_sent`, `incomplete` or `page_changed`.
- `POST /api/seo/samples/follow-up/`: `project`, `again`. 409 for `not_sent`, `already_queued`,
  `already_followed_up`, `excluded`, `suppressed`.

**Send.** `send_affiliate_outreach` sends approved samples and queued sample follow-ups after the prospect reports,
in the same Perth weekday window, ten seconds apart, up to `--reports` a run. Claim first
(`filter(pk=..., sent_at__isnull=True).update(...)`), then
`send(..., plain=True, related=sample, sender=settings.OUTREACH_SENDER)`. Message types `seo_sample` and
`seo_sample_follow_up`, registered in `seo/apps.py`.

## The pipeline side

`../ftp_search/_samples/tools/outreach/outreach.py`: `hold`, `approve`, `unapprove`, `follow-up`, `sync`, `todo` and
`brief` (the one-page call brief, `_search/projects/<project>/sample/call_brief.pdf`). Its docstring says where the
contact comes from. The outreach agent (`_prospect/prompts/outreach.md`) runs its `sync` and `todo` beside the
prospect outbox's.

Tests: `seo/tests/view_tests/test_sample_outreach.py`.
