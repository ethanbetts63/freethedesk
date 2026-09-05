# Pricing — Draft

> **Status: draft for internal review.** Structure agreed in conversation on
> 2026-09-05. This maps to the payment/ownership terms in
> [`webdev-contract-draft-terms.md`](./webdev-contract-draft-terms.md) —
> Section 2 (checkpoints), Section 3 (fees), Section 6 (license), and Section
> 7 (hosting options). Update that file if the numbers below change in a way
> that affects contract language.

## Step 1 — Discovery: free

A short call (**cap at 30–45 min**) to understand what the client actually
needs — features at the functional level (inventory, service booking, parts,
etc.), not implementation detail. This feeds the Scope of Work under Section
2 of the contract, including the discretion clause: named features, loose on
how.

If a client wants more than a single call before committing — written specs,
multiple scoping sessions, mockups before signing — that's a paid mini-
engagement, not part of free discovery. Worth a one-line internal rule so
this doesn't quietly become unpaid consulting.

## Step 2 — Development

- **Range:** $2,500–$50,000 AUD. **Average project: ~$7,500 AUD.**
- **Public-facing number:** show *"from $2,500 — most projects land around
  $7,500"*. Don't publish the $50k ceiling on the site itself; a 20x public
  range anchors badly in both directions (small clients assume they can't
  afford you, larger clients anchor low). The real number comes out of
  discovery once scope is known.
- **Payment structure:**
  - **Under ~$15,000:** flat 50% deposit to start / 50% on completion —
    standard, no change needed at this size.
  - **Above ~$15,000:** milestone-based instead of flat 50/50 — e.g. 30%
    deposit / 40% at the midpoint checkpoint / 30% on completion. This ties
    naturally to the per-feature checkpoint reviews already in the contract
    (Section 2) — the mid-build payment lands at a point the client has
    already seen and signed off on, not a surprise.
- GST: confirm whether quoted figures are GST-inclusive and state it plainly
  next to the numbers.

## Step 3 — Ongoing

Three separate line items — keep them visually distinct on the pricing page
so "ongoing cost" doesn't read as one vague number:

1. **Maintenance retainer** — bug fixes, updates, content changes. **[amount
   / period — e.g. $X/month]**. Define what's included vs. billable as a
   Change Request (ties to Section 5 of the contract).
2. **SEO improvement — optional add-on.** **[amount / period]**, sold
   separately from base maintenance.
3. **Hosting — only if the client chose Free the Desk–Managed
   Infrastructure** (Section 7, Option B). **[amount / period]**. Not
   charged at all if the client chose Client-Owned Infrastructure (Option A)
   — they pay their own host directly.

**Explicitly excluded from all of the above:** third-party running costs —
hosting provider fees (for Option A clients), domain registration/renewal,
paid third-party services (SMS, email sending, payment processing fees,
etc.). State this once, clearly, rather than as a buried caveat.

## Suggested page structure

1. Hero: three-step framing (Discovery → Development → Ongoing), each
   with one line, matching the numbered-step pattern already used in
   `automation/page.tsx` (Map it / Prove it / Run it) and
   `website-development-perth` (Understand / Design / Build / Improve).
2. Step 1 card: **Free**, one line on what happens in the call.
3. Step 2 card: **From $2,500** with the "most projects ~$7,500" line, the
   50/50-vs-milestone split explained in plain language (no need to expose
   the internal $15k threshold as a hard rule — frame it as "for larger
   builds, payment follows the build's milestones").
4. Step 3 card: the three line items above, presented separately, with the
   hosting line conditional on which infrastructure option they picked
   during onboarding.
5. Trust line near the CTA: **Perth-based · working with businesses across
   Australia** (matches the hero trust line added to `FlowHeroConcept` and
   `HomeHero`).
6. CTA: free discovery call, consistent with the "discovery is always free"
   principle — don't let a different page on the site imply otherwise.

## Open decisions before this goes live

1. Fill in the maintenance/SEO/hosting dollar amounts — currently
   placeholders.
2. Confirm GST treatment and state it next to the numbers.
3. Decide the actual milestone-payment threshold (used $15k as a working
   example above) and whether it's a hard rule or case-by-case.
4. Build the actual `/pricing` page once this wording is approved — it
   doesn't exist yet in `frontend/src/app/`.
