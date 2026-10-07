# FreeTheDesk

FreeTheDesk is a dealer and operations-systems product. This repository contains
a Django API and Next.js frontend for enquiries, dealer accounts, licensing,
subscription checkout, SEO/web services, staff workflows, and the public site.

Shared agreement and messaging capabilities come from the sibling
`../freetheplatform` package. FreeTheDesk owns its product workflows, wording,
offers, presentation, and legal source documents.

## Run locally

Backend:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver
```

Frontend, in another terminal:

```powershell
Set-Location frontend
npm install
npm run dev
```

The API runs at `http://127.0.0.1:8000`; its health endpoint is `/api/health/`.
The frontend runs at `http://localhost:3000` and proxies `/api/*` through
`DJANGO_API_URL`.

## Verify

```powershell
.\.venv\Scripts\python.exe -m pytest
Set-Location frontend
npm run check
npm run build
```

### Security checks

```powershell
.\scripts\check-security.ps1
```

Everything the shared standard lists as checked — cookie and TLS settings, the
unrouted admin, the single authentication path, a throttle scope on every route,
a rate for every scope, the request-body ceiling — plus Django's own deployment
checks and the Stripe configuration checks. Seconds; no database connection.

The script exists rather than a line in this file because the checks are all
deliberate no-ops under `DEBUG` — local work runs on plain HTTP, and complaining
about that would train everybody to ignore the output. `.env` sets `DEBUG=True`,
so `manage.py check --deploy` run plainly reports nothing while looking exactly
like a pass. Turning `DEBUG` off then makes settings demand four values only
production carries, two of which are shape-checked, so the script supplies
placeholders, runs the check, and puts the environment back. Read it: every
value has a comment saying which check it satisfies, and none of them is a
credential.

Two warnings are expected and correct: `security.W008`, because the host does
the HTTP-to-HTTPS redirect rather than Django, and `security.W021`, because the
domain is not on the browser preload list. Anything else is a finding.

Run it before committing a change to settings, a URLconf, a serializer or a
throttle. **There is no CI here** — see the shared standard, §19, for why.

### The commit hook

```powershell
git config core.hooksPath .githooks
```

**Once per clone, by hand.** `.git/` is never committed, so a fresh clone has no
hooks and says nothing about it — a missing hook looks exactly like a passing
one. That one line points git at the tracked `.githooks/` directory instead.

`.githooks/pre-commit` runs the security script on every commit, and adds a
whole-project typecheck plus a Prettier check on the staged files when anything
under `frontend/` is involved. About five seconds for a backend commit, fifteen for a frontend one. It is deliberately not the full suite:
a hook that takes minutes is a hook people bypass, and a rule bypassed once
stops being one. `py -m pytest` and `npm run check` stay where the Verification
table in `AGENTS.md` puts them — run by whoever changed that area.

### Monthly: audit the lockfile

```powershell
py -m pip install --user pip-audit
py -m pip_audit --requirement requirements.txt
```

This asks the public vulnerability databases whether anything pinned in the
lockfile carries a _published_ advisory. It is about the dependencies, not this
code, so it is a calendar job rather than a per-commit one: an advisory lands
when somebody else publishes it. `freetheplatform` installs from git rather than
PyPI and is reported as unauditable; its own dependencies resolve into this
lockfile and are covered.

## Main areas

| Path        | Responsibility                                                         |
| ----------- | ---------------------------------------------------------------------- |
| `core/`     | Enquiries, dashboard APIs, notifications, and shared product behaviour |
| `dealers/`  | Dealer accounts and dealer-facing domain behaviour                     |
| `payments/` | Stripe subscriptions, checkout, and agreement capture                  |
| `seo/`      | SEO product behaviour and supporting APIs                              |
| `frontend/` | Public site, checkout, and staff portal                                |

## Documentation

| Topic                                       | Source                                                                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Agent instructions                          | [`AGENTS.md`](AGENTS.md)                                                                                         |
| Deployment                                  | [`_docs/deployment.md`](_docs/deployment.md)                                                                     |
| All product documentation                   | [`_docs/README.md`](_docs/README.md)                                                                             |
| Backend tests and local fixtures            | [`../freetheplatform/_docs/testing-standard-backend.md`](../freetheplatform/_docs/testing-standard-backend.md)   |
| Frontend tests                              | [`../freetheplatform/_docs/testing-standard-frontend.md`](../freetheplatform/_docs/testing-standard-frontend.md) |
| Notifications                               | [`_docs/notifications.md`](_docs/notifications.md)                                                               |
| Stripe subscriptions and agreement evidence | [`_docs/stripe-subscriptions.md`](_docs/stripe-subscriptions.md)                                                 |
| Licensing                                   | [`_docs/licensing/README.md`](_docs/licensing/README.md)                                                         |
| Security                                    | [`../freetheplatform/_docs/security-standard.md`](../freetheplatform/_docs/security-standard.md)                 |
| Personal data                               | [`_docs/pii_inventory.md`](_docs/pii_inventory.md)                                                               |
| Tailwind migration                          | [`_docs/tailwind-migration.md`](_docs/tailwind-migration.md)                                                     |
| Shared strategy, testing, lint, and tokens  | `../freetheplatform/_docs/README.md`                                                                             |

Apply migrations and run `py manage.py createsuperuser` to access the local staff
dashboard at `/login`.
