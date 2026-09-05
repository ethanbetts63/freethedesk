# Web Development Services Agreement — Draft Terms

> **Status: draft for internal review only.** This is a starting point assembled
> from common clauses used across web design/dev agency contracts (PandaDoc,
> LegalZoom, AI Lawyer, OneNine and similar template providers), adapted to how
> Free the Desk operates (dealer websites, optional managed hosting, ongoing
> platform relationship). It is **not legal advice** and should not be sent to a
> client until a lawyer has reviewed it for your jurisdiction. Bracketed text
> (`[like this]`) marks a placeholder to fill in or a decision still to make.

## 1. Parties & Overview

This Agreement is between **[Free the Desk / your registered business name]**
("we", "us") and **[Client legal/business name]** ("you", "the Client"),
covering the design, development, and ongoing operation of a website and
related systems (the "Site") as described in the Scope of Work.

## 2. Scope of Work

- The Site will be built around the features named in **[proposal/quote/SOW
  document]** (e.g., Inventory, Parts, Service/Hire Booking, Enquiry Routing).
  These are described at a functional level — what the feature is, not how
  it must look, behave, or be built.
- **Implementation discretion.** Unless a specific behaviour, workflow, or
  design is documented in writing, the implementation approach for a named
  feature is at Free the Desk's professional discretion. Delivering a working
  implementation of a named feature satisfies this Agreement, even where it
  differs from expectations the Client did not document in writing.
- **Checkpoint reviews.** Before a named feature is treated as built, Free the
  Desk will provide the Client a wireframe, staging demo, or walkthrough of
  that feature for feedback. This checkpoint is where the Client should raise
  any direction concerns — feedback given at this stage is a normal part of
  the build; feedback raised only after a feature has passed its checkpoint
  and moved on is treated as a Change Request (Section 5) unless it is fixing
  something that does not match what was shown at the checkpoint.
- Anything not listed in the Scope of Work is out of scope and subject to the
  Change Request process (Section 5).
- We will use reasonable efforts to meet the timeline in the Scope of Work,
  but timelines depend on the Client meeting their responsibilities under
  Section 4.

## 3. Fees & Payment

- Total project fee: **[amount / payment structure]**.
- Payment schedule: **[e.g., 50% deposit to commence, 50% on delivery — or
  milestone-based]**.
- Late payments beyond **[X days]** may incur a **[late fee %]** and may pause
  work or, for managed-hosting clients, suspend the Site (see Section 8).
- Ownership and license rights under Section 6 do not take effect until the
  final invoice is paid in full.

## 4. Client Responsibilities

The Client agrees to provide, in a timely manner: content (copy, images,
inventory data, logos), feedback and approvals at each milestone, and access
to any existing accounts (domain registrar, current host, analytics) needed
to complete the work. Delays caused by the Client extend the timeline
accordingly and do not constitute a breach by us.

## 5. Revisions & Change Requests

- The agreed fee includes **[N]** rounds of revisions within the original
  Scope of Work.
- Any request that changes, adds to, or removes agreed functionality is a
  Change Request, quoted and agreed in writing (email is sufficient) before
  work on it begins.

## 6. Ownership & License to Code and Design

This is the clause you specifically wanted worded around "access and license"
rather than a flat ownership transfer. Draft language:

> Upon payment in full, the Client receives a **perpetual, non-exclusive
> license** to access, use, run, and modify the code and design produced for
> the Site, with or without Free the Desk's continued involvement. This
> includes the right to export the codebase and move it to hosting of the
> Client's choosing.
>
> Free the Desk retains ownership of the underlying code, components, design
> patterns, and systems used to build the Site, and reserves the right to
> reuse, adapt, and re-license that underlying work — including in other
> clients' websites — regardless of this Agreement.
>
> This reuse right applies to the general system, layout patterns, and
> reusable components. It does **not** extend to the Client's brand-specific
> assets: their name, logo, trademarks, photography, written content, and any
> custom design elements created specifically and exclusively for them under
> a paid bespoke-design engagement, which Free the Desk will not reuse or
> reproduce for another client.
>
> Third-party components (fonts, libraries, stock imagery, plugins) remain
> subject to their own licenses, which the Client is responsible for
> maintaining if they take the Site to independent hosting.

Notes for your review:

