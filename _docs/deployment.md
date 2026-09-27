# Deployment

Read [`../../freetheplatform/_docs/deployment-standard.md`](../../freetheplatform/_docs/deployment-standard.md)
first. It owns the family-wide GitHub credential, PythonAnywhere sequence and
backend/frontend ordering. This file records the FreeTheDesk-specific values.

## Runtime floors

- **Python 3.13** — the version selected for the PythonAnywhere web app. The
  virtualenv and both lockfiles must use 3.13; the host does not currently
  offer Python 3.14 for web apps.
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
mkvirtualenv --python=/usr/local/bin/python3.13 freethedesk
python -m pip install --upgrade pip pip-tools
which python
python --version
pip-sync /home/ethanbetts/freethedesk/requirements.txt
```

`which python` must print a path below
`/home/ethanbetts/.virtualenvs/freethedesk/`, and the version must be 3.13.
In the PythonAnywhere Web tab, set **Virtualenv** to:

```text
/home/ethanbetts/.virtualenvs/freethedesk
```

Later consoles re-enter it with `workon freethedesk`. Deployment commands may
also use the virtualenv's executables by absolute path; they must never call
`~/.local/bin/pip-sync` with the system Python.

## Before pulling

Back up MySQL and confirm production carries `SECRET_KEY`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL`, the database settings,
and the provider credentials used for email and SMS. Settings fail closed when
the first four production values are absent.

## Deploy

With the shared ordering guard in place and `workon freethedesk` active:

```bash
cd /home/ethanbetts/freethedesk
git pull --ff-only
pip-sync requirements.txt
python manage.py migrate
python manage.py check --deploy
python manage.py collectstatic --noinput
```

Then reload the PythonAnywhere web app. Restore Vercel's automatic build step
and redeploy the frontend only after the backend is healthy.
