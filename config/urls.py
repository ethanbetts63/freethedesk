from django.conf import settings
from django.contrib import admin
from django.urls import include, path


urlpatterns = []

# Dev-only: DRF's throttles don't cover /admin/login/, so it was an
# unrate-limited guessing surface against is_staff accounts. Re-add to
# production only behind its own brute-force protection.
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