- This is a **license model**, not a copyright assignment — worth saying so
  plainly to clients so nobody assumes they hold copyright and could resell
  the codebase as a template.
- Consider offering an **"exclusive design" add-on tier** for clients who want
  a contractual guarantee their specific layout/branding won't appear
  elsewhere — this clause as written doesn't promise that by default.
- Have a lawyer confirm this survives termination (i.e., the license doesn't
  evaporate if the Client stops paying for hosting/support afterward — it's
  tied to the one-time build fee, not the ongoing relationship).

## 7. Hosting & Infrastructure

The Client chooses one of the following at signup, and may switch options
later on **[X days']** notice:

**Option A — Client-Owned Infrastructure.** The Client holds the hosting
account (e.g., PythonAnywhere) and domain registration in their own name,
billed to their own card. The Client grants Free the Desk collaborator/admin
access to deploy and manage the Site as part of the ongoing service fee. If
the relationship ends, the Client retains full, uninterrupted control — no
transfer step is required.

**Option B — Free the Desk–Managed Infrastructure.** The Site runs on Free
the Desk's own hosting infrastructure under a recurring hosting/management
fee of **[amount/period]**. If the relationship ends, Free the Desk will
provide the Client a full export of their code and data and reasonable
assistance (up to **[X hours]**) migrating to independent hosting within
**[X days]** of a written request.

Regardless of option, the Client always retains the license described in
Section 6 and can request a full code export at any time.

## 8. Maintenance & Ongoing Support

- Ongoing support (bug fixes, updates, content changes, uptime monitoring) is
  covered under **[a separate monthly retainer / support plan tiers]**,
  described in **[link/appendix]**.
- Response times, included hours, and what counts as a "bug" vs. a billable
  change request should be defined in that plan, not left implicit here.
- For Option B clients: non-payment beyond **[X days]** may result in
  suspension of the live Site after **[written notice period]**; the Client's
  code/data export rights under Section 7 survive suspension.

## 9. Confidentiality

Both parties agree to keep confidential any non-public business information
shared during the engagement (customer data, pricing, dealer inventory
data, business processes) and to use it only to perform this Agreement.

## 10. Warranties & Disclaimers

We warrant that the work is original (or properly licensed) and will perform
substantially as described in the Scope of Work. Beyond that, the Site is
provided "as is" — we don't warrant uninterrupted operation, fitness for a
particular purpose beyond what's specified, or compatibility with every
future third-party service or browser.

## 11. Limitation of Liability

Our total liability under this Agreement is capped at the total fees paid by
the Client in the **[12 months preceding]** the claim. Neither party is
liable for indirect, incidental, or consequential damages (e.g., lost
profits from Site downtime), except where liability cannot be limited by
law.

## 12. Termination

- Either party may terminate for convenience with **[X days']** written
  notice; the Client pays for work completed up to that point.
- Either party may terminate immediately for material breach not cured
  within **[X days']** notice.
- Sections 6 (Ownership & License), 9 (Confidentiality), 11 (Liability), and
  13 (Portfolio Rights) survive termination.

## 13. Portfolio & Marketing Rights

Free the Desk may reference the Client's name/logo and display screenshots of
the completed Site in its own portfolio, case studies, and marketing
materials, unless the Client opts out in writing.

## 14. General Provisions

- **Governing law / jurisdiction:** [state/territory, e.g., Western
  Australia].
- **Entire agreement:** this document plus the Scope of Work supersedes prior
  discussions; changes must be in writing.
- **Force majeure:** neither party is liable for delays caused by events
  outside reasonable control.
- **Notices:** sent to the email addresses on file, effective on sending.

## 15. Acceptance

| | Name | Signature | Date |
|---|---|---|---|
| Free the Desk | | | |
| Client | | | |

---

### Open decisions before this goes further

1. Fill in the bracketed commercial terms (fees, notice periods, revision
   counts, jurisdiction).
2. Decide whether "exclusive design" is a real product tier or just a
   talking point.
3. Get Section 6 and 7 specifically reviewed by a lawyer — they're the two
   clauses doing the most unusual work relative to a standard template.
4. Decide where this lives operationally: likely referenced from the
   `DealerSubscriptionTermsAcceptance` flow in `payments/`, as a linked
   document rather than inline text dealers click through.
