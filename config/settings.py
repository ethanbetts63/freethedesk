"""Settings for the freethedesk Django API."""

import os
from datetime import timedelta
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

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
    "core",
    "dealers",
    "seo",
    "payments",
    "freetheplatform.agreements",
    # Last, so a template of ours overrides the package's default of the same name.
    "freetheplatform.messaging",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
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

if os.getenv("DB_ENGINE", "sqlite") == "mysql":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": os.getenv("DB_NAME"),
            "USER": os.getenv("DB_USER"),
            "PASSWORD": os.getenv("DB_PASSWORD"),
            "HOST": os.getenv("DB_HOST", "localhost"),
            "PORT": os.getenv("DB_PORT", "3306"),
        }
    }
else:
    DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
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
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "core.utils.authentication.CookieJWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "NUM_PROXIES": 1,
    "DEFAULT_THROTTLE_RATES": {
        "anon": "250/day",
        "user": "10000/day",
        "login": "5/minute",
        "enquiry": "10/hour",
        "dealer-signup": "5/hour",
        "seo-signup": "5/hour",
    },
}

AUTH_COOKIE = "freethedesk_access"
AUTH_COOKIE_REFRESH = "freethedesk_refresh"
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": True,
    "SIGNING_KEY": SECRET_KEY,
}

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

SITE_URL = os.getenv("SITE_URL", "http://localhost:3000")
# Where staff alerts go. Read directly by the senders in core, dealers and seo.
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")
ADMIN_NUMBER = os.getenv("ADMIN_NUMBER", "")

# Shared messaging app. There is no on/off switch: with no provider credentials
# nothing is sent, and each attempt is recorded as failed with the missing
# setting named on the row.
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
FTP_AGREEMENTS = {
    "DOCUMENTS": {
        "dealer.subscription": {
            "TITLE": "Dealer Subscription Terms",
            "VERSION": "2026-09-05",
            "SOURCE": BASE_DIR / "frontend" / "content" / "legal" / "dealer-subscription-terms.md",
            "FORMAT": "markdown",
        },
        "seo.reporting": {
            "TITLE": "SEO Reporting & Audit Terms",
            "VERSION": "2026-09-09",
            "SOURCE": BASE_DIR / "frontend" / "content" / "legal" / "seo-subscription-terms.md",
            "FORMAT": "markdown",
        },
    },
}
