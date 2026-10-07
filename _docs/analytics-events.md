# Analytics events

GA4 property `555139588` (`G-BBKNV7LFHQ`) receives a page view per navigation
from `GoogleAnalytics` and the events below from `frontend/src/lib/analytics.ts`.
Routes in `GA_EXCLUDED_ROUTES` (`frontend/src/app/layout.tsx`) send neither.
No parameter ever carries a name, email or phone number.

| Event            | Fires when                                                    | Parameters                                                                                                                                                    | Key event |
| ---------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `generate_lead`  | An enquiry or AI readiness check sends                        | `lead_source` (`project_enquiry`, `ai_readiness_check`; `website_builder` until the builder was retired on 2026-10-07); `project_type`, `budget` on enquiries | Yes       |
| `contact_click`  | Any `tel:` or `mailto:` link is clicked                       | `method` (`phone`, `email`), `link_location` (`footer`, `page`)                                                                                               | Yes       |
| `select_plan`    | A plan is chosen on `/seo` or `/licensing`                    | `item_category` (`seo`, `licensing`), `plan`                                                                                                                  | No        |
| `begin_checkout` | SEO or dealer signup succeeds, before the Stripe payment page | `currency`, `value`, `items`                                                                                                                                  | No        |
| `purchase`       | The Stripe return page confirms payment                       | `currency`, `transaction_id` (`seo-<ref>`, `dealer-<id>`), `value`, `items`                                                                                   | Yes       |

`purchase` takes its value from what `begin_checkout` stored in session
storage; a buyer who returns in another tab still records the purchase, without
a value. It is sent once per transaction per tab, and GA4 dedupes on
`transaction_id` as well.

Key events are marked in GA4 Admin → Data display → Key events. An event name
that has not been received yet can still be added there by name.
