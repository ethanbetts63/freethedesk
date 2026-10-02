"""Settings for the freethedesk Django API."""

import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

from freetheplatform.auth import conf as ftp_auth_conf


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def _required(name):
    """An environment variable with no sensible default.

    Raising here beats defaulting: a value this site builds customer-facing
    URLs out of is either configured or it is not, and a plausible-looking
    fallback turns a configuration error into a silent one.
    """
    value = os.getenv(name)
    if not value:
        raise ImproperlyConfigured(f"{name} must be set.")
    return value


DEBUG = os.getenv("DEBUG", "False").lower() == "true"
SECRET_KEY = os.getenv("SECRET_KEY")
if not DEBUG:
    required_production_secrets = {
        "SECRET_KEY": SECRET_KEY,
        "STRIPE_SECRET_KEY": os.getenv("STRIPE_SECRET_KEY"),
        "STRIPE_WEBHOOK_SECRET": os.getenv("STRIPE_WEBHOOK_SECRET"),
    }
    missing = [name for name, value in required_production_secrets.items() if not value]
    if missing:
        raise ImproperlyConfigured(f"Missing required production secrets: {', '.join(missing)}")
configured_allowed_hosts = [
    host.strip()
    for host in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1,testserver").split(",")
    if host.strip()
]
ALLOWED_HOSTS = list(dict.fromkeys(["api.freethedesk.com.au", *configured_allowed_hosts]))

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    # Backs BLACKLIST_AFTER_ROTATION and logout revocation; pruned on login in the auth app below.
    "rest_framework_simplejwt.token_blacklist",
    "freetheplatform.auth",  # Cookie-JWT sessions plus their deployment checks.
    "core",
    "dealers",
    "documents",
    "identity",
    "sales",
    "seo",
    "payments",
    "freetheplatform.agreements",
    "freetheplatform.payments",
    "freetheplatform.readapi",  # Read-only access by token for the reporting agents.
    "freetheplatform.archive",  # `manage.py archive dump|restore` for development data.
    "freetheplatform.messaging",  # Last, so our template overrides the package's default.
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # Before anything that reads an address: trusts X-FTP-Client-IP only with the proxy secret.
    "freetheplatform.security.proxy.ForwardedClientMiddleware",
    "core.utils.middleware.NoCacheApiMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# MySQL everywhere, including tests, and no SQLite fallback. This used to select
# an engine from DB_ENGINE and default to SQLite, which meant an unset variable
# in a deployed environment silently ran the site on a local file rather than
# failing — and it meant the suite proved less than it looked like it did.
#
# The gap that mattered: `select_for_update()` has no effect on SQLite. Django
# does not raise, it ignores the lock, so a concurrency test passes while
# testing nothing. Unique constraints also differ (MySQL's default collation is
# case-insensitive, SQLite's is not), and SQLite has no index key-length limit,
# so a migration can apply in tests and fail on deploy.
#
# allbikes and bloomprint both name MySQL unconditionally; this now matches them.
# CI provisions no database — system checks never open a connection.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        # 127.0.0.1, not "localhost": the name resolves to ::1 first and MySQL
        # listens on IPv4, so every connection pays roughly two seconds waiting
        # for the IPv6 attempt to fail before falling back.
        "HOST": os.getenv("DB_HOST", "127.0.0.1"),
        "PORT": os.getenv("DB_PORT", "3306"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    # 12, not Django's default of 8: the throttle that would slow an online guess is
    # per-process and resets on restart, so length is the part we actually control.
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 12},
    },
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-au"
TIME_ZONE = "Australia/Perth"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
PRIVATE_MEDIA_ROOT = BASE_DIR / "private-media"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    # The only auth path — a session would be a second way in with no revocation
    # and no login throttle.
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "freetheplatform.auth.authentication.CookieJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    # Applies whatever scope a view declares, and nothing at all when a view
    # declares none — which is safe only because ftp_security.E006 refuses to
    # let a route answer without one.
    "DEFAULT_THROTTLE_CLASSES": ["freetheplatform.auth.throttling.ScopedRequestThrottle"],
    "NUM_PROXIES": 1,
    # No catch-all rate: an unscoped endpoint should fail ftp_security.W006's
    # route-coverage check, not fall through to a default. Grouped below by what
    # each group of numbers protects against.
    "DEFAULT_THROTTLE_RATES": {
        # Credential guessing; lockout does the actual blocking, so these stay
        # generous enough not to catch someone who forgot their password.
        "login": "5/minute",
        "password_reset": "5/hour",
        "password_change": "10/hour",
        # Cost/load — each accepted request writes a row and/or sends a message.
        "enquiry": "10/hour",
        "dealer-signup": "5/hour",
        "seo-signup": "5/hour",
        # Each accepted request mints a password and sends an email.
        "sale-link": "60/hour",
        # Redeeming a token the caller already holds grants nothing new, so this
        # is generous — it exists to bound a scripted sweep, not a person.
        "sale-access": "60/hour",
        # Not traffic — CPU. Typesetting a Schedule 5 contract is real work, and
        # it is reachable from the customer's side of the product by somebody
        # holding no account. Named for the cost rather than for the caller.
        "document-render": "120/hour",
        # Everything else, by who is calling rather than by what it does. None
        # of these is a security control — who may call them is settled by the
        # permission class — so each is set where a runaway client is stopped
        # and a person working normally never notices.
        "session": "600/hour",
        "staff": "2000/hour",
        # Staff setting a password or sending a reset link: credential-class.
        "staff_password": "30/hour",
        "portal": "600/hour",
        "public": "600/hour",
        "checkout": "20/hour",
        # A customer working through their own sale. Set where a runaway client
        # stops and a person filling in a form never notices.
        "sale-customer": "600/hour",
        "sale-upload": "60/hour",
        # One reporting agent paging tables; high enough for a full collection run.
        "read_api": "600/minute",
    },
}

