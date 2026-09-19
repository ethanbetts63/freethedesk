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
py -m venv .venv
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
py -m pytest
Set-Location frontend
npm run check
npm run build
```

## Main areas

| Path        | Responsibility                                                         |
| ----------- | ---------------------------------------------------------------------- |
| `core/`     | Enquiries, dashboard APIs, notifications, and shared product behaviour |
| `dealers/`  | Dealer accounts and dealer-facing domain behaviour                     |
| `payments/` | Stripe subscriptions, checkout, and agreement capture                  |
| `seo/`      | SEO product behaviour and supporting APIs                              |
| `frontend/` | Public site, checkout, generated-site builder, and staff portal        |

## Documentation

| Topic                                       | Source                                                                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Agent instructions                          | [`AGENTS.md`](AGENTS.md)                                                                                         |
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
