# Deployment

Read [`../../freetheplatform/_docs/deployment-standard.md`](../../freetheplatform/_docs/deployment-standard.md)
first. It owns the family-wide GitHub credential, PythonAnywhere sequence and
backend/frontend ordering. This file records the FreeTheDesk-specific values.

## Runtime floors

- **Python 3.12** — the version selected for the PythonAnywhere web app. The
  virtualenv and both lockfiles must use 3.12. The host's user-level
  `pip-sync` currently runs under 3.13, but that is not the interpreter serving
  this application.
- **`Django<6.1`** — PythonAnywhere serves MySQL 8.0.42, while Django 6.1
  requires MySQL 8.4. Moving Django means moving the database first.
- **FreeThePlatform v0.25.0 or later** — v0.25.0 is the first release that
  supports both Python 3.13 and Django 6.0. The previous v0.22.0 metadata
  required Python 3.14 and cannot be installed on this host.

## First-time virtualenv setup

Run this from a PythonAnywhere Bash console. Never run `pip-sync` against the
system interpreter: it will try to uninstall PythonAnywhere's root-owned
packages.

```bash
python3.12 -m venv /home/ethanbetts/freethedesk/venv
source /home/ethanbetts/freethedesk/venv/bin/activate
python -m pip install --upgrade pip pip-tools
which python
python --version
python -m piptools sync /home/ethanbetts/freethedesk/requirements.txt
```

`which python` must print a path below
`/home/ethanbetts/freethedesk/venv/`, and the version must be 3.12.
In the PythonAnywhere Web tab, set **Virtualenv** to:

```text
/home/ethanbetts/freethedesk/venv
```

Later consoles re-enter it with
`source /home/ethanbetts/freethedesk/venv/bin/activate`. Invoke sync as
`python -m piptools sync`, not bare `pip-sync`: Bash can retain the old
`~/.local/bin/pip-sync` command in its lookup cache after activation, which
runs under Python 3.13 and targets PythonAnywhere's system packages.

## Before pulling

Back up MySQL and confirm production carries `SECRET_KEY`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL`, the database settings,
and the provider credentials used for email and SMS. Settings fail closed when
the first four production values are absent.

Set `FTP_PROXY_SECRET` — the same 32 or more random characters — in both the
PythonAnywhere web app's environment and Vercel's server environment (never
`NEXT_PUBLIC_`). Server Actions send it beside the visitor's address, and Django
believes that address only when the two match; unset, every server-side call is
throttled and logged as Vercel's egress address, and `check --deploy` warns
(`ftp_security.W008`). See
[security-standard.md §6](../../freetheplatform/_docs/security-standard.md#6-client-addresses).

## Deploy

With the shared ordering guard in place and `workon freethedesk` active:

```bash
cd /home/ethanbetts/freethedesk
git pull --ff-only
python -m piptools sync requirements.txt
python manage.py migrate
python manage.py check --deploy
python manage.py collectstatic --noinput
```

Then reload the PythonAnywhere web app. Restore Vercel's automatic build step
and redeploy the frontend only after the backend is healthy.
