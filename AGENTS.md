# Agent instructions

## Repository role

`freethedesk` is the FreeTheDesk dealer and operations product. It owns enquiries,
dealers, licensing, SEO and website services, its customer-facing presentation,
and site-owned legal content.

The sibling `../freetheplatform` repository contains reusable Django capabilities
and the canonical cross-project engineering policies. FreeTheDesk currently uses
its agreements and messaging capabilities.

## Read before changing

| Work                                                  | Required document                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| Any cross-project or reusable capability              | `../freetheplatform/_docs/strategy.md`                              |
| Frontend styling, Tailwind, CSS, lint, or breakpoints | `../freetheplatform/_docs/lint-rules.md`                            |
| Design tokens                                         | `../freetheplatform/_docs/token-contract.md`                        |
| FreeTheDesk Tailwind conversion                       | `_docs/tailwind-migration.md`                                       |
| Backend tests or test infrastructure                  | `../freetheplatform/_docs/testing-standard-backend.md`               |
| Frontend tests or test infrastructure                 | `../freetheplatform/_docs/testing-standard-frontend.md`              |
| Shared agent workflow or definition of done           | `../freetheplatform/_docs/agent-workflow.md`                        |
| Licensing                                             | `_docs/licensing/README.md` and the relevant plan/research file     |
| Stripe subscriptions                                  | `_docs/stripe-subscriptions.md`                                     |
| Security                                              | `_docs/security.md`                                                 |
| Any form (new, edited, or converted)                  | `../freetheplatform/_docs/forms-standard.md` and `_docs/forms-migration.md` |
| A role, portal, auth/session change, or edge routing  | `../freetheplatform/_docs/security-standard.md`                     |
| Structured data, schema.org, JSON-LD                  | `../freetheplatform/_docs/seo-standardisation.md` — read its sources first |
| Files under `frontend/`                               | `frontend/AGENTS.md` in addition to this file                       |

Read only the documents relevant to the issue; do not load the whole `_docs`
directory.

## Boundaries

- Product wording, offers, licensing workflows, enquiry handling, SEO/web
  services, and legal source documents remain site-owned.
- Use FreeThePlatform public APIs for shared agreement and messaging behaviour;
  do not reintroduce local substitutes.
- The dealership website builder previews a generated customer site and is a
  scoped second design system. Its exception is defined by the shared lint policy.
- The frontend follows the shared Tailwind v4 architecture. Remaining CSS files
  are foundations or named exceptions; `_docs/tailwind-migration.md` records how
  it got there rather than what is still planned.
- Shared package changes require package tests plus focused FreeTheDesk
  integration verification.
- Changing a page's content means bumping its `updated` date in
  `frontend/src/lib/pages.ts` in the same commit — that date is the sitemap's
  `<lastmod>` and the schema `dateModified`, and nothing can derive it for you.
- Preserve unrelated worktree changes. Do not reset, overwrite, or broadly
  reformat files outside the issue.
- Do not spin up subagents (Task/Agent tool calls) unless the user explicitly
  asks for it.

## Verification

| Changed area              | Commands from repository root                                                           |
| ------------------------- | --------------------------------------------------------------------------------------- |
| Django/Python             | `py -m pytest <relevant paths>`; broaden to `py -m pytest` when warranted               |
| Django models             | `py manage.py makemigrations --check --dry-run` plus relevant tests                     |
| Frontend static checks    | `Set-Location frontend; npm run check`                                                  |
| Frontend production build | `Set-Location frontend; npm run build`                                                  |
| Documentation only        | Prettier for changed Markdown where available, link/path checks, and `git diff --check` |

## Definition of done

See the shared criteria in
[`../freetheplatform/_docs/agent-workflow.md`](../freetheplatform/_docs/agent-workflow.md#definition-of-done).
Locally, that means FreeTheDesk-only behaviour is documented under `_docs/`
rather than in FreeThePlatform.