# The ceiling on the request body itself, which is the only bound that applies
# before anything is parsed: a serializer's per-field maximums are checked after
# the body has already been read into memory. Django's own defaults, stated
# rather than inherited, so that raising one is a visible decision.
#
# Neither figure caps an uploaded dealer document — a file streams to disk and
# is governed by the upload pipeline's own byte, pixel and page limits.
DATA_UPLOAD_MAX_MEMORY_SIZE = 2621440  # 2.5 MiB
# Parsing is quadratic in the number of form fields, so an unbounded count is a
# cheap denial of service.
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000

# Separate cache for throttle counters so ordinary cache pressure can't evict an
# attacker's attempt count. Both are per-process and cleared on restart, which is
# why lockout is a database row instead — the durable line of defense.
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "default",
    },
    "throttling": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "throttling",
        "OPTIONS": {"MAX_ENTRIES": 10000},  # Generous — eviction is what this cache exists to avoid.
    },
}

# Everything else the package needs has a safe default; `manage.py ftp_auth_config`
# prints what's in force. Cookie prefix names the site so two of ours under one
# parent domain don't overwrite each other's session.
FTP_AUTH = {
    "COOKIE_PREFIX": "freethedesk",
    "PRINCIPAL": "core.principal.principal",
    "CREDENTIAL_RESOLVER": "freetheplatform.auth.credentials.username_or_email",
    # Package counts/mints; sending is ours since it owns the wording and reset URL.
    "LOCKOUT_NOTIFIER": "core.utils.auth_notifications.auth_alert",
    "PASSWORD_RESET_NOTIFIER": "core.utils.auth_notifications.send_password_reset",
    # The staff users pages: roles and activity, and telling an owner staff set
    # their password.
    "ACCOUNT_DIRECTORY": "core.account_directory.FreeTheDeskAccountDirectory",
    "PASSWORD_SET_NOTIFIER": "core.utils.auth_notifications.send_password_set",
}

# The Next server sends the visitor's address beside this secret; Vercel holds the
# same value. Unset, server-side calls are keyed on Vercel's egress address.
FTP_SECURITY = {"PROXY_SECRET": os.getenv("FTP_PROXY_SECRET", "")}

# Dumps hold customer data, so the root is git-ignored.
FTP_ARCHIVE = {"ROOT": BASE_DIR / "db_backups"}

