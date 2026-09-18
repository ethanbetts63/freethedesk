from django.conf import settings
from django.contrib import admin
from django.urls import include, path


urlpatterns = []

# Django's admin is a local-development convenience only. It is deliberately not
# routed in production: staff work happens in the Next portals, and anything it
# cannot do is done from a manage.py shell, while it was the one password-guessing
# surface with no rate limit on it — DRF's throttle classes do not apply to it, so
# `/admin/login/` took unlimited attempts against `is_staff` accounts while
# `/api/token/` next door was capped by LoginRateThrottle. Those accounts reach
# every dealer, SEO subscriber and enquiry through the ORM.
#
# `django.contrib.admin` stays installed so this still works locally; removing the
# route is what removes the surface. Re-adding it to production means first putting
# brute-force protection in front of it.
if settings.DEBUG:
    urlpatterns += [path("admin/", admin.site.urls)]

urlpatterns += [
    path("api/", include("core.urls")),
    path("api/", include("dealers.urls")),
    path("api/", include("seo.urls")),
    path("api/payments/", include("payments.urls")),
    # Public, verified by provider signature rather than by authentication.
    path("api/webhooks/messaging/", include("freetheplatform.messaging.api.webhook_urls")),
]