# Django's token generator reads this directly, so it can't live inside FTP_AUTH.
PASSWORD_RESET_TIMEOUT = 60 * 60

# Derived from FTP_AUTH so token lifetimes and cookie max-ages can't drift apart.
SIMPLE_JWT = ftp_auth_conf.simple_jwt(FTP_AUTH)

CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")
    if origin.strip()
]

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 63072000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True

# Two `check --deploy` warnings are decisions, not oversights. They are silenced
# by name so the gate can be read as pass/fail: a gate that always prints two
# warnings is a gate people stop reading, and then the third one -- the real one
# -- arrives unnoticed. Remove an entry here the day the decision changes.
SILENCED_SYSTEM_CHECKS = [
    # SECURE_SSL_REDIRECT. The host does the HTTP-to-HTTPS redirect at the
    # edge. Django's copy would duplicate it, and because the test runner
    # forces DEBUG off it 301s every plain-HTTP test request.
    "security.W008",
    # SECURE_HSTS_PRELOAD. Preload is a one-way commitment binding every
    # present and future subdomain to HTTPS, and it takes a manual submission
    # to hstspreload.org that nothing here performs. Neither sibling sets it.
    "security.W021",
]

# No default. Stripe return URLs and every link in staff and customer email
# are built out of this, and a hard-coded localhost standing in for a
# missing variable is a production deploy that mails people a dead link.
SITE_URL = _required("SITE_URL").rstrip("/")
# Staff alert destination, read directly by senders in core, dealers and seo.
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")
ADMIN_NUMBER = os.getenv("ADMIN_NUMBER", "")

# No on/off switch: with no provider credentials, sends fail and are recorded
# with the missing setting named on the row.
FTP_MESSAGING = {
    "FROM_EMAIL": os.getenv("DEFAULT_FROM_EMAIL", "freethedesk <hello@freethedesk.com.au>"),
    "SITE_URL": SITE_URL,
    "MAILGUN": {
        "API_KEY": os.getenv("MAILGUN_API_KEY", ""),
        "DOMAIN": os.getenv("MAILGUN_DOMAIN", ""),
        "WEBHOOK_SIGNING_KEY": os.getenv("MAILGUN_WEBHOOK_SIGNING_KEY", ""),
    },
    "TWILIO": {
        "ACCOUNT_SID": os.getenv("TWILIO_ACCOUNT_SID", ""),
        "AUTH_TOKEN": os.getenv("TWILIO_AUTH_TOKEN", ""),
        "MESSAGING_SERVICE_SID": os.getenv("TWILIO_MESSAGING_SERVICE_SID", ""),
        "FROM_NUMBER": os.getenv("TWILIO_PHONE_NUMBER", ""),
    },
    "PAGINATION_CLASS": "core.utils.pagination.DashboardPagination",
}

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

FTP_PAYMENTS = {
    "SITE": "freethedesk",
    "SECRET_KEY": STRIPE_SECRET_KEY,
    "WEBHOOK_SECRET": STRIPE_WEBHOOK_SECRET,
    "SITE_URL": SITE_URL,
    # No CURRENCY: the package already defaults to "aud", and a site that
    # restates a default is a site that will not notice when the default moves.
    #
    # No tax configuration either. The entity taking these payments is not
    # registered for GST, so there is nothing for Stripe Tax to find and
    # nothing to declare. See _docs/stripe-subscriptions.md.
    #
    # Stripe stops retrying a failing event after about three days. Without
    # this, the first report of one is a dealer who paid and got nothing.
    "ALERT_HANDLER": "payments.alerts.alert_failed_event",
}
FTP_AGREEMENTS = {
    "DOCUMENTS": {
        "dealer.subscription": {
            "TITLE": "Dealer Subscription Terms",
            "VERSION": "2026-09-19",
            "SOURCE": BASE_DIR / "frontend" / "content" / "legal" / "dealer-subscription-terms.md",
            "FORMAT": "markdown",
        },
        "seo.reporting": {
            "TITLE": "SEO Subscription Terms",
            "VERSION": "2026-10-02",
            "SOURCE": BASE_DIR / "frontend" / "content" / "legal" / "seo-subscription-terms.md",
            "FORMAT": "markdown",
        },
    },
}
